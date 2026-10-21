import { defineEventHandler, getRouterParam, getMethod, getQuery, readBody, setResponseStatus } from 'h3'
import crypto from 'node:crypto'

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
    name: 'ตลาดสิงหนาท',
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
    name: 'ตลาดวงเวียนเล็ก',
    name_en: 'Wongwian Lek Amulet Market',
    district: 'เขตคลองสาน',
    address: 'ซอยสมเด็จเจ้าพระยา แขวงสมเด็จเจ้าพระยา เขตคลองสาน กรุงเทพฯ 10600',
    lat: 13.7335,
    lng: 100.4965,
    status: 'full',
    total_stalls: 120,
    available_stalls: 0,
    starting_price_daily: 160,
    starting_price_monthly: 2400,
    image_url: '/images/markets/wongwian_lek.jpg',
    tags: ['🚝 รถไฟฟ้าสายสีทอง (สถานีคลองสาน)', '🏺 ศูนย์รวมพระเครื่อง', '🔴 ติดจองเต็ม'],
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

// Stalls Generator
const generateStalls = () => {
  const zones = ['A', 'B', 'C', 'D']
  const stalls: any[] = []
  let id = 1
  for (const zone of zones) {
    for (let i = 1; i <= 15; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`
      const stallNumber = `${zone}-${numStr}`
      const status = 'available'
      stalls.push({
        id: id++,
        stall_number: stallNumber,
        zone_id: zone === 'A' ? 1 : zone === 'B' ? 2 : zone === 'C' ? 3 : 4,
        zone_code: zone,
        zone_name: zone === 'A' ? 'โซนอาหารปรุงสำเร็จ' : zone === 'B' ? 'โซนแฟชั่นและเสื้อผ้า' : zone === 'C' ? 'โซนผักผลไม้สด' : 'โซนงานฝีมือ',
        category: zone === 'A' ? 'Food & Drink' : zone === 'B' ? 'Fashion' : zone === 'C' ? 'Fresh Goods' : 'Crafts',
        size_sqm: zone === 'A' ? 12 : zone === 'B' ? 9 : zone === 'C' ? 15 : 8,
        monthly_rate: zone === 'A' ? 2500 : zone === 'B' ? 1800 : zone === 'C' ? 1500 : 1200,
        daily_rate: zone === 'A' ? 120 : zone === 'B' ? 90 : zone === 'C' ? 80 : 60,
        status,
        has_water: zone === 'A' || zone === 'C',
        has_electricity: true,
        description: `แผงค้ามาตรฐาน ทำเลเยี่ยม ใกล้ทางเข้าหลักและโซนที่จอดรถ`
      })
    }
  }
  return stalls
}

const STALLS_DATA = generateStalls()

const INITIAL_BOOKINGS: any[] = [
  {
    id: 3002,
    booking_number: '#3002',
    market_name: 'ตลาดนัดจตุจักร',
    stall_number: 'A-01',
    stall_count: 2,
    stall_monthly_rate: 2500,
    stall_zone_name: 'โซนแฟชั่น เสื้อผ้า',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'เสื้อผ้าแฟชั่นและเครื่องประดับ',
    visit_date: 'จันทร์ 19 ตุลาคม 2569',
    visit_time_slot: '13.00 - 14.00 น.',
    meeting_point: 'หน้ากองอำนวยการตลาด เสาธง 1',
    escort_officer: 'นายธนากร สมบูรณ์',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-07T10:30:00'
  },
  {
    id: 3003,
    booking_number: '#3003',
    market_name: 'ตลาดนัดจตุจักร',
    stall_number: 'B-03',
    stall_count: 2,
    stall_monthly_rate: 3200,
    stall_zone_name: 'โซนงานฝีมือและของที่ระลึก',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ของตกแต่งบ้านเซรามิก',
    visit_date: 'จันทร์ 19 ตุลาคม 2569',
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
    stall_number: 'C-08',
    stall_count: 1,
    stall_monthly_rate: 2800,
    stall_zone_name: 'โซนเครื่องดื่มและเบเกอรี่',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    tenant_id_card: '1-1004-99887-12-3',
    intended_business: 'ร้านกาแฟสดและเบเกอรี่',
    visit_date: 'พุธ 21 ตุลาคม 2569',
    visit_time_slot: '10.30 - 11.30 น.',
    status: 'pending_approval',
    holding_stall: true,
    created_at: '2026-10-08T14:15:00'
  },
  {
    id: 3005,
    booking_number: '#3005',
    market_name: 'ตลาดบางแคภิรมย์',
    stall_number: 'BK-01',
    stall_count: 1,
    stall_monthly_rate: 2200,
    stall_zone_name: 'โซนอาหารปรุงสุก',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ก๋วยเตี๋ยวเรืออยุธยา',
    visit_date: 'พฤหัสบดี 22 ตุลาคม 2569',
    visit_time_slot: '11.00 - 12.00 น.',
    status: 'waiting_queue',
    queue_position: 1,
    holding_stall: false,
    created_at: '2026-10-09T09:00:00'
  },
  {
    id: 3006,
    booking_number: '#3006',
    market_name: 'ตลาดบางแคภิรมย์',
    stall_number: 'BK-05',
    stall_count: 1,
    stall_monthly_rate: 2000,
    stall_zone_name: 'โซนผักผลไม้สด',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ผลไม้นำเข้าและตามฤดูกาล',
    visit_date: 'ศุกร์ 23 ตุลาคม 2569',
    visit_time_slot: '14.00 - 15.00 น.',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-09T11:20:00'
  },
  {
    id: 3007,
    booking_number: '#3007',
    market_name: 'ตลาดบางแคภิรมย์',
    stall_number: 'BK-12',
    stall_count: 2,
    stall_monthly_rate: 2400,
    stall_zone_name: 'โซนเบ็ดเตล็ด',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'เครื่องใช้ในครัวเรือน',
    status: 'lease_applied',
    application_number: 'APP-2026-0089',
    holding_stall: true,
    created_at: '2026-10-10T13:45:00'
  },
  {
    id: 3008,
    booking_number: '#3008',
    market_name: 'ตลาดบางแคภิรมย์',
    stall_number: 'BK-15',
    stall_count: 1,
    stall_monthly_rate: 2100,
    stall_zone_name: 'โซนเสื้อผ้า',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'เสื้อผ้าเด็กสำเร็จรูป',
    status: 'completed',
    holding_stall: true,
    created_at: '2026-10-10T16:00:00'
  },
  {
    id: 3009,
    booking_number: '#3009',
    market_name: 'ตลาดบางแคภิรมย์',
    stall_number: 'BK-20',
    stall_count: 1,
    stall_monthly_rate: 1900,
    stall_zone_name: 'โซนบริการ',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ร้านซ่อมนาฬิกา',
    status: 'cancelled',
    holding_stall: false,
    created_at: '2026-10-11T10:00:00'
  },
  {
    id: 3010,
    booking_number: '#3010',
    market_name: 'ตลาดพระเครื่อง',
    stall_number: 'PK-02',
    stall_count: 1,
    stall_monthly_rate: 3500,
    stall_zone_name: 'โซนพระบูชาและเหรียญคณาจารย์',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'ศูนย์พระเครื่องและวัตถุมงคล',
    visit_date: 'เสาร์ 24 ตุลาคม 2569',
    visit_time_slot: '13.00 - 14.30 น.',
    status: 'approved',
    holding_stall: true,
    created_at: '2026-10-12T11:15:00'
  },
  {
    id: 3011,
    booking_number: '#3011',
    market_name: 'ตลาดพระเครื่อง',
    stall_number: 'PK-07',
    stall_count: 1,
    stall_monthly_rate: 3000,
    stall_zone_name: 'โซนหนังสือและตลับพระ',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-234-5678',
    intended_business: 'อุปกรณ์เลี่ยมกรอบพระ',
    status: 'rejected',
    holding_stall: false,
    rejection_reason: 'ประเภทสินค้าไม่ตรงกับผังการจัดโซนของตลาด',
    created_at: '2026-10-12T15:30:00'
  }
]

const BOOKINGS_DATA: any[] = JSON.parse(JSON.stringify(INITIAL_BOOKINGS))
let bookingsExplicitlyCleared = false

const APPLICATIONS_DATA: any[] = [
  {
    id: 101,
    application_number: 'APP-2026-0089',
    stall_id: 1,
    stall_number: 'BK-12',
    market_name: 'ตลาดบางแคภิรมย์',
    applicant_name: 'สมชาย ใจดี',
    tenant_name: 'สมชาย ใจดี',
    applicant_phone: '081-234-5678',
    tenant_phone: '081-234-5678',
    applicant_id_card: '1-1004-99887-12-3',
    tenant_id_card: '1-1004-99887-12-3',
    shop_name: 'สมชายของใช้ในบ้าน',
    business_name: 'สมชายของใช้ในบ้าน',
    product_type: 'เครื่องใช้ในครัวเรือน',
    business_type: 'เครื่องใช้ในครัวเรือน',
    requested_start_date: '2026-11-01',
    requested_period_months: 12,
    stage: 'officer_review',
    status: 'pending_officer',
    created_at: '2026-10-10T13:45:00'
  },
  {
    id: 102,
    application_number: 'APP-2026-0078',
    stall_id: 2,
    stall_number: 'A-02',
    market_name: 'ตลาดนัดจตุจักร',
    applicant_name: 'กิตติคุณ มั่งคั่ง',
    tenant_name: 'กิตติคุณ มั่งคั่ง',
    applicant_phone: '082-998-1122',
    tenant_phone: '082-998-1122',
    applicant_id_card: '1-1004-99887-12-3',
    tenant_id_card: '1-1004-99887-12-3',
    shop_name: 'ร้านกาแฟโบราณลุงกิต',
    business_name: 'ร้านกาแฟโบราณลุงกิต',
    product_type: 'อาหารและเครื่องดื่ม',
    business_type: 'อาหารและเครื่องดื่ม',
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
    stall_id: 2,
    tenant_name: 'นายกิตติคุณ มั่งคั่ง',
    tenant_id_card: '1-1004-99887-12-3',
    tenant_phone: '082-998-1122',
    business_name: 'ร้านกาแฟโบราณลุงกิต',
    business_type: 'อาหารและเครื่องดื่ม',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    billing_cycle: 'monthly',
    rental_fee: 2500,
    security_deposit: 5000,
    advance_payment: 2500,
    status: 'active',
    stall: {
      id: 2,
      stall_number: 'A-02',
      zone_name: 'โซนอาหารปรุงสำเร็จ',
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
    const marketIdOrSlug = cleanSlug.replace('markets/', '')
    const market = MARKETS_DATA.find(m => String(m.id) === marketIdOrSlug || m.slug === marketIdOrSlug)
    if (market) return market
    return MARKETS_DATA[0]
  }

  // --- /stalls ---
  if (cleanSlug === 'stalls' || cleanSlug === 'stalls/') {
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
      }
    } else {
      const activeHolders = BOOKINGS_DATA.filter(b => b.stall_number === stallNumber && b.holding_stall && !['rejected', 'not_interested', 'cancelled', 'no_show'].includes(b.status))
      if (activeHolders.length === 0) {
        const stall = STALLS_DATA.find(s => s.stall_number === stallNumber)
        if (stall) stall.status = 'available'
      }
    }
  }

  // --- /bookings or /bookings/:id/... ---
  if (cleanSlug.startsWith('bookings')) {
    const parts = cleanSlug.split('/').filter(Boolean)

    // 1. POST /bookings/:id/approve (Officer approve)
    if (parts.length === 3 && parts[2] === 'approve' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'approved'
        booking.meeting_point = body.meeting_point || booking.meeting_point || 'หน้ากองอำนวยการตลาด เสาธง 1'
        booking.escort_officer = body.escort_officer || 'นายธนากร สมบูรณ์ (เจ้าหน้าที่พาชม)'
        booking.officer_notes = body.officer_notes || 'อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง'
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'อนุมัตินัดหมายเข้าชม',
          actor_role: 'officer',
          actor_name: 'เจ้าหน้าที่ผู้ดูแลตลาด',
          timestamp: new Date().toISOString(),
          note: `จุดนัดพบ: ${booking.meeting_point} | ผู้พาชม: ${booking.escort_officer}`
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
        booking.officer_notes = body.officer_notes || 'ผู้เช่ามาตามนัดหมายดูแผงหน้างานเรียบร้อย เข้าสู่ขั้นตอนการยื่นคำร้อง'
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'มาตามนัดหมาย (พร้อมยื่นคำร้องขอเช่า)',
          actor_role: 'officer',
          actor_name: body.officer_name || 'จนท. นำชมแผง',
          timestamp: new Date().toISOString(),
          note: 'เจ้าหน้าที่ยืนยันผู้เช่ามาตามนัดหมายดูแผงหน้างานเรียบร้อย ผู้เช่าสามารถยื่นคำร้องขอเช่าได้ทันที'
        })
      }
      return { status: true, code: 200, message: 'บันทึกการมาตามนัดเรียบร้อย ผู้เช่าสามารถยื่นคำร้องขอเช่าได้ทันที', data: booking }
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
      }
      return { status: true, code: 200, message: 'บันทึกวันนัดหมายเรียบร้อย รอเจ้าหน้าที่อนุมัติ', data: booking }
    }

    // 7. POST /bookings/:id/cancel (Cancel booking)
    if (parts.length === 3 && parts[2] === 'cancel' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        const wasHolding = booking.holding_stall
        booking.status = 'cancelled'
        booking.holding_stall = false
        booking.timeline = booking.timeline || []
        booking.timeline.push({
          action: 'ยกเลิกการจอง',
          actor_role: body.by_officer ? 'officer' : 'tenant',
          actor_name: body.by_officer ? 'เจ้าหน้าที่ตลาด' : booking.tenant_name,
          timestamp: new Date().toISOString(),
          note: body.reason || 'ยกเลิกคำขอจอง'
        })
        if (wasHolding) {
          shiftQueueForStall(booking.stall_number)
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
      STALLS_DATA.forEach(s => { s.status = 'available' })
      return { status: true, code: 200, message: 'ล้างข้อมูลการจองและคำร้องทั้งหมดเรียบร้อย' }
    }

    // 8. GET /bookings/stall-queue/:stallIdent
    if (parts.length === 3 && parts[1] === 'stall-queue') {
      const stallIdent = decodeURIComponent(parts[2])
      const activeHolder = BOOKINGS_DATA.find(b => b.stall_number === stallIdent && b.holding_stall && !['rejected', 'not_interested', 'cancelled'].includes(b.status))
      const waitingQueues = BOOKINGS_DATA.filter(b => b.stall_number === stallIdent && b.status === 'waiting_queue')
        .sort((a, b) => (a.queue_position || 99) - (b.queue_position || 99))

      return {
        stall_number: stallIdent,
        current_holder: activeHolder ? {
          booking_number: activeHolder.booking_number,
          status: activeHolder.status,
          deadline: activeHolder.decision_deadline || activeHolder.application_deadline || activeHolder.visit_date,
          masked_name: activeHolder.tenant_name.slice(0, 2) + '*** ' + (activeHolder.tenant_name.split(' ')[1]?.slice(0, 2) || '') + '***',
          tenant_name: activeHolder.tenant_name,
          tenant_phone: activeHolder.tenant_phone
        } : null,
        total_waiting: waitingQueues.length,
        queues: waitingQueues.map(q => ({
          id: q.id,
          booking_number: q.booking_number,
          queue_position: q.queue_position,
          waiting_since: q.waiting_since || q.created_at,
          masked_name: q.tenant_name.slice(0, 2) + '*** ' + (q.tenant_name.split(' ')[1]?.slice(0, 2) || '') + '***',
          tenant_name: q.tenant_name,
          tenant_phone: q.tenant_phone,
          intended_business: q.intended_business
        }))
      }
    }

    // 9. POST /bookings (Create new booking or queue)
    if (parts.length === 1 && method === 'POST') {
      const body = await readBody(event).catch(() => ({}))
      const stallId = Number(body.stall_id) || 1
      const stall = STALLS_DATA.find(s => s.id === stallId) || STALLS_DATA[0]
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const bookingNumber = `BK-${new Date().getFullYear()}-${randomNum}`
      const isQueue = Boolean(body.is_queue)

      // Count existing queues
      const stallNumber = body.stall_number || stall?.stall_number || `A-${stallId}`
      const existingQueues = BOOKINGS_DATA.filter(b => b.stall_number === stallNumber && b.status === 'waiting_queue')
      const queuePos = existingQueues.length + 1

      const newBooking = {
        id: Date.now(),
        booking_number: bookingNumber,
        stall_id: stall?.id || stallId,
        stall_number: stallNumber,
        stall_monthly_rate: stall?.monthly_rate || 2500,
        stall_category: stall?.category_name || 'ทั่วไป',
        stall_zone_name: stall?.zone || 'โซนทั่วไป',
        market_name: body.market_name || stall?.market_name || 'ตลาดนัดจตุจักร',
        market_district: stall?.district || 'กรุงเทพมหานคร',
        meeting_point: 'หน้ากองอำนวยการตลาด เสาธง 1',
        tenant_name: body.tenant_name || 'คุณสมศักดิ์ ค้าขายดี',
        tenant_phone: body.tenant_phone || '081-999-8877',
        tenant_email: body.tenant_email || 'somsak@example.com',
        tenant_id_card: body.tenant_id_card || '1-1004-88991-23-4',
        intended_business: body.intended_business || 'จำหน่ายสินค้าทั่วไป',
        visit_date: isQueue ? undefined : (body.visit_date || new Date().toISOString().slice(0, 10)),
        visit_time_slot: isQueue ? undefined : (body.visit_time_slot || '10:00 - 11:30'),
        status: isQueue ? 'waiting_queue' : 'pending_approval',
        holding_stall: !isQueue,
        queue_position: isQueue ? queuePos : undefined,
        total_in_queue: isQueue ? queuePos : undefined,
        waiting_since: isQueue ? new Date().toISOString() : undefined,
        timeline: [
          {
            action: isQueue ? `เข้าต่อคิวแผงติดจอง (คิวที่ ${queuePos})` : 'ยื่นขอนัดดูแผง (รอเจ้าหน้าที่อนุมัติ)',
            actor_role: 'tenant',
            actor_name: body.tenant_name || 'คุณสมศักดิ์ ค้าขายดี',
            timestamp: new Date().toISOString(),
            note: isQueue ? `ต่อคิวลำดับที่ ${queuePos}` : `เลือกวันนัด ${body.visit_date} เวลา ${body.visit_time_slot} (รอเจ้าหน้าที่อนุมัติ)`
          }
        ],
        created_at: new Date().toISOString()
      }

      if (!isQueue && stall) {
        stall.status = 'reserved'
      }

      BOOKINGS_DATA.unshift(newBooking)

      return {
        status: true,
        code: 200,
        data: newBooking,
        ...newBooking
      }
    }

    // 10. GET /bookings
    if (!bookingsExplicitlyCleared && BOOKINGS_DATA.length === 0) {
      INITIAL_BOOKINGS.forEach(ib => {
        BOOKINGS_DATA.push({ ...ib })
      })
    }
    return BOOKINGS_DATA
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
        if (body.action === 'reject') {
          app.status = 'rejected'
          app.officer_comment = body.comment || 'ไม่อนุมัติคำร้อง'
        } else if (body.action === 'approve') {
          if (app.status === 'pending_officer') {
            app.status = 'pending_market_director'
            app.officer_comment = body.comment || 'เจ้าหน้าที่ตรวจสอบเอกสารครบถ้วน ส่งต่อ ผอ.ตลาด'
          } else if (app.status === 'pending_market_director') {
            app.status = 'pending_bureau_director'
            app.market_director_comment = body.comment || 'ผอ.ตลาด พิจารณาอนุมัติคำร้อง'
          } else if (app.status === 'pending_bureau_director') {
            app.status = 'approved'
            app.bureau_director_comment = body.comment || 'ผอ.สำนักตลาด พิจารณาอนุมัติคำร้องเรียบร้อย'
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
      const stallId = Number(body.stall_id) || 1
      const stall = STALLS_DATA.find(s => s.id === stallId) || STALLS_DATA[0]
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
        (body.stall_number && b.stall_number === body.stall_number) ||
        b.stall_id === stallId ||
        b.stall_number === stall?.stall_number
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
          note: `ยื่นคำร้องขอเช่าเลขที่ ${appNumber} เรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตลาดและ ผอ. ตรวจสอบ`
        })
      }

      return { status: true, code: 200, data: newApp, ...newApp }
    }
    return APPLICATIONS_DATA
  }

  // --- /auth/login or /auth/token ---
  if (cleanSlug === 'auth/login' || cleanSlug === 'auth/token') {
    const body = await readBody(event).catch(() => ({}))
    const username = body?.username || 'admin'
    const role = username === 'admin' ? 'admin' : username === 'staff' ? 'staff' : 'tenant'
    const userInfo = {
      id: username === 'tenant' ? 3 : 1,
      username,
      full_name: username === 'tenant' ? 'คุณสมชาย ใจดี (ผู้เช่าแผงค้า)' : 'ผู้ดูแลระบบตลาด กทม. (Admin)',
      email: `${username}@emarket.bma.go.th`,
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
