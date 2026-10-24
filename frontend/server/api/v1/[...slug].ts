import { defineEventHandler, getRouterParam, getMethod, getQuery, readBody, setResponseStatus } from 'h3'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function generateRfc7519Jwt(payload: Record<string, any>, secret: string = 'bma-emarket-jwt-secret-key-2026'): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  }))
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

type MockActor = { id: number; username: string; role: 'admin' | 'staff' | 'tenant' }

const MOCK_USERS: Record<string, MockActor & { password: string; full_name: string; phone?: string; citizen_id?: string }> = {
  admin: { id: 1, username: 'admin', role: 'admin', password: 'admin1234', full_name: 'ผู้ดูแลระบบตลาด กทม. (Admin)' },
  staff: { id: 2, username: 'staff', role: 'staff', password: 'staff1234', full_name: 'เจ้าหน้าที่ตลาด (Staff)' },
  tenant: { id: 3, username: 'tenant', role: 'tenant', password: 'tenant1234', full_name: 'สมชาย ใจดี', phone: '081-234-5678', citizen_id: '1-1004-99887-12-3' },
  tenant2: { id: 4, username: 'tenant2', role: 'tenant', password: 'tenant21234', full_name: 'นภาพร รัตนศิลป์', phone: '089-111-2233', citizen_id: '1-1005-44221-55-6' }
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized + '='.repeat((4 - normalized.length % 4) % 4), 'base64').toString('utf8')
}

function getMockActor(event: any): MockActor | null {
  const authHeader = String(event.node.req.headers.authorization || '')
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return null

  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) return null
  const expectedSignature = crypto.createHmac('sha256', 'bma-emarket-jwt-secret-key-2026')
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    const id = Number(payload.user_id)
    const username = String(payload.username || '')
    const role = String(payload.role || '') as MockActor['role']
    if (!Number.isInteger(id) || !username || !['admin', 'staff', 'tenant'].includes(role) || (payload.exp && Number(payload.exp) < Math.floor(Date.now() / 1000))) return null
    return { id, username, role }
  } catch {
    return null
  }
}

function unauthorizedResponse(event: any, message = 'กรุณาเข้าสู่ระบบก่อนดำเนินการ') {
  setResponseStatus(event, 401)
  return { status: false, code: 401, message }
}

function forbiddenResponse(event: any, message = 'คุณไม่มีสิทธิ์ดำเนินการนี้') {
  setResponseStatus(event, 403)
  return { status: false, code: 403, message }
}

// 12 Bangkok Markets Dataset (Official BMA Markets)
const MARKETS_DATA = [
  {
    id: 1,
    slug: 'chatuchak',
    name: 'ตลาดนัดจตุจักร',
    name_en: 'Chatuchak Weekend Market',
    district: 'เขตจตุจักร',
    address: '587/10 ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    lat: 13.79996,
    lng: 100.55047,
    status: 'open',
    total_stalls: 1500,
    available_stalls: 12,
    starting_price_daily: 120,
    starting_price_monthly: 1800,
    image_url: '/images/markets/chatuchak.jpg',
    tags: ['ตลาดนัดสุดสัปดาห์', 'BTS หมอชิต / MRT สวนจตุจักร', 'มีที่จอดรถ 800+ คัน'],
    category: 'weekend',
    operating_hours: 'เสาร์ - อาทิตย์ 09:00 - 18:00 น.',
    description: 'ศูนย์รวมการค้าปลีกกลางแจ้งที่ใหญ่ที่สุดในโลก สินค้าแฟชั่น ของแต่งบ้าน งานคราฟต์ อาหาร และต้นไม้',
    has_event: true,
    event_title: 'Weekend Craft & Fashion Market'
  },
  {
    id: 2,
    slug: 'pracha-niwet-1',
    name: 'ตลาดประชานิเวศน์ 1',
    name_en: 'Pracha Niwet 1 Market',
    district: 'เขตจตุจักร',
    address: 'ถนนเทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
    lat: 13.8441,
    lng: 100.5489,
    status: 'open',
    total_stalls: 180,
    available_stalls: 8,
    starting_price_daily: 150,
    starting_price_monthly: 2200,
    image_url: '/images/markets/pracha_niwet.jpg',
    tags: ['อาหารปรุงสำเร็จ', 'ผักผลไม้สด', 'รถเมล์สาย 67, 70'],
    category: 'fresh_market',
    operating_hours: 'ทุกวัน 05:00 - 19:00 น.',
    description: 'ตลาดสดและอาหารสำเร็จรูปชื่อดังย่านประชานิเวศน์ สะอาด ปลอดภัย สินค้าคุณภาพดีเพื่อคนเมือง',
    has_event: false,
    event_title: null
  },
  {
    id: 3,
    slug: 'min-buri',
    name: 'ตลาดมีนบุรี',
    name_en: 'Min Buri Market',
    district: 'เขตมีนบุรี',
    address: 'ถนนสีหบุรานุกิจ แขวงมีนบุรี เขตมีนบุรี กรุงเทพฯ 10510',
    lat: 13.8139,
    lng: 100.7188,
    status: 'open',
    total_stalls: 450,
    available_stalls: 15,
    starting_price_daily: 100,
    starting_price_monthly: 1500,
    image_url: '/images/markets/min_buri.jpg',
    tags: ['รถไฟฟ้าสายสีชมพู (สถานีตลาดมีนบุรี)', 'ศูนย์ค้าปลีก-ส่ง', 'มีที่จอดรถ'],
    category: 'metro',
    operating_hours: 'ทุกวัน 04:00 - 20:00 น.',
    description: 'ศูนย์กลางตลาดค้าส่ง-ปลีกฝั่งกรุงเทพฯ ตะวันออก เชื่อมต่อการเดินทางด้วยรถไฟฟ้าสายสีชมพู',
    has_event: true,
    event_title: 'ตลาดนัดสินค้าชุมชนมีนบุรี'
  },
  {
    id: 4,
    slug: 'singhanat',
    name: 'ตลาดสิงหา',
    name_en: 'Singhanat Market',
    district: 'เขตคลองเตย',
    address: 'ซอยสุขุมวิท 22 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    lat: 13.7285,
    lng: 100.5642,
    status: 'open',
    total_stalls: 90,
    available_stalls: 4,
    starting_price_daily: 180,
    starting_price_monthly: 2500,
    image_url: '/images/markets/singhanat.jpg',
    tags: ['MRT ศูนย์สิริกิติ์', 'ย่านธุรกิจสุขุมวิท', 'อาหารและเครื่องดื่ม'],
    category: 'metro',
    operating_hours: 'จันทร์ - ศุกร์ 06:00 - 15:00 น.',
    description: 'ตลาดชุมชนใจกลางสุขุมวิท 22 รองรับกลุ่มคนทำงานออฟฟิศ นักท่องเที่ยว และผู้อยู่อาศัยในพื้นที่',
    has_event: false,
    event_title: null
  },
  {
    id: 5,
    slug: 'thewarat',
    name: 'ตลาดเทวราช',
    name_en: 'Thewarat Market',
    district: 'เขตดุสิต',
    address: 'ถนนพิษณุโลก แขวงสี่แยกมหานาค เขตดุสิต กรุงเทพฯ 10300',
    lat: 13.7712,
    lng: 100.5050,
    status: 'open',
    total_stalls: 260,
    available_stalls: 7,
    starting_price_daily: 120,
    starting_price_monthly: 1800,
    image_url: '/images/markets/thewarat.jpg',
    tags: ['🚤 ท่าเรือเทเวศร์', '🌸 ไม้ดอกไม้ประดับ', '🥦 ผักสดปลอดสาร'],
    category: 'fresh_market',
    operating_hours: 'ทุกวัน 04:00 - 18:00 น.',
    description: 'ตลาดเก่าแก่ริมแม่น้ำเจ้าพระยา แหล่งรวมต้นไม้ พืชสวน ผักผลไม้สดคุณภาพสูง',
    has_event: true,
    event_title: 'Green Living & Organic Pop-up'
  },
  {
    id: 6,
    slug: 'rat-burana',
    name: 'ตลาดราษฎร์บูรณะ',
    name_en: 'Rat Burana Market',
    district: 'เขตราษฎร์บูรณะ',
    address: 'ถนนราษฎร์บูรณะ แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ 10140',
    lat: 13.6823,
    lng: 100.5034,
    status: 'open',
    total_stalls: 140,
    available_stalls: 6,
    starting_price_daily: 90,
    starting_price_monthly: 1400,
    image_url: '/images/markets/rat_burana.jpg',
    tags: ['🦀 อาหารทะเลสด', '🌊 ทำเลริมแม่น้ำ', '🚌 สาย 6, 17, 37'],
    category: 'fresh_market',
    operating_hours: 'ทุกวัน 05:00 - 19:00 น.',
    description: 'ตลาดสดชุมชนฝั่งธนบุรี โดดเด่นด้านอาหารทะเลสดใหม่ และอาหารพื้นบ้านรสเลิศ',
    has_event: false,
    event_title: null
  },
  {
    id: 7,
    slug: 'bang-kapi',
    name: 'ตลาดบางกะปิ',
    name_en: 'Bang Kapi Market',
    district: 'เขตบางกะปิ',
    address: 'ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ 10240',
    lat: 13.7661,
    lng: 100.6444,
    status: 'open',
    total_stalls: 320,
    available_stalls: 11,
    starting_price_daily: 130,
    starting_price_monthly: 1900,
    image_url: '/images/markets/bang_kapi.jpg',
    tags: ['🚝 MRT สายสีเหลือง (สถานีบางกะปิ)', '🚤 ท่าเรือเดอะมอลล์บางกะปิ', '👔 เสื้อผ้าแฟชั่น'],
    category: 'metro',
    operating_hours: 'ทุกวัน 06:00 - 21:00 น.',
    description: 'ย่านการค้าสำคัญฝั่งตะวันออก เดินทางสะดวกด้วยรถไฟฟ้าสายสีเหลืองและเรือคลองแสนแสบ',
    has_event: false,
    event_title: null
  },
  {
    id: 8,
    slug: 'wongwian-lek',
    name: 'ตลาดพระเครื่องวงเวียนเล็ก',
    name_en: 'Wongwian Lek Amulet Market',
    district: 'เขตคลองสาน',
    address: 'ซอยสมเด็จเจ้าพระยา แขวงสมเด็จเจ้าพระยา เขตคลองสาน กรุงเทพฯ 10600',
    lat: 13.7335,
    lng: 100.4965,
    // Availability is synchronized from the real stall records below. Keeping
    // this market hard-coded as `full` forces every stall to `occupied`, even
    // when the imported market plan contains available stalls.
    status: 'open',
    total_stalls: 120,
    available_stalls: 0,
    starting_price_daily: 160,
    starting_price_monthly: 2400,
    image_url: '/images/markets/wongwian_lek.jpg',
    tags: ['🚝 รถไฟฟ้าสายสีทอง (สถานีคลองสาน)', '🏺 ศูนย์รวมพระเครื่อง'],
    category: 'popular',
    operating_hours: 'ทุกวัน 08:00 - 17:00 น.',
    description: 'ศูนย์พระเครื่องชั้นนำระดับประเทศ เป็นที่นิยมของเซียนพระและนักสะสมทั่วประเทศ',
    has_event: false,
    event_title: null
  },
  {
    id: 9,
    slug: 'nong-chok',
    name: 'ตลาดหนองจอก',
    name_en: 'Nong Chok Market',
    district: 'เขตหนองจอก',
    address: 'ถนนมิตรไมตรี แขวงหนองจอก เขตหนองจอก กรุงเทพฯ 10530',
    lat: 13.8564,
    lng: 100.8641,
    status: 'open',
    total_stalls: 210,
    available_stalls: 14,
    starting_price_daily: 80,
    starting_price_monthly: 1200,
    image_url: '/images/markets/nong_chok.jpg',
    tags: ['🕌 อาหารฮาลาล', '🌾 ผลผลิตเกษตรชุมชน', '🅿️ จอดรถสะดวก'],
    category: 'fresh_market',
    operating_hours: 'ทุกวัน 05:00 - 18:00 น.',
    description: 'ตลาดชุมชนชานเมืองกรุงเทพฯ ศูนย์กลางอาหารฮาลาลและผลิตผลเกษตรอินทรีย์คุณภาพดี',
    has_event: false,
    event_title: null
  },
  {
    id: 10,
    slug: 'ratchadaphisek',
    name: 'ตลาดรัชดาภิเษก',
    name_en: 'Ratchadaphisek Market',
    district: 'เขตธนบุรี',
    address: 'ถนนรัชดาภิเษก แขวงดาวคะนอง เขตธนบุรี กรุงเทพฯ 10600',
    lat: 13.7088,
    lng: 100.4823,
    status: 'open',
    total_stalls: 160,
    available_stalls: 9,
    starting_price_daily: 140,
    starting_price_monthly: 2000,
    image_url: '/images/markets/ratchada.jpg',
    tags: ['🚝 BTS ตลาดพลู / BRT ราชพฤกษ์', '🍱 สตรีทฟู้ด', '🥐 ขนมไทยโบราณ'],
    category: 'metro',
    operating_hours: 'ทุกวัน 06:00 - 20:00 น.',
    description: 'ตลาดสดและสตรีทฟู้ดย่านตลาดพลู แหล่งรวมของอร่อยสำหรับคนทำงานและครอบครัว',
    has_event: false,
    event_title: null
  },
  {
    id: 11,
    slug: 'thonburi-sanamluang-2',
    name: 'ตลาดธนบุรี (สนามหลวง 2)',
    name_en: 'Thonburi Market (Sanam Luang 2)',
    district: 'เขตทวีวัฒนา',
    address: 'ถนนเลียบคลองทวีวัฒนา แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพฯ 10170',
    lat: 13.7479,
    lng: 100.3542,
    status: 'open',
    total_stalls: 800,
    available_stalls: 22,
    starting_price_daily: 100,
    starting_price_monthly: 1500,
    image_url: '/images/markets/thonburi.jpg',
    tags: ['🐶 โซนสัตว์เลี้ยง', '🪴 ตลาดต้นไม้ใหญ่', '🅿️ ที่จอดรถกว่า 1,200 คัน'],
    category: 'popular',
    operating_hours: 'ทุกวัน 08:00 - 18:00 น.',
    description: 'ตลาดนัดสุดสัปดาห์ฝั่งธนบุรี บรรยากาศร่มรื่น ศูนย์รวมสัตว์เลี้ยง ต้นไม้ ของสะสม และงานฝีมือ',
    has_event: true,
    event_title: 'Food Festival & Music Fest 2026'
  },
  {
    id: 12,
    slug: 'bang-khae-phirom',
    name: 'ตลาดบางแคภิรมย์',
    name_en: 'Bang Khae Phirom Market',
    district: 'เขตบางแค',
    address: 'ซอยเพชรเกษม 69 แขวงหลักสอง เขตบางแค กรุงเทพฯ 10160',
    lat: 13.6896,
    lng: 100.3807,
    status: 'open',
    total_stalls: 190,
    available_stalls: 5,
    starting_price_daily: 110,
    starting_price_monthly: 1600,
    image_url: '/images/markets/bang_khae.jpg',
    tags: ['🌳 ติดสวนสาธารณะ', '🏃‍♂️ ตลาดคนรักสุขภาพ', '🚇 MRT หลักสอง (5 นาที)'],
    category: 'popular',
    operating_hours: 'ทุกวัน 06:00 - 20:00 น.',
    description: 'ตลาดริมสวนสุขภาพบางแคภิรมย์ บรรยากาศโปร่งสบาย เหมาะกับสินค้าเพื่อสุขภาพและอาหารครอบครัว',
    has_event: false,
    event_title: null
  }
]

// Number of rentable stalls in each client-side GIS layout after excluding
// overview boundary projects. Production serverless runtimes serve these JSON
// files as static assets and cannot reliably read them via fs, so this compact
// summary keeps market cards consistent with the detail-page GIS calculation.
const GIS_MARKET_STALL_TOTALS: Record<string, number> = {
  'chatuchak': 9522,
  'pracha-niwet-1': 528,
  'min-buri': 2029,
  'singhanat': 91,
  'thewarat': 475,
  'rat-burana': 1,
  'bang-kapi': 710,
  'wongwian-lek': 648,
  'nong-chok': 268,
  'ratchadaphisek': 128,
  'thonburi-sanamluang-2': 4263,
  'bang-khae-phirom': 624
}

// Events Dataset
const EVENTS_DATA = [
  {
    id: 1,
    market_id: 1,
    market_name: 'ตลาดนัดจตุจักร (โครงการ 23)',
    title: 'Weekend Craft & Fashion Market',
    date_range: '25 - 26 ต.ค. 2026 (09:00 - 18:00 น.)',
    location_detail: 'โซนลานกิจกรรมพิเศษ โครงการ 23 ตลาดนัดจตุจักร',
    vacancies_count: 12,
    is_open: true,
    badge: 'รับสมัครผู้ค้า',
    image_url: '/images/markets/chatuchak.jpg'
  },
  {
    id: 2,
    market_id: 11,
    market_name: 'ตลาดธนบุรี (สนามหลวง 2)',
    title: 'Food Festival & Music Fest 2026',
    date_range: '1 - 3 พ.ย. 2026 (10:00 - 20:00 น.)',
    location_detail: 'ลานน้ำพุกลางแจ้ง ตลาดธนบุรี (สนามหลวง 2)',
    vacancies_count: 18,
    is_open: true,
    badge: 'รับสมัครผู้ค้า',
    image_url: '/images/markets/thonburi.jpg'
  },
  {
    id: 3,
    market_id: 5,
    market_name: 'ตลาดเทวราช ดุสิต',
    title: 'Green Living & Organic Pop-up',
    date_range: '8 - 10 พ.ย. 2026 (08:00 - 17:00 น.)',
    location_detail: 'โซนริมน้ำ ท่าเรือเทเวศร์ ตลาดเทวราช',
    vacancies_count: 3,
    is_open: true,
    badge: 'รับสมัครผู้ค้า',
    image_url: '/images/markets/thewarat.jpg'
  }
]

// Real Stalls Loader from 12 Official BMA Markets
function getMarketsDir() {
  const candidates = [
    path.resolve(process.cwd(), 'frontend/public/data/markets'),
    path.resolve(process.cwd(), 'public/data/markets'),
    path.resolve(process.cwd(), '../frontend/public/data/markets')
  ]
  return candidates.find(c => fs.existsSync(c)) || candidates[0]
}

interface MasterStallRecord {
  id: string | number
  stall_number: string
  ident: string
  stall_ident: string
  market_id?: number
  market_slug: string
  market_name: string
  project_id: string
  project_name: string
  zone: string
  zone_name: string
  zone_code?: string
  category: string
  size_sqm: number
  monthly_rate: number
  daily_rate: number
  entry_fee?: number
  deposit_fee?: number
  status: 'available' | 'reserved' | 'occupied' | 'maintenance'
  coordinates?: any
  center?: [number, number]
}

const REAL_STALLS_MAP = new Map<string, MasterStallRecord>()
const REAL_STALLS_DATA: MasterStallRecord[] = []

function pointInPolygonServer([x, y]: [number, number], poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i]
    const pj = poly[j]
    if (!pi || !pj) continue
    const [xi, yi] = pi
    const [xj, yj] = pj
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function projectFootprintAreaServer(project: any): number {
  const ring = project?.coordinates || []
  let twiceArea = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const current = ring[i]
    const next = ring[i + 1]
    if (!current || !next) continue
    twiceArea += current[0] * next[1] - next[0] * current[1]
  }
  return Math.abs(twiceArea) / 2
}

function isOverviewBoundaryProjectServer(candidate: any, source: any[]): boolean {
  const candidateArea = projectFootprintAreaServer(candidate)
  const containedProjects = source.filter(project => (
    project.id !== candidate.id &&
    candidateArea > projectFootprintAreaServer(project) * 3 &&
    Array.isArray(project.centroid) &&
    Array.isArray(candidate.coordinates) &&
    pointInPolygonServer(project.centroid as [number, number], candidate.coordinates)
  ))
  return containedProjects.length >= 2
}

function loadAllRealStalls() {
  try {
    const dir = getMarketsDir()
    if (!fs.existsSync(dir)) return
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const slug = file.replace('.json', '')
      const content = fs.readFileSync(path.join(dir, file), 'utf8')
      const json = JSON.parse(content)
      const marketName = json.marketName || json.name || slug
      const marketId = MARKETS_DATA.find(m => m.slug === slug)?.id || 1
      const allProjects = Array.isArray(json.projects) ? json.projects : []
      const visibleProjects = allProjects.filter((p: any) => !isOverviewBoundaryProjectServer(p, allProjects))

      for (const p of visibleProjects) {
        for (const s of (p.stalls || [])) {
          const code = String(s.code || s.stall_number || s.id).trim()
          if (!code) continue
          const monthly = Number(s.monthlyRent) || 2000
          const item: MasterStallRecord = {
            id: code,
            stall_number: code,
            ident: code,
            stall_ident: code,
            market_id: marketId,
            market_slug: slug,
            market_name: marketName,
            project_id: p.id,
            project_name: p.name,
            zone: s.zone || p.name,
            zone_name: s.zone || p.name,
            zone_code: p.sectionNumber || '01',
            category: p.category || 'สินค้าทั่วไป',
            size_sqm: Number(s.size) || 5,
            monthly_rate: monthly,
            daily_rate: Math.round(monthly / 25),
            entry_fee: Number(s.entryFee) || (monthly * 10),
            deposit_fee: Number(s.depositFee) || monthly,
            // The GIS files include illustrative occupied states for drawing
            // the map. They are not lease records, so availability must start
            // open and be derived below from real bookings/applications only.
            status: 'available',
            coordinates: s.coordinates || null,
            center: s.center || null
          }
          REAL_STALLS_DATA.push(item)
          REAL_STALLS_MAP.set(code, item)
        }
      }
    }
  } catch (err) {
    console.warn('[slug.ts] loadAllRealStalls error:', err)
  }
}

loadAllRealStalls()
const STALLS_DATA: any[] = REAL_STALLS_DATA

const INITIAL_BOOKINGS: any[] = [
  // 1. ตลาดบางแคภิรมย์ - โครงการ 01 (5 เบ็ดเตล็ด) (1 การจอง = 1 แผง = 1 การ์ด)
  {
    id: 3005,
    booking_number: '#3005',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    stall_number: 'BKH-01-001',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: '5 เบ็ดเตล็ด (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ของใช้ในครัวเรือนและสินค้าชุมชน OTOP',
    visit_date: 'อาทิตย์ 25 ตุลาคม 2569',
    visit_time_slot: '09.30 - 10.30 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์ อาคารประชาสัมพันธ์',
    escort_officer: 'นายประสิทธิ์ สุขเกษม',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-09T09:00:00'
  },
  {
    id: 3006,
    booking_number: '#3006',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    stall_number: 'BKH-01-003',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: '5 เบ็ดเตล็ด (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ของใช้ในครัวเรือนและสินค้าชุมชน OTOP',
    visit_date: 'อาทิตย์ 25 ตุลาคม 2569',
    visit_time_slot: '11.00 - 12.00 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์ อาคารประชาสัมพันธ์',
    escort_officer: 'นายประสิทธิ์ สุขเกษม',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-09T09:15:00'
  },
  // BKH-01-004: Multitenant Queue (Approved holder + 2 Waiting Queues)
  {
    id: 3013,
    booking_number: '#3013',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    stall_number: 'BKH-01-004',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: '5 เบ็ดเตล็ด (ชั้น 1)',
    tenant_name: 'นภาพร รัตนศิลป์',
    tenant_phone: '089-111-2233',
    tenant_id_card: '3-1005-44221-55-6',
    intended_business: 'ร้านของที่ระลึกและของแต่งบ้านเซรามิก',
    visit_date: 'ศุกร์ 30 ตุลาคม 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์ อาคาร B',
    escort_officer: 'นายประสิทธิ์ สุขเกษม',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-09T09:00:00'
  },
  {
    id: 3012,
    booking_number: '#3012',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    stall_number: 'BKH-01-004',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: '5 เบ็ดเตล็ด (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'กระเป๋าผ้าแฮนด์เมดและเครื่องประดับเงิน',
    visit_date: 'ศุกร์ 30 ตุลาคม 2569',
    visit_time_slot: '15.30 - 16.30 น.',
    status: 'waiting_queue',
    queue_position: 1,
    holding_stall: false,
    created_at: '2026-10-10T16:20:00'
  },
  {
    id: 3014,
    booking_number: '#3014',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    stall_number: 'BKH-01-004',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: '5 เบ็ดเตล็ด (ชั้น 1)',
    tenant_name: 'กิตติพงษ์ สว่างจิต',
    tenant_phone: '086-444-5566',
    tenant_id_card: '1-1002-33445-67-8',
    intended_business: 'งานจักสานและผลิตภัณฑ์ไม้สัก',
    visit_date: 'เสาร์ 31 ตุลาคม 2569',
    visit_time_slot: '15.30 - 16.30 น.',
    status: 'waiting_queue',
    queue_position: 2,
    holding_stall: false,
    created_at: '2026-10-11T11:30:00'
  },

  // 2. ตลาดบางแคภิรมย์ - โครงการ 02 (1 อาหารปรุง)
  {
    id: 3007,
    booking_number: '#3007',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 02 (1 อาหารปรุง)',
    stall_number: 'BKH-02-005',
    stall_count: 1,
    stall_monthly_rate: 2200,
    stall_zone_name: '1 อาหารปรุง',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ก๋วยเตี๋ยวเรือสูตรโบราณ',
    visit_date: 'อังคาร 20 ตุลาคม 2569',
    visit_time_slot: '10.30 - 11.30 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์ อาคาร A',
    escort_officer: 'นายประสิทธิ์ สุขเกษม',
    status: 'lease_applied',
    application_number: 'APP-2026-0089',
    holding_stall: true,
    created_at: '2026-10-10T13:45:00'
  },
  {
    id: 3008,
    booking_number: '#3008',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 02 (1 อาหารปรุง)',
    stall_number: 'BKH-02-006',
    stall_count: 1,
    stall_monthly_rate: 2200,
    stall_zone_name: '1 อาหารปรุง',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ข้าวแกงปักษ์ใต้รสเด็ด',
    visit_date: 'พุธ 21 ตุลาคม 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์ อาคาร A',
    escort_officer: 'นายประสิทธิ์ สุขเกษม',
    status: 'completed',
    holding_stall: true,
    created_at: '2026-10-10T16:00:00'
  },
  {
    id: 3009,
    booking_number: '#3009',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 02 (1 อาหารปรุง)',
    stall_number: 'BKH-02-010',
    stall_count: 1,
    stall_monthly_rate: 2200,
    stall_zone_name: '1 อาหารปรุง',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ชาไทยโบราณและกาแฟสด',
    visit_date: 'พฤหัสบดี 22 ตุลาคม 2569',
    visit_time_slot: '14.00 - 15.00 น.',
    meeting_point: 'สำนักงานบริหารตลาดบางแคภิรมย์',
    status: 'cancelled',
    holding_stall: false,
    created_at: '2026-10-11T10:00:00'
  },

  // 3. ตลาดนัดจตุจักร - โครงการที่ 1
  {
    id: 3002,
    booking_number: '#3002',
    market_name: 'ตลาดนัดจตุจักร',
    project_name: 'โครงการที่ 1',
    stall_number: 'JJ-1-262-3174',
    stall_count: 1,
    stall_monthly_rate: 2500,
    stall_zone_name: 'โครงการที่ 1 (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'เสื้อผ้าแฟชั่นและเครื่องประดับวินเทจ',
    visit_date: 'เสาร์ 31 ตุลาคม 2569',
    visit_time_slot: '11.00 - 12.00 น.',
    meeting_point: 'หน้ากองอำนวยการตลาดนัดจตุจักร เสาธง 1',
    escort_officer: 'นายธนากร สมบูรณ์',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-07T10:30:00'
  },
  {
    id: 3015,
    booking_number: '#3015',
    market_name: 'ตลาดนัดจตุจักร',
    project_name: 'โครงการที่ 1',
    stall_number: 'JJ-1-262-3174',
    stall_count: 1,
    stall_monthly_rate: 2500,
    stall_zone_name: 'โครงการที่ 1 (ชั้น 1)',
    tenant_name: 'ศิริพร เจริญสุข',
    tenant_phone: '082-999-8877',
    tenant_id_card: '1-1008-88776-54-3',
    intended_business: 'เสื้อผ้าวินเทจนำเข้าจากญี่ปุ่น',
    visit_date: 'เสาร์ 31 ตุลาคม 2569',
    visit_time_slot: '15.30 - 16.30 น.',
    status: 'waiting_queue',
    queue_position: 1,
    holding_stall: false,
    created_at: '2026-10-08T14:15:00'
  },

  // 4. ตลาดนัดจตุจักร - โครงการที่ 3 (1 การจอง = 1 แผง = 1 การ์ด)
  {
    id: 3003,
    booking_number: '#3003',
    market_name: 'ตลาดนัดจตุจักร',
    project_name: 'โครงการที่ 3',
    stall_number: 'JJ-3-271',
    stall_count: 1,
    stall_monthly_rate: 1600,
    stall_zone_name: 'โครงการที่ 3 (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ของตกแต่งบ้านเซรามิกและงานปั้น',
    visit_date: 'เสาร์ 31 ตุลาคม 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'หน้ากองอำนวยการตลาด เสาธง 1',
    escort_officer: 'นายธนากร สมบูรณ์',
    status: 'interested',
    holding_stall: true,
    created_at: '2026-10-07T10:30:00'
  },
  {
    id: 3004,
    booking_number: '#3004',
    market_name: 'ตลาดนัดจตุจักร',
    project_name: 'โครงการที่ 3',
    stall_number: 'JJ-3-272',
    stall_count: 1,
    stall_monthly_rate: 1600,
    stall_zone_name: 'โครงการที่ 3 (ชั้น 1)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ของตกแต่งบ้านเซรามิกและงานปั้น',
    visit_date: 'เสาร์ 31 ตุลาคม 2569',
    visit_time_slot: '15.30 - 16.30 น.',
    meeting_point: 'หน้ากองอำนวยการตลาด เสาธง 1',
    escort_officer: 'นายธนากร สมบูรณ์',
    status: 'interested',
    holding_stall: true,
    created_at: '2026-10-07T10:45:00'
  },

  // 5. ตลาดประชานิเวศน์ 1 - โครงการ 01 (D)
  {
    id: 3016,
    booking_number: '#3016',
    market_name: 'ตลาดประชานิเวศน์ 1',
    project_name: 'โครงการ 01 (D)',
    stall_number: 'PRA-01-001',
    stall_count: 1,
    stall_monthly_rate: 2200,
    stall_zone_name: 'สินค้าทั่วไป อาหาร และบริการ',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'อาหารปรุงสำเร็จและของฝากเลื่องชื่อ',
    visit_date: 'พุธ 28 ตุลาคม 2569',
    visit_time_slot: '09.30 - 10.30 น.',
    meeting_point: 'สำนักงานตลาดประชานิเวศน์ 1',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-12T09:00:00'
  },

  // 6. ตลาดมีนบุรี - โครงการ 02 (แผงค้าเบ็ดเตล็ด (ชั้นบน))
  {
    id: 3017,
    booking_number: '#3017',
    market_name: 'ตลาดมีนบุรี',
    project_name: 'โครงการ 02 (แผงค้าเบ็ดเตล็ด (ชั้นบน))',
    stall_number: 'MIN-02-G0001',
    stall_count: 1,
    stall_monthly_rate: 1800,
    stall_zone_name: 'แผงค้าเบ็ดเตล็ด (ชั้นบน)',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ผักสดและผลไม้เกษตรอินทรีย์',
    visit_date: 'พุธ 4 พฤศจิกายน 2569',
    visit_time_slot: '09.30 - 10.30 น.',
    meeting_point: 'ศูนย์ประสานงานตลาดมีนบุรี ประตู 1',
    status: 'pending_approval',
    holding_stall: true,
    created_at: '2026-10-13T10:00:00'
  },

  // 7. ตลาดสิงหา - โครงการ 01 (โซนแผงค้าตลาดสิงหา)
  {
    id: 3018,
    booking_number: '#3018',
    market_name: 'ตลาดสิงหา',
    project_name: 'โครงการ 01 (โซนแผงค้าตลาดสิงหา)',
    stall_number: 'SIN-01-073',
    stall_count: 1,
    stall_monthly_rate: 2500,
    stall_zone_name: 'โซนแผงค้าตลาดสิงหา',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'แซนวิชเพื่อสุขภาพและเครื่องดื่มร้อน',
    visit_date: 'พุธ 4 พฤศจิกายน 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'หน้าทางเข้าตลาดสิงหา สุขุมวิท 22',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-14T08:30:00'
  },

  // 8. ตลาดพระเครื่องวงเวียนเล็ก - โครงการ 01 (ฉ) (ศูนย์รวมพระเครื่องและวัตถุมงคล)
  {
    id: 3010,
    booking_number: '#3010',
    market_name: 'ตลาดพระเครื่องวงเวียนเล็ก',
    project_name: 'โครงการ 01 (ฉ)',
    stall_number: 'WON-01-102',
    stall_count: 1,
    stall_monthly_rate: 2400,
    stall_zone_name: 'โซนพระบูชาและเหรียญคณาจารย์',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ศูนย์พระเครื่อง พระบูชา และวัตถุมงคล',
    visit_date: 'อาทิตย์ 1 พฤศจิกายน 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'ศูนย์ประสานงานตลาดพระเครื่องวงเวียนเล็ก ซอยสมเด็จเจ้าพระยา',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-12T11:15:00'
  },
  {
    id: 3011,
    booking_number: '#3011',
    market_name: 'ตลาดพระเครื่องวงเวียนเล็ก',
    project_name: 'โครงการ 01 (ฉ)',
    stall_number: 'WON-01-106',
    stall_count: 1,
    stall_monthly_rate: 2400,
    stall_zone_name: 'โซนหนังสือและตลับพระ',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'อุปกรณ์เลี่ยมกรอบพระและตลับเงิน',
    visit_date: 'เสาร์ 24 ตุลาคม 2569',
    visit_time_slot: '15.00 - 16.00 น.',
    meeting_point: 'ศูนย์ประสานงานตลาดพระเครื่องวงเวียนเล็ก ซอยสมเด็จเจ้าพระยา',
    status: 'cancelled',
    holding_stall: false,
    cancel_reason: 'ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด',
    created_at: '2026-10-12T15:30:00'
  }
]

// Demo bookings must never leak into the production availability count.
// Enable them explicitly only when a test environment needs seeded journeys.
const useDemoBookingSeed = process.env.NODE_ENV !== 'production'
  || process.env.NUXT_PUBLIC_ENABLE_DEMO_SEED === 'true'
const BOOKINGS_DATA: any[] = useDemoBookingSeed ? JSON.parse(JSON.stringify(INITIAL_BOOKINGS)) : []
let bookingsExplicitlyCleared = !useDemoBookingSeed

// =========================================================================
// NOTIFICATION SYSTEM (Dual-Role Status Notifications: tenant & officer)
// =========================================================================
const INITIAL_NOTIFICATIONS: any[] = [
  // --- TENANT NOTIFICATIONS (สำหรับผู้เช่า: สมชาย ใจดี) ---
  {
    id: 9001,
    recipient_role: 'tenant',
    recipient_name: 'สมชาย ใจดี',
    type: 'interested',
    status_code: 'interested',
    status_label: 'พร้อมยื่นคำร้องขอเช่า',
    title: 'เจ้าหน้าที่ยืนยันการเช่าแผงแล้ว',
    message: 'เจ้าหน้าที่ยืนยันการเข้าชมและสิทธิ์การเช่าแผง JJ-3-271 (ตลาดนัดจตุจักร) เรียบร้อยแล้ว คุณสามารถกดยื่นคำร้องขอเช่าแผงได้ทันที',
    booking_id: 3003,
    booking_number: '#3003',
    stall_number: 'JJ-3-271',
    market_name: 'ตลาดนัดจตุจักร',
    project_name: 'โครงการที่ 3',
    target_url: '/bookings/3003?role=tenant',
    is_read: false,
    created_at: '2026-10-14T15:30:00'
  },
  {
    id: 9002,
    recipient_role: 'tenant',
    recipient_name: 'สมชาย ใจดี',
    type: 'approved',
    status_code: 'approved',
    status_label: 'อนุมัตินัดชมแผง',
    title: 'อนุมัตินัดหมายเข้าชมแผงค้า #3005',
    message: 'นัดหมายเข้าชมแผง BKH-01-001 (ตลาดบางแคภิรมย์) ได้รับการอนุมัติแล้ว นัดวันอาทิตย์ 25 ตุลาคม 2569 เวลา 09.30 - 10.30 น. ณ สำนักงานบริหารตลาดบางแคภิรมย์',
    booking_id: 3005,
    booking_number: '#3005',
    stall_number: 'BKH-01-001',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    target_url: '/bookings/3005?role=tenant',
    is_read: false,
    created_at: '2026-10-14T11:20:00'
  },
  {
    id: 9003,
    recipient_role: 'tenant',
    recipient_name: 'สมชาย ใจดี',
    type: 'pending_approval',
    status_code: 'pending_approval',
    status_label: 'รออนุมัติวันนัด',
    title: 'ส่งคำขอนัดชมแผงสำเร็จ #3017',
    message: 'ระบบได้รับคำขอนัดชมแผง MIN-02-G0001 (ตลาดมีนบุรี) วันที่ พุธ 4 พฤศจิกายน 2569 เวลา 09.30 - 10.30 น. อยู่ระหว่างรอเจ้าหน้าที่อนุมัติ',
    booking_id: 3017,
    booking_number: '#3017',
    stall_number: 'MIN-02-G0001',
    market_name: 'ตลาดมีนบุรี',
    project_name: 'โครงการ 02 (แผงค้าเบ็ดเตล็ด (ชั้นบน))',
    target_url: '/bookings/3017?role=tenant',
    is_read: false,
    created_at: '2026-10-13T10:05:00'
  },
  {
    id: 9004,
    recipient_role: 'tenant',
    recipient_name: 'สมชาย ใจดี',
    type: 'waiting_queue',
    status_code: 'waiting_queue',
    status_label: 'คิวสำรองลำดับที่ 1',
    title: 'เข้าคิวสำรองแผง BKH-01-004 สำเร็จ (คิวที่ 1)',
    message: 'คุณอยู่ในคิวสำรองลำดับที่ 1 ของแผง BKH-01-004 (ตลาดบางแคภิรมย์) ระบบจะแจ้งเตือนทันทีเมื่อผู้จองหลักสละสิทธิ์',
    booking_id: 3012,
    booking_number: '#3012',
    stall_number: 'BKH-01-004',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    target_url: '/bookings/3012?role=tenant',
    is_read: true,
    created_at: '2026-10-10T16:25:00'
  },
  {
    id: 9005,
    recipient_role: 'tenant',
    recipient_name: 'สมชาย ใจดี',
    type: 'lease_applied',
    status_code: 'lease_applied',
    status_label: 'ยื่นคำร้องแล้ว',
    title: 'ส่งคำร้องขอเช่าแผงสำเร็จ (APP-2026-0089)',
    message: 'คำร้องขอเช่าแผง BKH-02-005 (ตลาดบางแคภิรมย์) ถูกส่งเข้าสู่ระบบแล้ว อยู่ระหว่างเจ้าหน้าที่ตลาดตรวจสอบเอกสาร',
    booking_id: 3007,
    booking_number: '#3007',
    stall_number: 'BKH-02-005',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 02 (1 อาหารปรุง)',
    target_url: '/bookings/3007?role=tenant',
    is_read: true,
    created_at: '2026-10-10T13:50:00'
  },

  // --- OFFICER NOTIFICATIONS (สำหรับเจ้าหน้าที่ดูแลตลาด / Admin) ---
  {
    id: 9101,
    recipient_role: 'officer',
    recipient_name: 'เจ้าหน้าที่ดูแลตลาด',
    type: 'pending_approval',
    status_code: 'pending_approval',
    status_label: 'รออนุมัติวันนัด',
    title: 'คำขอนัดชมแผงใหม่ รออนุมัติ (#3017)',
    message: 'คุณสมชาย ใจดี ขอนัดเข้าชมแผง MIN-02-G0001 (ตลาดมีนบุรี) นัดหมายวันพุธ 4 พฤศจิกายน 2569 เวลา 09.30 - 10.30 น. กรุณาตรวจสอบและอนุมัติ',
    booking_id: 3017,
    booking_number: '#3017',
    stall_number: 'MIN-02-G0001',
    market_name: 'ตลาดมีนบุรี',
    project_name: 'โครงการ 02 (แผงค้าเบ็ดเตล็ด (ชั้นบน))',
    target_url: '/bookings/3017?role=officer',
    is_read: false,
    created_at: '2026-10-13T10:00:00'
  },
  {
    id: 9102,
    recipient_role: 'officer',
    recipient_name: 'เจ้าหน้าที่ดูแลตลาด',
    type: 'lease_applied',
    status_code: 'lease_applied',
    status_label: 'รอตรวจคำร้องเช่า',
    title: 'มีคำร้องขอเช่าแผงค้าใหม่ (APP-2026-0089)',
    message: 'คุณสมชาย ใจดี ยื่นคำร้องขอเช่าแผง BKH-02-005 (ตลาดบางแคภิรมย์) จากใบจอง #3007 รอเจ้าหน้าที่ตรวจสอบเอกสารประกอบคำร้อง',
    booking_id: 3007,
    booking_number: '#3007',
    stall_number: 'BKH-02-005',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 02 (1 อาหารปรุง)',
    target_url: '/bookings/3007?role=officer',
    is_read: false,
    created_at: '2026-10-12T14:10:00'
  },
  {
    id: 9103,
    recipient_role: 'officer',
    recipient_name: 'เจ้าหน้าที่ดูแลตลาด',
    type: 'waiting_queue',
    status_code: 'waiting_queue',
    status_label: 'มีผู้ต่อคิวสำรองใหม่',
    title: 'มีผู้เช่าเข้าคิวสำรองแผง BKH-01-004 (2 คิว)',
    message: 'คุณกิตติพงษ์ สว่างจิต เข้าต่อคิวสำรองลำดับที่ 2 ของแผง BKH-01-004 (ตลาดบางแคภิรมย์) ต่อจากผู้ถือสิทธิ์หลัก #3013',
    booking_id: 3014,
    booking_number: '#3014',
    stall_number: 'BKH-01-004',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    target_url: '/bookings/3014?role=officer',
    is_read: false,
    created_at: '2026-10-11T11:30:00'
  },
  {
    id: 9104,
    recipient_role: 'officer',
    recipient_name: 'เจ้าหน้าที่ดูแลตลาด',
    type: 'approved',
    status_code: 'approved',
    status_label: 'นัดชมแผงที่กำลังจะถึง',
    title: 'ตารางนัดหมายนำชมแผง #3005 และ #3006',
    message: 'นัดนำชมแผง BKH-01-001 และ BKH-01-003 (ตลาดบางแคภิรมย์) ของคุณสมชาย ใจดี ในวันอาทิตย์ 25 ตุลาคม 2569',
    booking_id: 3005,
    booking_number: '#3005',
    stall_number: 'BKH-01-001',
    market_name: 'ตลาดบางแคภิรมย์',
    project_name: 'โครงการ 01 (5 เบ็ดเตล็ด)',
    target_url: '/bookings/3005?role=officer',
    is_read: true,
    created_at: '2026-10-09T09:15:00'
  }
]

const NOTIFICATIONS_DATA: any[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))

function formatIsoDatesInThai(text: string): string {
  if (!text) return ''
  const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return text.replace(/(?:วันที่\s*|วัน)?(\d{4})-(\d{2})-(\d{2})/g, (_match, yyyy, mm, dd) => {
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    if (Number.isNaN(d.getTime())) return _match
    return `วัน${thaiDays[d.getDay()]}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`
  })
}

function pushNotification(payload: {
  recipient_role: 'tenant' | 'officer'
  recipient_name?: string
  recipient_user_id?: number
  type: string
  status_code: string
  status_label: string
  title: string
  message: string
  booking_id?: number
  booking_number?: string
  stall_number?: string
  market_name?: string
  project_name?: string
  target_url?: string
}) {
  const newNotif = {
    id: Date.now() + Math.floor(Math.random() * 10000),
    recipient_role: payload.recipient_role,
    recipient_user_id: payload.recipient_user_id || (payload.recipient_role === 'tenant'
      ? (/นภาพร\s+รัตนศิลป์/i.test(payload.recipient_name || '') ? 4 : /สมชาย\s+ใจดี/i.test(payload.recipient_name || '') ? 3 : undefined)
      : undefined),
    recipient_name: payload.recipient_name || (payload.recipient_role === 'tenant' ? 'ผู้เช่าแผงค้า' : 'เจ้าหน้าที่ดูแลตลาด'),
    type: payload.type,
    status_code: payload.status_code,
    status_label: payload.status_label,
    title: formatIsoDatesInThai(payload.title),
    message: formatIsoDatesInThai(payload.message),
    booking_id: payload.booking_id,
    booking_number: payload.booking_number || '',
    stall_number: payload.stall_number || '',
    market_name: payload.market_name || '',
    project_name: payload.project_name || '',
    target_url: payload.target_url || (payload.booking_id ? `/bookings/${payload.booking_id}?role=${payload.recipient_role}` : `/bookings?role=${payload.recipient_role}`),
    is_read: false,
    created_at: new Date().toISOString()
  }
  NOTIFICATIONS_DATA.unshift(newNotif)
  return newNotif
}

// Synchronize all stall statuses with active bookings, applications, and contracts
function syncAllStallStatuses() {
  for (const s of REAL_STALLS_DATA) {
    s.status = 'available'
  }
  for (const b of BOOKINGS_DATA) {
    const numbers = String(b.stall_number || '').split(',').map((s: string) => s.trim())
    for (const num of numbers) {
      const stall = REAL_STALLS_MAP.get(num)
      if (!stall) continue
      if (['lease_applied', 'completed'].includes(b.status)) {
        stall.status = 'occupied'
      } else if (b.holding_stall && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status)) {
        stall.status = 'reserved'
      }
    }
  }

  // Synchronize MARKETS_DATA summary stats with REAL_STALLS_DATA so all market cards & detail pages relate 100%
  for (const m of MARKETS_DATA as any[]) {
    const marketStalls = REAL_STALLS_DATA.filter(s => s.market_slug === m.slug)
    if (marketStalls.length === 0) {
      const total = GIS_MARKET_STALL_TOTALS[m.slug] || Number(m.total_stalls) || 0
      const marketBookings = BOOKINGS_DATA.filter((booking: any) => {
        const sameMarketId = String(booking.market_id || '') === String(m.id)
        const bookingMarketName = String(booking.market_name || '').trim()
        const sameMarketName = Boolean(bookingMarketName) && (
          bookingMarketName === m.name ||
          bookingMarketName.includes(m.name) ||
          m.name.includes(bookingMarketName)
        )
        return sameMarketId || sameMarketName
      })
      const reservedStalls = new Set<string>()
      const occupiedStalls = new Set<string>()
      marketBookings.forEach((booking: any) => {
        const stallNumbers = String(booking.stall_number || '')
          .split(',')
          .map((number: string) => number.trim())
          .filter(Boolean)
        if (['lease_applied', 'completed'].includes(String(booking.status || ''))) {
          stallNumbers.forEach((number: string) => occupiedStalls.add(number))
        } else if (
          booking.holding_stall &&
          !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(String(booking.status || ''))
        ) {
          stallNumbers.forEach((number: string) => reservedStalls.add(number))
        }
      })
      occupiedStalls.forEach(number => reservedStalls.delete(number))
      const occupied = occupiedStalls.size
      const reserved = reservedStalls.size
      const available = Math.max(0, total - occupied - reserved)

      m.total_stalls = total
      m.available_stalls = available
      m.reserved_stalls = reserved
      m.occupied_stalls = occupied
      m.status = total > 0 && available === 0 ? 'full' : 'open'
      continue
    }

    const total = marketStalls.length
    const available = marketStalls.filter(s => s.status === 'available').length
    const reserved = marketStalls.filter(s => s.status === 'reserved').length
    const occupied = marketStalls.filter(s => s.status === 'occupied').length

    m.total_stalls = total
    m.available_stalls = available
    m.reserved_stalls = reserved
    m.occupied_stalls = occupied
    m.status = total > 0 && available === 0 ? 'full' : 'open'

    const rents = marketStalls.map(s => Number(s.monthly_rate)).filter(r => Number.isFinite(r) && r > 0)
    if (rents.length > 0) {
      const minRent = Math.min(...rents)
      const maxRent = Math.max(...rents)
      m.starting_price_monthly = minRent
      m.max_price_monthly = maxRent
      m.starting_price_daily = Math.max(50, Math.round(minRent / 25))
    }

    const rawAreas = marketStalls.map(s => Number(s.size_sqm)).filter(a => Number.isFinite(a) && a >= 1)
    const areas = rawAreas.length > 0
      ? rawAreas
      : marketStalls.map(s => Number(s.size_sqm)).filter(a => Number.isFinite(a) && a > 0)
    if (areas.length > 0) {
      m.min_area_sqm = Number(Math.min(...areas).toFixed(1))
      m.max_area_sqm = Number(Math.max(...areas).toFixed(1))
    }
  }
}

syncAllStallStatuses()


const APPLICATIONS_DATA: any[] = [
  {
    id: 101,
    application_number: 'APP-2026-0089',
    stall_id: 'BKH-02-005',
    stall_number: 'BKH-02-005',
    market_name: 'ตลาดบางแคภิรมย์',
    applicant_name: 'สมชาย ใจดี',
    tenant_name: 'สมชาย ใจดี',
    applicant_phone: '081-234-5678',
    tenant_phone: '081-234-5678',
    applicant_id_card: '1-1004-99887-12-3',
    tenant_id_card: '1-1004-99887-12-3',
    shop_name: 'สมชายก๋วยเตี๋ยวเรืออยุธยา',
    business_name: 'สมชายก๋วยเตี๋ยวเรืออยุธยา',
    product_type: 'อาหารและเครื่องดื่ม',
    business_type: 'อาหารและเครื่องดื่ม',
    requested_start_date: '2026-11-01',
    requested_period_months: 12,
    stage: 'officer_review',
    status: 'pending_officer',
    created_at: '2026-10-10T13:45:00'
  },
  {
    id: 102,
    application_number: 'APP-2026-0078',
    stall_id: 'JJ-1-262-3174',
    stall_number: 'JJ-1-262-3174',
    market_name: 'ตลาดนัดจตุจักร',
    applicant_name: 'กิตติคุณ มั่งคั่ง',
    tenant_name: 'กิตติคุณ มั่งคั่ง',
    applicant_phone: '082-998-1122',
    tenant_phone: '082-998-1122',
    applicant_id_card: '1-1004-99887-12-3',
    tenant_id_card: '1-1004-99887-12-3',
    shop_name: 'ร้านเสื้อผ้าวินเทจกิตติคุณ',
    business_name: 'ร้านเสื้อผ้าวินเทจกิตติคุณ',
    product_type: 'เสื้อผ้าและแฟชั่น',
    business_type: 'เสื้อผ้าและแฟชั่น',
    requested_start_date: '2026-10-15',
    requested_period_months: 12,
    stage: 'director_review',
    status: 'pending_market_director',
    officer_comment: 'ตรวจสอบหลักฐานบัตรประชาชนและเอกสารร้านค้าเรียบร้อย',
    created_at: '2026-10-08T09:30:00'
  }
]


const CONTRACTS_DATA: any[] = [
  {
    id: 1,
    contract_number: 'CNT-2026-0001',
    stall_id: 'JJ-1-261-3175',
    tenant_name: 'นายกิตติคุณ มั่งคั่ง',
    tenant_id_card: '1-1004-99887-12-3',
    tenant_phone: '082-998-1122',
    business_name: 'ร้านเสื้อผ้าวินเทจกิตติคุณ',
    business_type: 'เสื้อผ้าและแฟชั่น',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    billing_cycle: 'monthly',
    rental_fee: 2500,
    security_deposit: 5000,
    advance_payment: 2500,
    status: 'active',
    stall: {
      id: 'JJ-1-261-3175',
      stall_number: 'JJ-1-261-3175',
      zone_name: 'โครงการที่ 1 (ชั้น 1)',
      monthly_rate: 2500
    }
  }
]


export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const method = getMethod(event)
  const query = getQuery(event)

  // 1. Try proxying to Local Python FastAPI backend if available and not on Vercel production
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      const backendUrl = `http://localhost:8000/api/v1/${slug}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 600)
      
      const res = await fetch(backendUrl + (event.node.req.url?.includes('?') ? event.node.req.url.slice(event.node.req.url.indexOf('?')) : ''), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(event.node.req.headers.authorization ? { Authorization: event.node.req.headers.authorization } : {})
        },
        body: method !== 'GET' && method !== 'HEAD' ? await readBody(event).catch(() => undefined) : undefined,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json().catch(() => null)
        if (data) return data
      }
    } catch {
      // Backend not running, proceed to built-in Nitro responses
    }
  }

  // 2. Built-in Nitro Mock API Responses for Vercel & Offline Mode
  // Clean slug
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '')

  // --- /markets ---
  if (cleanSlug === 'markets' || cleanSlug === 'markets/') {
    syncAllStallStatuses()
    let result = MARKETS_DATA
    if (query.search) {
      const q = String(query.search).toLowerCase().trim()
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.name_en.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q)
      )
    }
    return result
  }

  // --- /markets/events ---
  if (cleanSlug === 'markets/events') {
    return EVENTS_DATA
  }

  // --- /markets/:id ---
  if (cleanSlug.startsWith('markets/')) {
    syncAllStallStatuses()
    const marketIdOrSlug = cleanSlug.replace('markets/', '')
    const market = MARKETS_DATA.find(m => String(m.id) === marketIdOrSlug || m.slug === marketIdOrSlug)
    if (market) return market
    return MARKETS_DATA[0]
  }

  // --- /stalls ---
  if (cleanSlug === 'stalls' || cleanSlug === 'stalls/') {
    syncAllStallStatuses()
    const marketQuery = query.market || query.market_id || query.slug
    if (marketQuery) {
      const mq = String(marketQuery).trim().toLowerCase()
      const filtered = REAL_STALLS_DATA.filter(s =>
        s.market_slug.toLowerCase() === mq ||
        s.market_name.toLowerCase().includes(mq) ||
        String(s.market_id) === mq
      )
      if (filtered.length > 0) return filtered
    }
    return STALLS_DATA
  }

  // --- /stalls/geojson and /stalls/gis-geojson ---
  if (cleanSlug === 'stalls/geojson' || cleanSlug === 'stalls/gis-geojson') {
    return {
      type: 'FeatureCollection',
      features: STALLS_DATA.slice(0, 36).map((s, idx) => {
        const col = idx % 6
        const row = Math.floor(idx / 6)
        const lng = 100.5500 + col * 0.0003
        const lat = 13.7997 + row * 0.0003
        const booking = BOOKINGS_DATA.find(b => b.stall_id === s.id && ['pending', 'approved', 'pending_decision', 'lease_applied'].includes(b.status))

        return {
          type: 'Feature',
          id: s.id,
          properties: {
            id: s.id,
            stall_number: s.stall_number,
            zone_id: s.zone_id,
            zone_code: s.zone_code,
            zone_name: s.zone_name,
            category: s.category,
            status: booking ? 'reserved' : s.status,
            monthly_rate: s.monthly_rate,
            daily_rate: s.daily_rate,
            size_width: 3.0,
            size_length: s.size_sqm / 3.0,
            area_sqm: s.size_sqm,
            lat: lat + 0.0001,
            lng: lng + 0.0001,
            has_active_booking: !!booking,
            active_booking_number: booking ? booking.booking_number : null
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng, lat],
              [lng + 0.00022, lat],
              [lng + 0.00022, lat + 0.00022],
              [lng, lat + 0.00022],
              [lng, lat]
            ]]
          }
        }
      })
    }
  }

  // --- /zones ---
  if (cleanSlug === 'zones') {
    return [
      { id: 1, code: 'A', name: 'โซนอาหารและเครื่องดื่ม', color_code: '#ef4444', description: 'อาหารปรุงสำเร็จ ขนม และเครื่องดื่ม', stalls_count: 24 },
      { id: 2, code: 'B', name: 'โซนแฟชั่นและเสื้อผ้า', color_code: '#3b82f6', description: 'เสื้อผ้า กระเป๋า รองเท้า เครื่องประดับ', stalls_count: 30 },
      { id: 3, code: 'C', name: 'โซนของสดและวัตถุดิบ', color_code: '#10b981', description: 'ผักสด ผลไม้ เนื้อสัตว์ และวัตถุดิบทำอาหาร', stalls_count: 18 },
      { id: 4, code: 'D', name: 'โซนงานฝีมือและของแต่งบ้าน', color_code: '#f59e0b', description: 'สินค้าแฮนด์เมด เซรามิก ของตกแต่ง', stalls_count: 15 }
    ]
  }

  // --- /dashboard/stats ---
  if (cleanSlug === 'dashboard/stats') {
    return {
      total_stalls: 87,
      available_stalls: 54,
      occupied_stalls: 26,
      reserved_stalls: 5,
      maintenance_stalls: 2,
      occupancy_rate: 35.6,
      total_active_contracts: 26,
      monthly_revenue: 184500,
      security_deposits: 369000,
      expiring_soon_count: 3,
      zones_breakdown: [
        { zone_code: 'A', zone_name: 'อาหารและเครื่องดื่ม', total_stalls: 24, occupied_stalls: 14, available_stalls: 8, occupancy_rate: 58.3 },
        { zone_code: 'B', zone_name: 'แฟชั่นและเสื้อผ้า', total_stalls: 30, occupied_stalls: 8, available_stalls: 20, occupancy_rate: 26.7 },
        { zone_code: 'C', zone_name: 'ของสดและผักผลไม้', total_stalls: 18, occupied_stalls: 3, available_stalls: 14, occupancy_rate: 16.7 },
        { zone_code: 'D', zone_name: 'งานฝีมือและของตกแต่ง', total_stalls: 15, occupied_stalls: 1, available_stalls: 12, occupancy_rate: 6.7 }
      ]
    }
  }

  // Queue helper to auto-shift next queue item when a stall is released
  function shiftQueueForStall(stallNumber: string) {
    const queueItems = BOOKINGS_DATA.filter(b => b.stall_number === stallNumber && b.status === 'waiting_queue')
      .sort((a, b) => (a.queue_position || 99) - (b.queue_position || 99))

    if (queueItems.length > 0) {
      const nextHolder = queueItems[0]
      nextHolder.status = 'pending_slot'
      nextHolder.holding_stall = true
      delete nextHolder.queue_position
      nextHolder.slot_selection_deadline = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) + 'T23:59:59'
      nextHolder.timeline = nextHolder.timeline || []
      nextHolder.timeline.push({
        action: 'เลื่อนคิวขึ้นเป็นผู้ถือแผง (รอเลือกวันนัด)',
        actor_role: 'system',
        actor_name: 'ระบบคิวอัตโนมัติ (Queue Engine)',
        timestamp: new Date().toISOString(),
        note: 'ผู้ถือแผงคนก่อนหน้าปล่อยสิทธิ์ คิวที่ 1 ได้รับสิทธิ์ถือแผง กรุณาเลือกวันนัดภายใน 3 วัน'
      })

      // แจ้งเตือนผู้เช่าคิวที่ 1 ที่เลื่อนขึ้นมาถือแผง
      pushNotification({
        recipient_role: 'tenant',
        recipient_name: nextHolder.tenant_name,
        type: 'pending_slot',
        status_code: 'pending_slot',
        status_label: 'ถึงคิวของคุณแล้ว! รอเลือกวันนัด',
        title: `ถึงคิวของคุณแล้ว! แผง ${stallNumber} (${nextHolder.booking_number})`,
        message: `ผู้ถือแผงคนก่อนหน้าปล่อยสิทธิ์ คุณได้รับสิทธิ์ถือแผง ${stallNumber} (${nextHolder.market_name}) กรุณาเลือกวัน-เวลานัดชมแผงภายใน 3 วัน`,
        booking_id: nextHolder.id,
        booking_number: nextHolder.booking_number,
        stall_number: stallNumber,
        market_name: nextHolder.market_name,
        project_name: nextHolder.project_name
      })

      // แจ้งเตือนเจ้าหน้าที่ว่ามีคิวสำรองเลื่อนขึ้นมาถือแผง
      pushNotification({
        recipient_role: 'officer',
        type: 'pending_slot',
        status_code: 'pending_slot',
        status_label: 'ระบบเลื่อนคิวสำรองขึ้นถือแผง',
        title: `เลื่อนคิว #1 ขึ้นถือแผง ${stallNumber} (${nextHolder.booking_number})`,
        message: `ระบบเลื่อนคุณ${nextHolder.tenant_name} (${nextHolder.booking_number}) ขึ้นเป็นผู้ถือสิทธิ์แผง ${stallNumber} อัตโนมัติ (รอผู้เช่าเลือกวันนัดชม)`,
        booking_id: nextHolder.id,
        booking_number: nextHolder.booking_number,
        stall_number: stallNumber,
        market_name: nextHolder.market_name,
        project_name: nextHolder.project_name
      })

      // Shift other waiting queue numbers
      for (let i = 1; i < queueItems.length; i++) {
        queueItems[i].queue_position = i
        queueItems[i].timeline = queueItems[i].timeline || []
        queueItems[i].timeline.push({
          action: 'เลื่อนลำดับคิวขึ้น',
          actor_role: 'system',
          actor_name: 'ระบบคิวอัตโนมัติ (Queue Engine)',
          timestamp: new Date().toISOString(),
          note: `ลำดับคิวของคุณขยับขึ้นเป็นคิวที่ ${i}`
        })

        pushNotification({
          recipient_role: 'tenant',
          recipient_name: queueItems[i].tenant_name,
          type: 'waiting_queue',
          status_code: 'waiting_queue',
          status_label: `ขยับเป็นคิวสำรองที่ ${i}`,
          title: `ลำดับคิวแผง ${stallNumber} ขยับขึ้นเป็นคิวที่ ${i}`,
          message: `ใบจอง ${queueItems[i].booking_number} แผง ${stallNumber} (${queueItems[i].market_name}) ขยับลำดับคิวสำรองขึ้นมาเป็นคิวที่ ${i}`,
          booking_id: queueItems[i].id,
          booking_number: queueItems[i].booking_number,
          stall_number: stallNumber,
          market_name: queueItems[i].market_name,
          project_name: queueItems[i].project_name
        })
      }
    } else {
      const activeHolders = BOOKINGS_DATA.filter(b => b.stall_number === stallNumber && b.holding_stall && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status))
      if (activeHolders.length === 0) {
        const stall = STALLS_DATA.find(s => s.stall_number === stallNumber)
        if (stall) stall.status = 'available'
      }
    }
    syncAllStallStatuses()
  }

  // --- /notifications ---
  if (cleanSlug.startsWith('notifications')) {
    const actor = getMockActor(event)
    if (!actor) return unauthorizedResponse(event, 'กรุณาเข้าสู่ระบบก่อนดูการแจ้งเตือน')
    const parts = cleanSlug.split('/').filter(Boolean)
    const query = getQuery(event)
    const targetRole: 'tenant' | 'officer' = actor.role === 'tenant' ? 'tenant' : 'officer'

    // Backfill owner ids for seeded notifications created before per-user ownership was added.
    NOTIFICATIONS_DATA.forEach((notification: any) => {
      if (notification.recipient_user_id !== undefined && notification.recipient_user_id !== null) return
      const recipientName = String(notification.recipient_name || '').replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
      if (recipientName === 'สมชาย ใจดี') notification.recipient_user_id = 3
      if (recipientName === 'นภาพร รัตนศิลป์') notification.recipient_user_id = 4
    })

    // POST /notifications/read-all
    if (parts.length === 2 && parts[1] === 'read-all' && method === 'POST') {
      NOTIFICATIONS_DATA.forEach((n) => {
        const ownerMatches = n.recipient_role !== 'tenant' || String(n.recipient_user_id || '') === String(actor.id)
        if (ownerMatches && n.recipient_role === targetRole) {
          n.is_read = true
        }
      })
      return { status: true, code: 200, message: 'อ่านการแจ้งเตือนทั้งหมดเรียบร้อย' }
    }

    // POST /notifications/:id/read
    if (parts.length === 3 && parts[2] === 'read' && method === 'POST') {
      const nId = Number(parts[1])
      const target = NOTIFICATIONS_DATA.find(n => n.id === nId)
      const ownerMatches = target && target.recipient_role === targetRole && (target.recipient_role !== 'tenant' || String(target.recipient_user_id || '') === String(actor.id))
      if (!ownerMatches) return forbiddenResponse(event, 'คุณไม่มีสิทธิ์จัดการการแจ้งเตือนนี้')
      target.is_read = true
      return { status: true, code: 200, data: target }
    }

    // GET /notifications
    const list = NOTIFICATIONS_DATA.filter(n =>
      n.recipient_role === targetRole && (targetRole !== 'tenant' || String(n.recipient_user_id || '') === String(actor.id))
    )

    const unreadCount = list.filter(n => !n.is_read).length
    const tenantUnreadCount = actor.role === 'tenant' ? list.filter(n => !n.is_read).length : 0
    const officerUnreadCount = actor.role === 'tenant' ? 0 : list.filter(n => !n.is_read).length

    return {
      status: true,
      code: 200,
      role: targetRole,
      unread_count: unreadCount,
      tenant_unread_count: tenantUnreadCount,
      officer_unread_count: officerUnreadCount,
      data: list
    }
  }

  // --- /bookings or /bookings/:id/... ---
  if (cleanSlug.startsWith('bookings')) {
    const actor = getMockActor(event)
    if (!actor) return unauthorizedResponse(event, 'กรุณาเข้าสู่ระบบก่อนจัดการการจอง')
    const canManageBookings = actor.role === 'admin' || actor.role === 'staff'
    const parts = cleanSlug.split('/').filter(Boolean)

    if (!bookingsExplicitlyCleared && BOOKINGS_DATA.length === 0 && parts[1] !== 'clear' && parts[1] !== 'reset') {
      INITIAL_BOOKINGS.forEach(ib => {
        BOOKINGS_DATA.push({ ...ib })
      })
    }

    // Seed data created before owner support is mapped once so tenant access is
    // always decided from a stable account id, never from a name in the request.
    BOOKINGS_DATA.forEach((booking: any) => {
      if (booking.tenant_user_id !== undefined && booking.tenant_user_id !== null) return
      const ownerName = String(booking.tenant_name || '').replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
      if (ownerName === 'สมชาย ใจดี') booking.tenant_user_id = 3
      if (ownerName === 'นภาพร รัตนศิลป์') booking.tenant_user_id = 4
    })

    const isBookingOwner = (booking: any) => String(booking?.tenant_user_id || '') === String(actor.id)
    const requireOfficer = () => canManageBookings ? null : forbiddenResponse(event, 'เฉพาะเจ้าหน้าที่ตลาดเท่านั้นที่ดำเนินการขั้นตอนนี้ได้')
    const requireTenantOwner = (booking: any) => actor.role === 'tenant' && isBookingOwner(booking)
      ? null
      : forbiddenResponse(event, 'คุณไม่มีสิทธิ์จัดการการจองนี้')

    // GET /bookings/visit-capacity?market_id=:id
    // Availability is shared across tenants, but this endpoint intentionally
    // returns aggregate counts only—no booking, tenant, or contact data.
    if (parts.length === 2 && parts[1] === 'visit-capacity' && method === 'GET') {
      const query = getQuery(event)
      const marketKey = String(query.market_id || query.market || '').trim()
      const market = MARKETS_DATA.find(m => String(m.id) === marketKey || m.slug === marketKey)
      const occupyingStatuses = new Set(['pending', 'pending_approval', 'approved'])
      const matchesMarket = (booking: any) => {
        if (!marketKey) return true
        if (String(booking.market_id || '') === String(market?.id || marketKey)) return true
        if (market && String(booking.market_name || '').includes(market.name)) return true
        const prefix = market?.slug === 'ratchadaphisek' ? 'RCH-' : ''
        return Boolean(prefix && String(booking.stall_number || '').toUpperCase().startsWith(prefix))
      }
      const counts = new Map<string, any>()
      BOOKINGS_DATA
        .filter((booking: any) =>
          occupyingStatuses.has(String(booking.status || '').trim()) &&
          booking.visit_date &&
          (booking.visit_time_slot || booking.visit_time) &&
          matchesMarket(booking)
        )
        .forEach((booking: any) => {
          const visitTime = String(booking.visit_time_slot || booking.visit_time).trim()
          const key = `${booking.visit_date}__${visitTime}`
          const current = counts.get(key) || {
            market_id: market?.id || booking.market_id || marketKey,
            market_name: market?.name || booking.market_name || '',
            visit_date: booking.visit_date,
            visit_time_slot: visitTime,
            booked_count: 0
          }
          current.booked_count += 1
          counts.set(key, current)
        })
      return { status: true, code: 200, data: Array.from(counts.values()) }
    }

    if (['approve', 'reject', 'mark-visited', 'visited', 'no-show', 'noshow', 'officer-record-proxy'].includes(parts[2] || '')) {
      const denied = requireOfficer()
      if (denied) return denied
    }
    if (['clear', 'reset', 'seed'].includes(parts[1] || '') && actor.role !== 'admin') {
      return forbiddenResponse(event, 'เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการข้อมูลทดสอบได้')
    }

    // 1. POST /bookings/:id/approve (Officer approve — 1 การจอง = 1 แผง = 1 การ์ด)
    if (parts.length === 3 && parts[2] === 'approve' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'approved'
        booking.meeting_point = body.meeting_point || booking.meeting_point || 'หน้ากองอำนวยการตลาด เสาธง 1'
        booking.escort_officer = body.escort_officer || body.officer_name || 'นายธนากร สมบูรณ์ (เจ้าหน้าที่พาชม)'
        booking.officer_notes = body.officer_notes || 'อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง'
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'อนุมัตินัดหมายเข้าชม',
          actor_role: 'officer',
          actor_name: 'เจ้าหน้าที่ผู้ดูแลตลาด',
          timestamp: new Date().toISOString(),
          note: `จุดนัดพบ: ${booking.meeting_point} | ผู้พาชม: ${booking.escort_officer}`
        })

        // แจ้งเตือนผู้เช่า: นัดหมายได้รับการอนุมัติแล้ว
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: booking.tenant_name,
          type: 'approved',
          status_code: 'approved',
          status_label: 'อนุมัตินัดชมแผงแล้ว',
          title: `อนุมัตินัดหมายเข้าชมแผง ${booking.stall_number} (${booking.booking_number})`,
          message: `นัดหมายวัน${booking.visit_date || '-'} เวลา ${booking.visit_time_slot || '-'} ณ ${booking.meeting_point} (ผู้พาชม: ${booking.escort_officer})`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })

        // แจ้งเตือนเจ้าหน้าที่: บันทึกการอนุมัตินัดชมแผงสำเร็จ
        pushNotification({
          recipient_role: 'officer',
          type: 'approved',
          status_code: 'approved',
          status_label: 'ยืนยันนัดชมแผงแล้ว',
          title: `อนุมัตินัดชมแผง ${booking.stall_number} (${booking.booking_number}) เรียบร้อย`,
          message: `ยืนยันนัดหมายของคุณ${booking.tenant_name} วัน${booking.visit_date || '-'} เวลา ${booking.visit_time_slot || '-'} ณ ${booking.market_name}`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })
      }
      return { status: true, code: 200, message: 'อนุมัตินัดหมายเรียบร้อย', data: booking }
    }

    // 2. POST /bookings/:id/reject (Officer reject -> shifts queue)
    if (parts.length === 3 && parts[2] === 'reject' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'rejected'
        booking.holding_stall = false
        booking.rejection_reason = body.rejection_reason || 'ไม่อนุมัติคำขอจอง'
        booking.officer_notes = body.officer_notes || ''
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'ไม่อนุมัตินัดหมาย (ปล่อยสิทธิ์)',
          actor_role: 'officer',
          actor_name: 'เจ้าหน้าที่ผู้ดูแลตลาด',
          timestamp: new Date().toISOString(),
          note: `เหตุผล: ${booking.rejection_reason} ${booking.officer_notes ? '(' + booking.officer_notes + ')' : ''}`
        })

        // แจ้งเตือนผู้เช่า: คำขอนัดชมแผงไม่ผ่านการอนุมัติ
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: booking.tenant_name,
          type: 'rejected',
          status_code: 'rejected',
          status_label: 'ไม่อนุมัตินัดหมาย',
          title: `ไม่อนุมัตินัดหมายเข้าชมแผง ${booking.stall_number} (${booking.booking_number})`,
          message: `คำขอนัดชมแผง ${booking.stall_number} (${booking.market_name}) ไม่ได้รับการอนุมัติ เหตุผล: ${booking.rejection_reason}`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })

        // Shift queue for this stall
        shiftQueueForStall(booking.stall_number)
      }
      return { status: true, code: 200, message: 'ปฏิเสธคำขอและปล่อยสิทธิ์ให้คิวถัดไปเรียบร้อย', data: booking }
    }

    // 3. POST /bookings/:id/mark-visited (Officer confirms visit done -> moves directly to interested for lease application)
    if (parts.length === 3 && (parts[2] === 'mark-visited' || parts[2] === 'visited') && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'interested'
        booking.officer_notes = body.officer_notes || 'เจ้าหน้าที่ยืนยันการเช่าเรียบร้อย เข้าสู่ขั้นตอนการยื่นคำร้อง'
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'ยืนยันการเช่า (พร้อมยื่นคำร้องขอเช่า)',
          actor_role: 'officer',
          actor_name: body.officer_name || 'เจ้าหน้าที่ตลาด',
          timestamp: new Date().toISOString(),
          note: 'เจ้าหน้าที่ยืนยันการเช่าเรียบร้อย ผู้เช่าสามารถยื่นคำร้องขอเช่าได้ทันที'
        })

        // แจ้งเตือนผู้เช่า: เจ้าหน้าที่ยืนยันการเข้าชมและสิทธิ์การเช่าแล้ว สามารถยื่นคำร้องได้ทันที
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: booking.tenant_name,
          type: 'interested',
          status_code: 'interested',
          status_label: 'พร้อมยื่นคำร้องขอเช่า',
          title: `ยืนยันการเช่าแผง ${booking.stall_number} สำเร็จ! (${booking.booking_number})`,
          message: `เจ้าหน้าที่ยืนยันการเข้าชมแผง ${booking.stall_number} (${booking.market_name}) เรียบร้อยแล้ว คุณสามารถกดยื่นคำร้องขอเช่าแผงได้ทันที`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })

        // แจ้งเตือนเจ้าหน้าที่: บันทึกยืนยันการเช่าแล้ว รอผู้เช่ายื่นคำร้อง
        pushNotification({
          recipient_role: 'officer',
          type: 'interested',
          status_code: 'interested',
          status_label: 'รอผู้เช่ายื่นคำร้อง',
          title: `บันทึกยืนยันการเช่าแผง ${booking.stall_number} (${booking.booking_number})`,
          message: `ยืนยันสิทธิ์การเช่าแผง ${booking.stall_number} ให้คุณ${booking.tenant_name} เรียบร้อย อยู่ระหว่างรอผู้เช่ายื่นคำร้องขอเช่า`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })
      }
      return { status: true, code: 200, message: 'ยืนยันการเช่าเรียบร้อย ผู้เช่าสามารถยื่นคำร้องขอเช่าได้ทันที', data: booking }
    }

    // 3.1 POST /bookings/:id/no-show (Officer records that tenant did not attend appointment)
    if (parts.length === 3 && (parts[2] === 'no-show' || parts[2] === 'noshow') && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        const wasHolding = booking.holding_stall
        booking.status = 'no_show'
        booking.holding_stall = false
        booking.officer_notes = body.officer_notes || 'ผู้เช่าไม่มาตามนัดหมายดูแผงหน้างาน'
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'ไม่มาตามนัดหมาย (สละสิทธิ์)',
          actor_role: 'officer',
          actor_name: body.officer_name || 'จนท. ตรวจสอบการนัด',
          timestamp: new Date().toISOString(),
          note: body.officer_notes || 'ผู้เช่าไม่มาตามวันเวลาที่นัดหมาย สละสิทธิ์ส่งต่อคิวถัดไป'
        })

        pushNotification({
          recipient_role: 'tenant',
          recipient_name: booking.tenant_name,
          type: 'no_show',
          status_code: 'no_show',
          status_label: 'ไม่มาตามนัดหมาย (ตัดสิทธิ์)',
          title: `ตัดสิทธิ์การจองแผง ${booking.stall_number} เนื่องจากไม่มาตามนัด (${booking.booking_number})`,
          message: `คุณไม่ได้มาเข้าชมแผง ${booking.stall_number} (${booking.market_name}) ตามวันและเวลาที่นัดหมาย ระบบจึงปล่อยสิทธิ์ให้คิวถัดไป`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })

        if (wasHolding) {
          shiftQueueForStall(booking.stall_number)
        }
      }
      return { status: true, code: 200, message: 'บันทึกสถานะไม่มาตามนัดหมายเรียบร้อย', data: booking }
    }

    // 4. POST /bookings/:id/decide (Tenant decision: interested or not_interested)
    if (parts.length === 3 && parts[2] === 'decide' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        const denied = requireTenantOwner(booking)
        if (denied) return denied
        booking.timeline = booking.timeline || []
        if (body.decision === 'interested') {
          booking.status = 'interested'
          // 7 days deadline to submit lease application
          const appDate = new Date(Date.now() + 7 * 86400000)
          booking.application_deadline = `${appDate.toISOString().slice(0, 10)}T23:59:59`
          booking.timeline.push({
            action: 'ยืนยันสนใจเช่าแผง (รอยื่นคำร้อง)',
            actor_role: 'tenant',
            actor_name: booking.tenant_name,
            timestamp: new Date().toISOString(),
            note: `ยืนยันสนใจเช่าแผง กรุณายื่นคำร้องขอเช่าภายใน 7 วัน (สิ้นสุด ${booking.application_deadline.slice(0, 10)} 23:59 น.)`
          })

          pushNotification({
            recipient_role: 'officer',
            type: 'interested',
            status_code: 'interested',
            status_label: 'ผู้เช่ายืนยันสนใจเช่า',
            title: `ผู้เช่ายืนยันสนใจเช่าแผง ${booking.stall_number} (${booking.booking_number})`,
            message: `คุณ${booking.tenant_name} ยืนยันสนใจเช่าแผง ${booking.stall_number} (${booking.market_name}) อยู่ระหว่างรอยื่นคำร้องขอเช่า`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: booking.stall_number,
            market_name: booking.market_name,
            project_name: booking.project_name
          })
        } else {
          booking.status = 'not_interested'
          booking.holding_stall = false
          booking.not_interested_reason = body.reason || 'ทำเลไม่เหมาะกับประเภทสินค้า'
          booking.timeline.push({
            action: 'แจ้งไม่สนใจเช่า (สละสิทธิ์)',
            actor_role: 'tenant',
            actor_name: booking.tenant_name,
            timestamp: new Date().toISOString(),
            note: `เหตุผล: ${booking.not_interested_reason} ปล่อยสิทธิ์ให้คิวถัดไป`
          })

          pushNotification({
            recipient_role: 'officer',
            type: 'not_interested',
            status_code: 'not_interested',
            status_label: 'ผู้เช่าสละสิทธิ์แผง',
            title: `ผู้เช่าสละสิทธิ์แผง ${booking.stall_number} (${booking.booking_number})`,
            message: `คุณ${booking.tenant_name} แจ้งไม่ประสงค์เช่าแผง ${booking.stall_number} (${booking.market_name}) เหตุผล: ${booking.not_interested_reason}`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: booking.stall_number,
            market_name: booking.market_name,
            project_name: booking.project_name
          })

          shiftQueueForStall(booking.stall_number)
        }
      }
      return { status: true, code: 200, message: 'บันทึกการตัดสินใจเรียบร้อย', data: booking }
    }

    // 5. POST /bookings/:id/officer-record-proxy (Officer record decision on behalf of tenant)
    if (parts.length === 3 && parts[2] === 'officer-record-proxy' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.proxy_recorded_by = body.officer_name || 'เจ้าหน้าที่ธุรการตลาด'
        booking.proxy_channel = body.channel || 'phone'
        booking.timeline = booking.timeline || []

        const channelLabel = body.channel === 'phone' ? 'ทางโทรศัพท์' : body.channel === 'onsite' ? 'แจ้ง ณ จุดบริการหน้างาน' : 'ช่องทางอื่น'

        if (body.decision === 'interested') {
          booking.status = 'interested'
          const appDate = new Date(Date.now() + 7 * 86400000)
          booking.application_deadline = `${appDate.toISOString().slice(0, 10)}T23:59:59`
          booking.timeline.push({
            action: `จนท. บันทึกผลแทนผู้เช่า (${channelLabel}): สนใจเช่า`,
            actor_role: 'officer',
            actor_name: booking.proxy_recorded_by,
            timestamp: new Date().toISOString(),
            note: `บันทึกแทนผู้เช่า ยืนยันสนใจเช่าแผง ${body.notes ? '(' + body.notes + ')' : ''}`
          })

          pushNotification({
            recipient_role: 'tenant',
            recipient_name: booking.tenant_name,
            type: 'interested',
            status_code: 'interested',
            status_label: 'พร้อมยื่นคำร้องขอเช่า',
            title: `ยืนยันสนใจเช่าแผง ${booking.stall_number} สำเร็จ (${booking.booking_number})`,
            message: `เจ้าหน้าที่บันทึกยืนยันความสนใจเช่าแผง ${booking.stall_number} (${booking.market_name}) ให้คุณเรียบร้อยแล้ว กรุณายื่นคำร้องขอเช่าภายใน 7 วัน`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: booking.stall_number,
            market_name: booking.market_name,
            project_name: booking.project_name
          })
        } else {
          booking.status = 'not_interested'
          booking.holding_stall = false
          booking.not_interested_reason = body.reason || 'ผู้เช่าแจ้งไม่ประสงค์เช่า'
          booking.timeline.push({
            action: `จนท. บันทึกผลแทนผู้เช่า (${channelLabel}): ไม่สนใจ`,
            actor_role: 'officer',
            actor_name: booking.proxy_recorded_by,
            timestamp: new Date().toISOString(),
            note: `เหตุผล: ${booking.not_interested_reason}. ปล่อยสิทธิ์ให้คิวถัดไป`
          })
          shiftQueueForStall(booking.stall_number)
        }
      }
      return { status: true, code: 200, message: 'บันทึกผลแทนผู้เช่าเรียบร้อย', data: booking }
    }

    // 6. POST /bookings/:id/select-slot (Tenant reaches queue #1 or changes slot)
    if (parts.length === 3 && parts[2] === 'select-slot' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        const denied = requireTenantOwner(booking)
        if (denied) return denied
        booking.visit_date = body.visit_date || new Date().toISOString().slice(0, 10)
        booking.visit_time_slot = body.visit_time_slot || '10:00 - 11:30'
        booking.status = 'pending_approval'
        booking.holding_stall = true
        delete booking.slot_selection_deadline
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'เลือกวันและเวลานัดชมแผง',
          actor_role: 'tenant',
          actor_name: booking.tenant_name,
          timestamp: new Date().toISOString(),
          note: `นัดหมายวันที่ ${booking.visit_date} เวลา ${booking.visit_time_slot} (รอ จนท. อนุมัติ)`
        })

        // แจ้งเตือนเจ้าหน้าที่: ผู้เช่าที่เลื่อนจากคิวสำรองเลือกวันนัดหมายแล้ว รออนุมัติ
        pushNotification({
          recipient_role: 'officer',
          type: 'pending_approval',
          status_code: 'pending_approval',
          status_label: 'รออนุมัติวันนัด (จากคิวสำรอง)',
          title: `ผู้เช่าเลือกวันนัดชมแผง ${booking.stall_number} แล้ว (${booking.booking_number})`,
          message: `คุณ${booking.tenant_name} เลือกวันนัดชมแผง ${booking.stall_number} (${booking.market_name}) วันที่ ${booking.visit_date} เวลา ${booking.visit_time_slot} รอเจ้าหน้าที่อนุมัติ`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })

        // แจ้งเตือนผู้เช่า: บันทึกวันนัดชมแผงสำเร็จ รอเจ้าหน้าที่อนุมัติ
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: booking.tenant_name,
          type: 'pending_approval',
          status_code: 'pending_approval',
          status_label: 'รออนุมัติวันนัด',
          title: `ส่งวันนัดชมแผง ${booking.stall_number} สำเร็จ (${booking.booking_number})`,
          message: `บันทึกวันนัดหมายวันที่ ${booking.visit_date} เวลา ${booking.visit_time_slot} เรียบร้อยแล้ว อยู่ระหว่างรอเจ้าหน้าที่อนุมัติ`,
          booking_id: booking.id,
          booking_number: booking.booking_number,
          stall_number: booking.stall_number,
          market_name: booking.market_name,
          project_name: booking.project_name
        })
      }
      return { status: true, code: 200, message: 'บันทึกวันนัดหมายเรียบร้อย รอเจ้าหน้าที่อนุมัติ', data: booking }
    }

    // 7. POST /bookings/:id/cancel (Cancel booking)
    if (parts.length === 3 && parts[2] === 'cancel' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        if (!canManageBookings) {
          const denied = requireTenantOwner(booking)
          if (denied) return denied
        }
        const wasHolding = booking.holding_stall
        const wasQueue = booking.status === 'waiting_queue'
        const stallNum = booking.stall_number
        const cancelReason = body.reason || (wasQueue ? 'ผู้เช่ายกเลิกการต่อคิว' : 'ยกเลิกคำขอจอง')
        booking.status = 'cancelled'
        booking.holding_stall = false
        booking.cancel_reason = cancelReason
        delete booking.queue_position
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: wasQueue ? 'ยกเลิกการต่อคิว' : 'ยกเลิกการจอง',
          actor_role: canManageBookings ? 'officer' : 'tenant',
          actor_name: canManageBookings ? 'เจ้าหน้าที่ตลาด' : booking.tenant_name,
          timestamp: new Date().toISOString(),
          note: cancelReason
        })

        if (canManageBookings) {
          // เจ้าหน้าที่เป็นคนยกเลิก -> แจ้งเตือนผู้เช่า
          pushNotification({
            recipient_role: 'tenant',
            recipient_name: booking.tenant_name,
            type: 'cancelled',
            status_code: 'cancelled',
            status_label: 'ถูกยกเลิกโดยเจ้าหน้าที่',
            title: `รายการจองแผง ${stallNum} ถูกยกเลิก (${booking.booking_number})`,
            message: `เจ้าหน้าที่ยกเลิกรายการจองแผง ${stallNum} (${booking.market_name}) เหตุผล: ${cancelReason}`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: stallNum,
            market_name: booking.market_name,
            project_name: booking.project_name
          })
        } else {
          // ผู้เช่าเป็นคนยกเลิก -> แจ้งเตือนเจ้าหน้าที่ และยืนยันให้ผู้เช่า
          pushNotification({
            recipient_role: 'officer',
            type: 'cancelled',
            status_code: 'cancelled',
            status_label: wasQueue ? 'ผู้เช่ายกเลิกคิวสำรอง' : 'ผู้เช่ายกเลิกการจอง',
            title: `ผู้เช่ายกเลิก${wasQueue ? 'คิวสำรอง' : 'การจอง'}แผง ${stallNum} (${booking.booking_number})`,
            message: `คุณ${booking.tenant_name} ยกเลิก${wasQueue ? 'การต่อคิวสำรอง' : 'คำขอนัดชม'}แผง ${stallNum} (${booking.market_name}) เหตุผล: ${cancelReason}`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: stallNum,
            market_name: booking.market_name,
            project_name: booking.project_name
          })

          pushNotification({
            recipient_role: 'tenant',
            recipient_name: booking.tenant_name,
            type: 'cancelled',
            status_code: 'cancelled',
            status_label: 'ยกเลิกการจองแล้ว',
            title: `ยกเลิก${wasQueue ? 'คิวสำรอง' : 'การจอง'}แผง ${stallNum} เรียบร้อย (${booking.booking_number})`,
            message: `ระบบได้ยกเลิกรายการ ${booking.booking_number} แผง ${stallNum} (${booking.market_name}) ตามคำขอของคุณเรียบร้อยแล้ว`,
            booking_id: booking.id,
            booking_number: booking.booking_number,
            stall_number: stallNum,
            market_name: booking.market_name,
            project_name: booking.project_name
          })
        }

        if (wasHolding) {
          shiftQueueForStall(stallNum)
        } else if (wasQueue) {
          // Re-index remaining queues behind this cancelled one
          const remainingQueues = BOOKINGS_DATA.filter(b => b.stall_number === stallNum && b.status === 'waiting_queue')
            .sort((a, b) => (a.queue_position || 99) - (b.queue_position || 99))
          remainingQueues.forEach((q, idx) => {
            q.queue_position = idx + 1
          })
        }
      }
      return { status: true, code: 200, message: 'ยกเลิกรายการเรียบร้อย', data: booking }
    }

    // Clear all bookings & reset stalls to available
    if (parts.length === 2 && parts[1] === 'clear') {
      bookingsExplicitlyCleared = true
      BOOKINGS_DATA.length = 0
      APPLICATIONS_DATA.length = 0
      CONTRACTS_DATA.length = 0
      NOTIFICATIONS_DATA.length = 0
      syncAllStallStatuses()
      return { status: true, code: 200, message: 'ล้างข้อมูลการจองและคำร้องทั้งหมดเรียบร้อย' }
    }

    // Reset to initial authentic demo bookings
    if (parts.length === 2 && parts[1] === 'reset') {
      bookingsExplicitlyCleared = false
      BOOKINGS_DATA.length = 0
      INITIAL_BOOKINGS.forEach(ib => {
        BOOKINGS_DATA.push({ ...ib })
      })
      NOTIFICATIONS_DATA.length = 0
      INITIAL_NOTIFICATIONS.forEach(inItem => {
        NOTIFICATIONS_DATA.push({ ...inItem })
      })
      syncAllStallStatuses()
      return { status: true, code: 200, message: 'รีเซ็ตข้อมูลการจองเริ่มต้นเรียบร้อยแล้ว', data: BOOKINGS_DATA }
    }

    // Seed / Add test mock bookings (เพิ่มทีละ 1 รายการ สถานะ: รอเจ้าหน้าที่อนุมัติ)
    if (parts.length === 2 && parts[1] === 'seed') {
      bookingsExplicitlyCleared = false

      // สุ่มหรือสร้างรหัสการจองใหม่ที่ไม่ซ้ำ
      const existingNumbers = new Set(BOOKINGS_DATA.map(b => b.booking_number))
      let randomNum = Math.floor(3020 + Math.random() * 950)
      while (existingNumbers.has(`#${randomNum}`)) {
        randomNum = Math.floor(3020 + Math.random() * 950)
      }

      const testPresets = [
        { market: 'ตลาดบางแคภิรมย์', project: 'โครงการ 01 (5 เบ็ดเตล็ด)', zone: '5 เบ็ดเตล็ด (ชั้น 1)', prefix: 'BKH-01', rate: 1800, business: 'ของใช้ในครัวเรือนและสินค้าชุมชน OTOP' },
        { market: 'ตลาดบางแคภิรมย์', project: 'โครงการ 02 (1 อาหารปรุง)', zone: '1 อาหารปรุง', prefix: 'BKH-02', rate: 2200, business: 'อาหารตามสั่ง ก๋วยเตี๋ยวเรือ และเครื่องดื่ม' },
        { market: 'ตลาดนัดจตุจักร', project: 'โครงการที่ 1', zone: 'โครงการที่ 1 (ชั้น 1)', prefix: 'JJ-1', rate: 2500, business: 'เสื้อผ้าแฟชั่นและเครื่องประดับวินเทจ' },
        { market: 'ตลาดนัดจตุจักร', project: 'โครงการที่ 3', zone: 'โครงการที่ 3 (ชั้น 1)', prefix: 'JJ-3', rate: 3200, business: 'ของตกแต่งบ้านเซรามิกและงานปั้น' },
        { market: 'ตลาดประชานิเวศน์ 1', project: 'โครงการ 01 (D)', zone: 'สินค้าทั่วไป อาหาร และบริการ', prefix: 'PRA-01', rate: 2200, business: 'อาหารปรุงสำเร็จและเบเกอรี่โฮมเมด' },
        { market: 'ตลาดมีนบุรี', project: 'โครงการ 01 (โซนหลัก (ชั้นล่าง))', zone: 'ศูนย์ค้าส่งผักผลไม้สดเกษตรกร', prefix: 'MIN-01', rate: 1500, business: 'ผักผลไม้เกษตรอินทรีย์สดจากสวน' },
        { market: 'ตลาดสิงหา', project: 'โครงการ 01 (โซนแผงค้าตลาดสิงหา)', zone: 'โซนแผงค้าตลาดสิงหา', prefix: 'SIN-01', rate: 2500, business: 'แซนวิชเพื่อสุขภาพและเครื่องดื่มร้อน' },
        { market: 'ตลาดพระเครื่องวงเวียนเล็ก', project: 'โครงการ 01 (ฉ)', zone: 'โซนพระบูชาและเหรียญคณาจารย์', prefix: 'WON-01', rate: 2400, business: 'ศูนย์พระเครื่อง พระบูชา และวัตถุมงคล' }
      ]

      const tenants = [
        { name: 'สมชาย ใจดี', phone: '081-234-5678', id: '1-1004-99887-12-3' },
        { name: 'กานดา วงศ์สุวรรณ', phone: '089-876-5432', id: '3-1005-44221-55-8' },
        { name: 'วิชัย มีทรัพย์', phone: '086-332-1188', id: '2-1002-33889-44-1' },
        { name: 'ศิริพร ค้าเจริญ', phone: '082-456-7890', id: '1-1012-77665-99-0' }
      ]

      const upcomingDates = [
        'อาทิตย์ 25 ตุลาคม 2569',
        'พุธ 28 ตุลาคม 2569',
        'ศุกร์ 30 ตุลาคม 2569',
        'เสาร์ 31 ตุลาคม 2569',
        'อาทิตย์ 1 พฤศจิกายน 2569'
      ]

      const timeSlots = [
        '09.30 - 10.30 น.',
        '11.00 - 12.00 น.',
        '13.00 - 14.00 น.',
        '15.30 - 16.30 น.'
      ]

      const sample = testPresets[Math.floor(Math.random() * testPresets.length)]
      const tenant = tenants[Math.floor(Math.random() * tenants.length)]
      const visitDate = upcomingDates[Math.floor(Math.random() * upcomingDates.length)]
      const visitSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]

      // Pick an actual available stall from REAL_STALLS_DATA
      const availableStalls = REAL_STALLS_DATA.filter(s => s.market_name === sample.market && s.status === 'available')
      const pickedStall = availableStalls.length > 0
        ? availableStalls[Math.floor(Math.random() * availableStalls.length)]
        : null
      const actualStallNum = pickedStall ? pickedStall.stall_number : `${sample.prefix}-${Math.floor(10 + Math.random() * 89)}`
      const nextId = Date.now() + Math.floor(Math.random() * 1000)

      // สร้างรายการใหม่ 1 รายการ สถานะ: รอเจ้าหน้าที่อนุมัติ (pending_approval) เท่านั้น
      const newBooking = {
        id: nextId,
        booking_number: `#${randomNum}`,
        market_name: sample.market,
        project_name: pickedStall?.project_name || sample.project,
        stall_number: actualStallNum,
        stall_count: 1,
        stall_monthly_rate: pickedStall?.monthly_rate || sample.rate,
        stall_zone_name: pickedStall?.zone_name || sample.zone,
        tenant_name: tenant.name,
        tenant_phone: tenant.phone,
        tenant_id_card: tenant.id,
        intended_business: sample.business,
        visit_date: visitDate,
        visit_time_slot: visitSlot,
        meeting_point: `หน้ากองอำนวยการ${sample.market}`,
        status: 'pending_approval',
        holding_stall: true,
        timeline: [
          {
            action: 'ยื่นขอนัดดูแผง (รอเจ้าหน้าที่อนุมัติ)',
            actor_role: 'tenant',
            actor_name: tenant.name,
            timestamp: new Date().toISOString(),
            note: `เลือกวันนัด ${visitDate} เวลา ${visitSlot} (รอเจ้าหน้าที่พิจารณาอนุมัติ)`
          }
        ],
        created_at: new Date().toISOString()
      }

      // นำเข้ารายการใหม่ 1 รายการไว้บนสุดเสมอ
      BOOKINGS_DATA.unshift(newBooking)
      syncAllStallStatuses()

      // แจ้งเตือนทั้งเจ้าหน้าที่และผู้เช่า
      pushNotification({
        recipient_role: 'officer',
        type: 'pending_approval',
        status_code: 'pending_approval',
        status_label: 'รออนุมัติวันนัด',
        title: `คำขอนัดชมแผงใหม่ ${newBooking.stall_number} (${newBooking.booking_number})`,
        message: `คุณ${newBooking.tenant_name} ขอนัดเข้าชมแผง ${newBooking.stall_number} (${newBooking.market_name}) วันที่ ${newBooking.visit_date} เวลา ${newBooking.visit_time_slot} รอเจ้าหน้าที่อนุมัติ`,
        booking_id: newBooking.id,
        booking_number: newBooking.booking_number,
        stall_number: newBooking.stall_number,
        market_name: newBooking.market_name,
        project_name: newBooking.project_name
      })

      pushNotification({
        recipient_role: 'tenant',
        recipient_name: newBooking.tenant_name,
        type: 'pending_approval',
        status_code: 'pending_approval',
        status_label: 'รออนุมัติวันนัด',
        title: `ส่งคำขอนัดชมแผง ${newBooking.stall_number} สำเร็จ (${newBooking.booking_number})`,
        message: `ระบบได้รับคำขอนัดชมแผง ${newBooking.stall_number} (${newBooking.market_name}) วันที่ ${newBooking.visit_date} เวลา ${newBooking.visit_time_slot} อยู่ระหว่างรอเจ้าหน้าที่อนุมัติ`,
        booking_id: newBooking.id,
        booking_number: newBooking.booking_number,
        stall_number: newBooking.stall_number,
        market_name: newBooking.market_name,
        project_name: newBooking.project_name
      })

      return {
        status: true,
        code: 200,
        message: 'เพิ่มข้อมูลการจองทดสอบสถานะ "รอเจ้าหน้าที่อนุมัติ" เรียบร้อยแล้ว',
        added_booking: newBooking,
        data: BOOKINGS_DATA
      }
    }

    // 8. GET /bookings/stall-queue/:stallIdent or /bookings/waiting-queue/:stallIdent
    if (parts.length === 3 && (parts[1] === 'stall-queue' || parts[1] === 'waiting-queue')) {
      const stallIdent = decodeURIComponent(parts[2]).trim()
      const activeHolder = BOOKINGS_DATA.find(b => {
        const numbers = String(b.stall_number || '').split(',').map((s: string) => s.trim())
        return numbers.includes(stallIdent) && b.holding_stall && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status)
      })
      const waitingQueues = BOOKINGS_DATA.filter(b => {
        const numbers = String(b.stall_number || '').split(',').map((s: string) => s.trim())
        return numbers.includes(stallIdent) && b.status === 'waiting_queue'
      }).sort((a, b) => (a.queue_position || 99) - (b.queue_position || 99))

      const maskName = (name: string) => {
        if (!name) return 'ผู้ถือแผง'
        const p = name.trim().split(/\s+/)
        if (p.length >= 2) {
          return `${p[0].slice(0, 2)}*** ${p[1].slice(0, 2)}***`
        }
        return `${name.slice(0, 2)}***`
      }

      const maskPhone = (phone: string) => {
        if (!phone) return '08X-XXX-XXXX'
        const clean = phone.replace(/[^0-9]/g, '')
        if (clean.length === 10) {
          return `${clean.slice(0, 3)}-XXX-${clean.slice(6)}`
        }
        return phone.slice(0, 3) + '-XXX-XXXX'
      }

      const statusLabels: Record<string, string> = {
        approved: 'นัดหมายสำเร็จ (รอเข้าชมแผง)',
        pending_approval: 'รอนัดหมายเข้าชม',
        pending_slot: 'รอเลือกวันนัดหมาย',
        interested: 'ยืนยันสนใจเช่า (รอยื่นคำร้อง)',
        lease_applied: 'ยื่นคำร้องขอเช่าแล้ว',
        waiting_queue: 'อยู่ในคิวสำรอง'
      }

      return {
        stall_number: stallIdent,
        queue_count: waitingQueues.length,
        total_waiting_count: waitingQueues.length,
        total_waiting: waitingQueues.length,
        next_queue_number: waitingQueues.length + 1,
        current_position: waitingQueues.length + 1,
        has_waiting_list: waitingQueues.length > 0,
        current_booker: activeHolder ? {
          queue_number: 1,
          booking_number: activeHolder.booking_number,
          masked_name: maskName(activeHolder.tenant_name),
          masked_phone: maskPhone(activeHolder.tenant_phone),
          visit_date: activeHolder.visit_date,
          visit_time_slot: activeHolder.visit_time_slot,
          status: activeHolder.status,
          status_label: statusLabels[activeHolder.status] || 'ติดจอง',
          deadline: activeHolder.decision_deadline || activeHolder.application_deadline || activeHolder.visit_date,
          days_left_estimate: 2
        } : null,
        current_holder: activeHolder ? {
          booking_number: activeHolder.booking_number,
          status: activeHolder.status,
          status_label: statusLabels[activeHolder.status] || 'ติดจอง',
          deadline: activeHolder.decision_deadline || activeHolder.application_deadline || activeHolder.visit_date,
          masked_name: maskName(activeHolder.tenant_name),
        } : null,
        queues: waitingQueues.map((q, idx) => ({
          id: q.id,
          queue_number: q.queue_position || (idx + 1),
          queue_position: q.queue_position || (idx + 1),
          booking_number: q.booking_number,
          waiting_since: q.waiting_since || q.created_at,
          masked_name: maskName(q.tenant_name),
          masked_phone: maskPhone(q.tenant_phone),
          intended_business: q.intended_business,
          visit_date: q.visit_date,
          visit_time_slot: q.visit_time_slot,
          status: q.status,
          status_label: 'อยู่ในคิวสำรอง',
          days_left_estimate: (idx + 1) * 3
        }))
      }
    }

    // 9. POST /bookings (Create new booking or queue)
    if (parts.length === 1 && method === 'POST') {
      if (actor.role !== 'tenant') return forbiddenResponse(event, 'เฉพาะบัญชีผู้เช่าเท่านั้นที่สร้างรายการจองได้')
      const body = await readBody(event).catch(() => ({}))
      const tenantProfile = MOCK_USERS[actor.username]
      const stallIdent = String(body.stall_ident || body.stall_number || '').trim()
      const realStall = REAL_STALLS_MAP.get(stallIdent)
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const bookingNumber = `BK-${new Date().getFullYear()}-${randomNum}`
      const isQueue = Boolean(body.is_queue)

      const stallNumber = stallIdent || realStall?.stall_number || `BK-${Date.now().toString().slice(-4)}`

      // Prevent duplicate active booking on the same stall by the same applicant/tenant
      const normalizePersonName = (val: any) =>
        String(val || '')
          .replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '')
          .replace(/\([^)]*\)/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase()
      const normalizeDigits = (val: any) => String(val || '').replace(/\D/g, '')

      const reqNameNorm = normalizePersonName(tenantProfile?.full_name)
      const reqPhoneNorm = normalizeDigits(tenantProfile?.phone)
      const reqIdCardNorm = normalizeDigits(tenantProfile?.citizen_id)
      const reqOwnerId = String(actor.id)

      const existingSameTenantBooking = BOOKINGS_DATA.find((b) => {
        if (b.stall_number !== stallNumber) return false
        if (['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status)) return false
        const existingOwnerId = b.tenant_user_id !== undefined && b.tenant_user_id !== null ? String(b.tenant_user_id) : ''
        // Ownership is account based. Editable contact data must never affect
        // either duplicate detection or access control.
        if (!existingOwnerId) return false
        if (reqOwnerId !== existingOwnerId) return false
        const bNameNorm = normalizePersonName(b.tenant_name)
        const bPhoneNorm = normalizeDigits(b.tenant_phone)
        const bIdCardNorm = normalizeDigits(b.tenant_id_card)
        const nameMatch = Boolean(reqNameNorm && bNameNorm && reqNameNorm === bNameNorm)
        const phoneMatch = Boolean(reqPhoneNorm.length >= 9 && bPhoneNorm.length >= 9 && reqPhoneNorm === bPhoneNorm)
        const idCardMatch = Boolean(reqIdCardNorm.length === 13 && bIdCardNorm.length === 13 && reqIdCardNorm === bIdCardNorm)
        return true
      })

      if (existingSameTenantBooking) {
        setResponseStatus(event, 409)
        const isWaiting = existingSameTenantBooking.status === 'waiting_queue'
        return {
          status: false,
          code: 409,
          detail: isWaiting
            ? `คุณอยู่ในคิวสำรองของแผง ${stallNumber} อยู่แล้ว (รหัส ${existingSameTenantBooking.booking_number}) ไม่สามารถจองหรือเข้าคิวซ้ำได้`
            : `คุณได้ทำการจองแผง ${stallNumber} ไว้แล้ว (รหัส ${existingSameTenantBooking.booking_number}) ไม่สามารถจองซ้ำได้`,
          message: `ไม่สามารถจองแผง ${stallNumber} ซ้ำได้`,
          existing_booking: existingSameTenantBooking
        }
      }

      // Check if stall is already held by another active applicant
      const activeHolder = BOOKINGS_DATA.find(
        b => b.stall_number === stallNumber && !['waiting_queue', 'rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status)
      )
      const effectiveIsQueue = isQueue || Boolean(activeHolder)

      // Prevent the same tenant from booking an overlapping visit_date + visit_time_slot in another project/market
      if (!effectiveIsQueue && body.visit_date && (body.visit_time || body.visit_time_slot)) {
        const parseDateNorm = (rawDate: any) => {
          const text = String(rawDate || '').trim()
          if (!text) return ''
          if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
          const thaiMonths: Record<string, string> = {
            'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
            'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
            'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12',
            'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
            'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
            'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
          }
          for (const [mName, mm] of Object.entries(thaiMonths)) {
            if (text.includes(mName)) {
              const nums = text.match(/\d+/g)
              if (nums && nums.length >= 2) {
                const day = String(nums[0]).padStart(2, '0')
                let year = Number(nums[nums.length - 1])
                if (year > 2400) year -= 543
                return `${year}-${mm}-${day}`
              }
            }
          }
          return text
        }
        const parseSlotNorm = (rawSlot: any) => {
          const text = String(rawSlot || '').trim().replace(/\./g, ':')
          const match = text.match(/(\d{1,2}):(\d{2})/)
          if (!match) return text
          return `${String(match[1]).padStart(2, '0')}:${match[2]}`
        }

        const reqDateIso = parseDateNorm(body.visit_date)
        const reqSlotStart = parseSlotNorm(body.visit_time || body.visit_time_slot)
        const reqMarketNorm = String(body.market_name || realStall?.market_name || '').trim().toLowerCase()
        const reqProjectNorm = String(body.project_name || realStall?.project_name || '').trim().toLowerCase()
        const reqGroupId = String(body.appointment_group_id || '').trim()

        const conflictingAppointment = BOOKINGS_DATA.find((b) => {
          if (!['pending', 'pending_approval', 'approved'].includes(b.status)) return false

          // Same multi-stall submission batch or same market & project visit round is NOT a conflict
          if (reqGroupId && b.appointment_group_id && String(b.appointment_group_id).trim() === reqGroupId) {
            return false
          }
          const bMarketNorm = String(b.market_name || '').trim().toLowerCase()
          const bProjectNorm = String(b.project_name || '').trim().toLowerCase()
          if (reqMarketNorm && bMarketNorm === reqMarketNorm && reqProjectNorm && bProjectNorm === reqProjectNorm) {
            return false
          }

          const bNameNorm = normalizePersonName(b.tenant_name)
          const bPhoneNorm = normalizeDigits(b.tenant_phone)
          const bIdCardNorm = normalizeDigits(b.tenant_id_card)
          const isSameTenant = b.tenant_user_id !== undefined && b.tenant_user_id !== null && reqOwnerId === String(b.tenant_user_id)
          if (!isSameTenant) return false

          const bDateIso = parseDateNorm(b.visit_date)
          const bSlotStart = parseSlotNorm(b.visit_time_slot)
          return Boolean(reqDateIso && reqSlotStart && bDateIso === reqDateIso && bSlotStart === reqSlotStart)
        })

        if (conflictingAppointment) {
          setResponseStatus(event, 409)
          return {
            status: false,
            code: 409,
            detail: `คุณมีนัดหมายเข้าชมแผง ${conflictingAppointment.stall_number} ที่ ${conflictingAppointment.market_name} (${conflictingAppointment.project_name}) ในวันและเวลานี้อยู่แล้ว (รหัส ${conflictingAppointment.booking_number}) ไม่สามารถจองเวลาชนกันได้`,
            message: 'ไม่สามารถจองวันและเวลานัดหมายชนกันได้',
            conflicting_booking: conflictingAppointment
          }
        }
      }

      // Count existing queues
      const existingQueues = BOOKINGS_DATA.filter(b => b.stall_number === stallNumber && b.status === 'waiting_queue')
      const queuePos = existingQueues.length + 1

      const newBooking = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        booking_number: bookingNumber,
        stall_id: realStall?.id || stallNumber,
        stall_number: stallNumber,
        market_id: Number(body.market_id || realStall?.market_id) || undefined,
        stall_monthly_rate: realStall?.monthly_rate || body.stall_monthly_rate || 2200,
        stall_category: realStall?.category || body.stall_category || 'ทั่วไป',
        stall_zone_name: realStall?.zone_name || body.stall_zone_name || 'โซนทั่วไป',
        project_name: body.project_name || realStall?.project_name || 'โครงการ 01',
        market_name: body.market_name || realStall?.market_name || 'ตลาดบางแคภิรมย์',
        market_district: realStall?.market_slug || body.market_district || 'กรุงเทพมหานคร',
        meeting_point: `หน้ากองอำนวยการ${body.market_name || realStall?.market_name || 'ตลาด'} เสาธง 1`,
        tenant_name: tenantProfile?.full_name || body.applicant_name || body.tenant_name || 'ผู้เช่าทดสอบ',
        tenant_user_id: actor.id,
        tenant_phone: tenantProfile?.phone || body.applicant_phone || body.tenant_phone || '',
        tenant_email: body.applicant_email || body.tenant_email || `${actor.username}@emarket.bma.go.th`,
        tenant_id_card: tenantProfile?.citizen_id || body.tenant_id_card || '',
        intended_business: body.business_type || body.intended_business || 'จำหน่ายสินค้าทั่วไป',
        visit_date: body.visit_date || (effectiveIsQueue ? undefined : new Date().toISOString().slice(0, 10)),
        visit_time_slot: (body.visit_time || body.visit_time_slot) || (effectiveIsQueue ? undefined : '09.30 - 10.30 น.'),
        status: effectiveIsQueue ? 'waiting_queue' : 'pending_approval',
        holding_stall: !effectiveIsQueue,
        appointment_group_id: body.appointment_group_id || undefined,
        group_booking_number: body.group_booking_number || undefined,
        queue_position: effectiveIsQueue ? queuePos : undefined,
        total_in_queue: effectiveIsQueue ? queuePos : undefined,
        waiting_since: effectiveIsQueue ? new Date().toISOString() : undefined,
        timeline: [
          {
            action: effectiveIsQueue ? `เข้าต่อคิวแผงติดจอง (คิวที่ ${queuePos})` : 'ยื่นขอนัดดูแผง (รอเจ้าหน้าที่อนุมัติ)',
            actor_role: 'tenant',
            actor_name: tenantProfile?.full_name || 'ผู้เช่าทดสอบ',
            timestamp: new Date().toISOString(),
            note: effectiveIsQueue ? `ต่อคิวลำดับที่ ${queuePos}` : `เลือกวันนัด ${body.visit_date} เวลา ${body.visit_time || body.visit_time_slot} (รอเจ้าหน้าที่อนุมัติ)`
          }
        ],
        created_at: new Date().toISOString()
      }

      BOOKINGS_DATA.unshift(newBooking)
      bookingsExplicitlyCleared = false
      syncAllStallStatuses()

      // สร้างการแจ้งเตือนสำหรับทั้ง 2 บทบาท (ผู้เช่า & เจ้าหน้าที่)
      if (effectiveIsQueue) {
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: newBooking.tenant_name,
          type: 'waiting_queue',
          status_code: 'waiting_queue',
          status_label: `เข้าคิวสำรองลำดับที่ ${queuePos}`,
          title: `เข้าคิวสำรองแผง ${newBooking.stall_number} สำเร็จ (คิวที่ ${queuePos})`,
          message: `คุณอยู่ในคิวสำรองลำดับที่ ${queuePos} ของแผง ${newBooking.stall_number} (${newBooking.market_name}) รหัส ${newBooking.booking_number} ระบบจะแจ้งเตือนทันทีเมื่อถึงคิวของคุณ`,
          booking_id: newBooking.id,
          booking_number: newBooking.booking_number,
          stall_number: newBooking.stall_number,
          market_name: newBooking.market_name,
          project_name: newBooking.project_name
        })

        pushNotification({
          recipient_role: 'officer',
          type: 'waiting_queue',
          status_code: 'waiting_queue',
          status_label: `คิวสำรองใหม่ (คิวที่ ${queuePos})`,
          title: `มีผู้เช่าต่อคิวสำรองแผง ${newBooking.stall_number} (คิวที่ ${queuePos})`,
          message: `คุณ${newBooking.tenant_name} เข้าต่อคิวสำรองลำดับที่ ${queuePos} ของแผง ${newBooking.stall_number} (${newBooking.market_name}) รหัส ${newBooking.booking_number}`,
          booking_id: newBooking.id,
          booking_number: newBooking.booking_number,
          stall_number: newBooking.stall_number,
          market_name: newBooking.market_name,
          project_name: newBooking.project_name
        })
      } else {
        pushNotification({
          recipient_role: 'tenant',
          recipient_name: newBooking.tenant_name,
          type: 'pending_approval',
          status_code: 'pending_approval',
          status_label: 'รออนุมัติวันนัด',
          title: `ส่งคำขอนัดชมแผง ${newBooking.stall_number} สำเร็จ (${newBooking.booking_number})`,
          message: `ระบบได้รับคำขอนัดชมแผง ${newBooking.stall_number} (${newBooking.market_name}) นัดวัน${newBooking.visit_date} เวลา ${newBooking.visit_time_slot} รอเจ้าหน้าที่พิจารณาอนุมัติ`,
          booking_id: newBooking.id,
          booking_number: newBooking.booking_number,
          stall_number: newBooking.stall_number,
          market_name: newBooking.market_name,
          project_name: newBooking.project_name
        })

        pushNotification({
          recipient_role: 'officer',
          type: 'pending_approval',
          status_code: 'pending_approval',
          status_label: 'รออนุมัติวันนัด',
          title: `คำขอนัดชมแผงใหม่ ${newBooking.stall_number} (${newBooking.booking_number})`,
          message: `คุณ${newBooking.tenant_name} ขอนัดเข้าชมแผง ${newBooking.stall_number} (${newBooking.market_name}) วัน${newBooking.visit_date} เวลา ${newBooking.visit_time_slot} รอเจ้าหน้าที่อนุมัติ`,
          booking_id: newBooking.id,
          booking_number: newBooking.booking_number,
          stall_number: newBooking.stall_number,
          market_name: newBooking.market_name,
          project_name: newBooking.project_name
        })
      }

      return {
        ...newBooking,
        status: true,
        booking_status: newBooking.status,
        code: 200,
        data: newBooking
      }
    }

    // 10. GET /bookings
    if (!bookingsExplicitlyCleared && BOOKINGS_DATA.length === 0) {
      INITIAL_BOOKINGS.forEach(ib => {
        BOOKINGS_DATA.push({ ...ib })
      })
    }
    // Backfill ownership for seeded demo records created before tenant_user_id existed.
    BOOKINGS_DATA.forEach((booking: any) => {
      if (booking.tenant_user_id !== undefined && booking.tenant_user_id !== null) return
      const ownerName = String(booking.tenant_name || '').replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/g, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
      if (ownerName === 'สมชาย ใจดี') booking.tenant_user_id = 3
      if (ownerName === 'นภาพร รัตนศิลป์') booking.tenant_user_id = 4
    })
    return canManageBookings
      ? BOOKINGS_DATA
      : BOOKINGS_DATA.filter((booking: any) => isBookingOwner(booking))
  }

  // --- /contracts ---
  if (cleanSlug.startsWith('contracts')) {
    if (method === 'POST') {
      const body = await readBody(event).catch(() => ({}))
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const contractNumber = `CNT-${new Date().getFullYear()}-${randomNum}`
      const stallId = Number(body.stall_id) || 1
      const stall = STALLS_DATA.find(s => s.id === stallId) || STALLS_DATA[0]

      const newContract = {
        id: Date.now(),
        contract_number: contractNumber,
        stall_id: stallId,
        tenant_name: body.tenant_name || 'ผู้ทำสัญญาเช่า',
        tenant_id_card: body.tenant_id_card || '',
        tenant_phone: body.tenant_phone || '',
        business_name: body.business_name || '',
        business_type: body.business_type || 'ทั่วไป',
        start_date: body.start_date || new Date().toISOString().slice(0, 10),
        end_date: body.end_date || new Date(Date.now() + 365*86400000).toISOString().slice(0, 10),
        billing_cycle: body.billing_cycle || 'monthly',
        rental_fee: body.rental_fee || stall?.monthly_rate || 2500,
        security_deposit: body.security_deposit || 5000,
        advance_payment: body.advance_payment || 2500,
        status: 'active',
        stall: {
          id: stall?.id || stallId,
          stall_number: stall?.stall_number || `A-${stallId}`,
          zone_name: stall?.zone || 'โซนทั่วไป',
          monthly_rate: stall?.monthly_rate || 2500
        }
      }

      if (stall) {
        stall.status = 'occupied'
      }

      CONTRACTS_DATA.unshift(newContract)
      return { status: true, code: 200, data: newContract, ...newContract }
    }
    return CONTRACTS_DATA
  }

  // --- /applications ---
  if (cleanSlug.startsWith('applications')) {
    const parts = cleanSlug.split('/').filter(Boolean)

    // POST /applications/:id/action (Officer / Director approval workflow)
    if (parts.length === 3 && parts[2] === 'action' && method === 'POST') {
      const appId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const app = APPLICATIONS_DATA.find(a => a.id === appId)
      if (app) {
        const linkedBooking = BOOKINGS_DATA.find(b => b.application_id === app.id || b.application_number === app.application_number || b.stall_number === app.stall_number)
        if (body.action === 'reject') {
          app.status = 'rejected'
          app.officer_comment = body.comment || 'ไม่อนุมัติคำร้อง'
          if (linkedBooking) {
            linkedBooking.status = 'rejected'
            linkedBooking.holding_stall = false
            linkedBooking.rejection_reason = app.officer_comment
            linkedBooking.timeline = linkedBooking.timeline || []
            linkedBooking.timeline.push({
              action: 'คำร้องขอเช่าไม่ผ่านการพิจารณา (ปล่อยสิทธิ์)',
              actor_role: 'officer',
              actor_name: 'เจ้าหน้าที่พิจารณาคำร้อง',
              timestamp: new Date().toISOString(),
              note: app.officer_comment
            })
            shiftQueueForStall(linkedBooking.stall_number)
          } else {
            syncAllStallStatuses()
          }

          pushNotification({
            recipient_role: 'tenant',
            recipient_name: app.applicant_name || app.tenant_name,
            type: 'rejected',
            status_code: 'rejected',
            status_label: 'คำร้องไม่ผ่านการพิจารณา',
            title: `คำร้องขอเช่าแผง ${app.stall_number} ไม่ได้รับการอนุมัติ (${app.application_number})`,
            message: `คำร้องขอเช่าแผง ${app.stall_number} (${app.market_name}) ไม่ผ่านการพิจารณา หมายเหตุ: ${app.officer_comment}`,
            booking_id: linkedBooking?.id,
            booking_number: linkedBooking?.booking_number || app.application_number,
            stall_number: app.stall_number,
            market_name: app.market_name
          })
        } else if (body.action === 'approve') {
          if (app.status === 'pending_officer') {
            app.status = 'pending_market_director'
            app.officer_comment = body.comment || 'เจ้าหน้าที่ตรวจสอบเอกสารครบถ้วน ส่งต่อ ผอ.ตลาด'

            pushNotification({
              recipient_role: 'tenant',
              recipient_name: app.applicant_name || app.tenant_name,
              type: 'lease_applied',
              status_code: 'lease_applied',
              status_label: 'ผ่านการตรวจเอกสาร (ส่งต่อ ผอ.ตลาด)',
              title: `คำร้อง ${app.application_number} ผ่านการตรวจเอกสารเบื้องต้นแล้ว`,
              message: `เจ้าหน้าที่ตลาดตรวจสอบเอกสารคำร้องแผง ${app.stall_number} (${app.market_name}) เรียบร้อยแล้ว อยู่ระหว่างส่งต่อผู้อำนวยการตลาดพิจารณา`,
              booking_id: linkedBooking?.id,
              booking_number: linkedBooking?.booking_number || app.application_number,
              stall_number: app.stall_number,
              market_name: app.market_name
            })
          } else if (app.status === 'pending_market_director') {
            app.status = 'pending_bureau_director'
            app.market_director_comment = body.comment || 'ผอ.ตลาด พิจารณาอนุมัติคำร้อง'

            pushNotification({
              recipient_role: 'tenant',
              recipient_name: app.applicant_name || app.tenant_name,
              type: 'lease_applied',
              status_code: 'lease_applied',
              status_label: 'ผอ.ตลาด เห็นชอบคำร้องแล้ว',
              title: `ผอ.ตลาด เห็นชอบคำร้องขอเช่าแผง ${app.stall_number} (${app.application_number})`,
              message: `คำร้องขอเช่าแผง ${app.stall_number} (${app.market_name}) ผ่านการพิจารณาจาก ผอ.ตลาดแล้ว อยู่ระหว่างเสนอ ผอ.สำนักตลาดอนุมัติขั้นสุดท้าย`,
              booking_id: linkedBooking?.id,
              booking_number: linkedBooking?.booking_number || app.application_number,
              stall_number: app.stall_number,
              market_name: app.market_name
            })
          } else if (app.status === 'pending_bureau_director') {
            app.status = 'approved'
            app.bureau_director_comment = body.comment || 'ผอ.สำนักตลาด พิจารณาอนุมัติคำร้องเรียบร้อย'
            if (linkedBooking) {
              linkedBooking.status = 'completed'
              linkedBooking.timeline = linkedBooking.timeline || []
              linkedBooking.timeline.push({
                action: 'อนุมัติคำร้องขอเช่าแผงค้าเสร็จสมบูรณ์',
                actor_role: 'officer',
                actor_name: 'ผู้อำนวยการสำนักตลาด',
                timestamp: new Date().toISOString(),
                note: app.bureau_director_comment
              })
            }
            syncAllStallStatuses()

            pushNotification({
              recipient_role: 'tenant',
              recipient_name: app.applicant_name || app.tenant_name,
              type: 'completed',
              status_code: 'completed',
              status_label: 'อนุมัติสัญญาเช่าแผงสำเร็จ',
              title: `อนุมัติคำร้องขอเช่าแผง ${app.stall_number} สำเร็จ! (${app.application_number})`,
              message: `คำร้องขอเช่าแผง ${app.stall_number} (${app.market_name}) ได้รับการอนุมัติครบทุกขั้นตอนแล้ว พร้อมเข้าทำสัญญาเช่าแผงค้า`,
              booking_id: linkedBooking?.id,
              booking_number: linkedBooking?.booking_number || app.application_number,
              stall_number: app.stall_number,
              market_name: app.market_name
            })
          }
        }
        return { status: true, code: 200, message: 'บันทึกผลการพิจารณาเรียบร้อย', data: app }
      }
      return { status: false, code: 404, message: 'ไม่พบคำร้อง' }
    }

    // Clear all applications
    if (cleanSlug === 'applications/clear' || (cleanSlug === 'applications' && method === 'DELETE')) {
      APPLICATIONS_DATA.length = 0
      return { status: true, code: 200, message: 'ล้างข้อมูลคำร้องทั้งหมดเรียบร้อย' }
    }

    if (method === 'POST') {
      const body = await readBody(event).catch(() => ({}))
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const appNumber = `APP-${new Date().getFullYear()}-${randomNum}`
      const rawStallIdent = String(body.stall_number || body.stall_id || '').trim()
      const stall = REAL_STALLS_MAP.get(rawStallIdent) || STALLS_DATA.find(s => String(s.id) === rawStallIdent || s.stall_number === rawStallIdent) || STALLS_DATA[0]
      const stallId = stall?.id || rawStallIdent || 1
      const stallNumber = body.stall_number || stall?.stall_number || `A-${stallId}`
      const marketName = body.market_name || stall?.market_name || 'ตลาดนัดจตุจักร'
      const applicantName = body.applicant_name || body.tenant_name || 'ผู้ยื่นคำร้อง'
      const applicantPhone = body.applicant_phone || body.tenant_phone || ''
      const applicantIdCard = body.applicant_id_card || body.id_card_number || body.tenant_id_card || ''
      const shopName = body.shop_name || body.intended_product_type || body.business_name || 'ร้านค้า'
      const productType = body.product_type || body.business_type || 'ทั่วไป'
      const requestedStartDate = body.requested_start_date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

      const newApp = {
        id: Date.now(),
        application_number: appNumber,
        tenant_name: applicantName,
        applicant_name: applicantName,
        tenant_phone: applicantPhone,
        applicant_phone: applicantPhone,
        tenant_id_card: applicantIdCard,
        applicant_id_card: applicantIdCard,
        applicant_address: body.applicant_address || '',
        stall_id: stallId,
        stall_number: stallNumber,
        market_name: marketName,
        business_name: shopName,
        shop_name: shopName,
        business_type: productType,
        product_type: productType,
        requested_start_date: requestedStartDate,
        requested_period_months: body.requested_period_months || 12,
        stall_monthly_rate: stall?.monthly_rate || stall?.stall_monthly_rate || 2500,
        stage: 'officer_review',
        status: 'pending_officer',
        created_at: new Date().toISOString()
      }

      APPLICATIONS_DATA.unshift(newApp)

      // Automatically link and update Booking status to 'lease_applied'
      const bookingId = Number(body.booking_id)
      const booking = BOOKINGS_DATA.find(b =>
        (bookingId && b.id === bookingId) ||
        (body.stall_number && b.stall_number === body.stall_number && b.status === 'interested') ||
        (b.stall_number === stallNumber && b.status === 'interested')
      )
      if (booking) {
        booking.status = 'lease_applied'
        booking.application_number = appNumber
        booking.application_id = newApp.id
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'ยื่นคำร้องขอเช่าแผงค้า',
          actor_role: 'tenant',
          actor_name: applicantName,
          timestamp: new Date().toISOString(),
          note: `ยื่นคำร้องขอเช่าแผง ${booking.stall_number} เลขที่ ${appNumber} เรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตลาดและ ผอ. ตรวจสอบ`
        })
      }
      syncAllStallStatuses()

      // แจ้งเตือนผู้เช่า: ยื่นคำร้องขอเช่าสำเร็จ
      pushNotification({
        recipient_role: 'tenant',
        recipient_name: applicantName,
        type: 'lease_applied',
        status_code: 'lease_applied',
        status_label: 'ยื่นคำร้องขอเช่าแล้ว',
        title: `ส่งคำร้องขอเช่าแผง ${stallNumber} สำเร็จ (${appNumber})`,
        message: `ระบบได้รับคำร้องขอเช่าแผง ${stallNumber} (${marketName}) เลขที่ ${appNumber} เรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตรวจสอบเอกสาร`,
        booking_id: booking?.id,
        booking_number: booking?.booking_number || appNumber,
        stall_number: stallNumber,
        market_name: marketName,
        project_name: booking?.project_name
      })

      // แจ้งเตือนเจ้าหน้าที่: มีคำร้องขอเช่าแผงค้าใหม่
      pushNotification({
        recipient_role: 'officer',
        type: 'lease_applied',
        status_code: 'lease_applied',
        status_label: 'คำร้องขอเช่าใหม่ (รอตรวจเอกสาร)',
        title: `มีคำร้องขอเช่าแผงใหม่ ${stallNumber} (${appNumber})`,
        message: `คุณ${applicantName} ยื่นคำร้องขอเช่าแผง ${stallNumber} (${marketName}) เลขที่ ${appNumber} รอเจ้าหน้าที่ตรวจสอบเอกสาร`,
        booking_id: booking?.id,
        booking_number: booking?.booking_number || appNumber,
        stall_number: stallNumber,
        market_name: marketName,
        project_name: booking?.project_name
      })

      return { status: true, code: 200, data: newApp, ...newApp }
    }
    return APPLICATIONS_DATA
  }

  // --- /auth/login or /auth/token ---
  if (cleanSlug === 'auth/login' || cleanSlug === 'auth/token') {
    const body = await readBody(event).catch(() => ({}))
    const username = String(body?.username || '').trim()
    const demoUser = MOCK_USERS[username]
    if (!demoUser || String(body?.password || '') !== demoUser.password) {
      setResponseStatus(event, 401)
      return { status: false, code: 401, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }
    }
    const role = demoUser.role
    const userInfo = {
      id: demoUser.id,
      username: demoUser.username,
      full_name: demoUser.full_name,
      email: `${username}@emarket.bma.go.th`,
      phone: demoUser.phone,
      citizen_id: demoUser.citizen_id,
      role
    }

    const accessToken = generateRfc7519Jwt({
      user_id: userInfo.id,
      username: userInfo.username,
      role: userInfo.role
    })

    const refreshToken = generateRfc7519Jwt({
      user_id: userInfo.id,
      username: userInfo.username,
      type: 'refresh'
    })

    return {
      status: true,
      code: 200,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        role,
        user: userInfo
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      role,
      user: userInfo
    }
  }

  // --- /auth/refresh_token ---
  if (cleanSlug === 'auth/refresh_token') {
    const body = await readBody(event).catch(() => ({}))
    const newAccessToken = generateRfc7519Jwt({
      user_id: 1,
      username: 'admin',
      role: 'admin'
    })
    return {
      status: true,
      code: 200,
      data: {
        access_token: newAccessToken,
        refresh_token: body?.refresh_token || newAccessToken,
        token_type: 'bearer'
      }
    }
  }

  // --- /auth/me ---
  if (cleanSlug === 'auth/me') {
    return {
      status: true,
      code: 200,
      data: {
        id: 1,
        username: 'admin',
        full_name: 'ผู้ดูแลระบบตลาด กทม. (Admin)',
        email: 'admin@emarket.bma.go.th',
        role: 'admin'
      }
    }
  }

  // Fallback default response
  return { status: true, message: 'BMA e-Market API Ready', slug: cleanSlug }
})
