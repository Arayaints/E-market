import { defineEventHandler, getRouterParam, getMethod, getQuery, readBody, setResponseStatus } from 'h3'

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
    image_url: '/images/chatuchak_entrance.jpg',
    tags: ['🛒 ตลาดนัดสุดสัปดาห์', '🚇 BTS หมอชิต / MRT สวนจตุจักร', '🅿️ มีที่จอดรถ 800+ คัน'],
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
    image_url: '/images/market_hall_front.jpg',
    tags: ['🍲 อาหารปรุงสำเร็จ', '🥦 ผักผลไม้สด', '🚌 รถเมล์สาย 67, 70'],
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
    image_url: '/images/market_hall_front.jpg',
    tags: ['🚝 รถไฟฟ้าสายสีชมพู (สถานีตลาดมีนบุรี)', '🛍️ ศูนย์ค้าปลีก-ส่ง', '🅿️ มีที่จอดรถ'],
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
    image_url: '/images/market_promo_hero.jpg',
    tags: ['🚇 MRT ศูนย์สิริกิติ์', '🏙️ ย่านธุรกิจสุขุมวิท', '☕ อาหารและเครื่องดื่ม'],
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
    image_url: '/images/market_hall_front.jpg',
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
    image_url: '/images/market_promo_hero.jpg',
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
    image_url: '/images/market_hall_front.jpg',
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
    image_url: '/images/market_hall_front.jpg',
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
    image_url: '/images/market_hall_front.jpg',
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
    image_url: '/images/market_promo_hero.jpg',
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
    image_url: '/images/market_hall_front.jpg',
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
    image_url: '/images/market_promo_hero.jpg',
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
    image_url: '/images/chatuchak_entrance.jpg'
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
    image_url: '/images/market_hall_front.jpg'
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
    image_url: '/images/market_promo_hero.jpg'
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
      const status = i === 1 || i === 7 ? 'reserved' : i === 2 || i === 5 || i === 11 ? 'occupied' : 'available'
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

const BOOKINGS_DATA: any[] = [
  {
    id: 1,
    booking_number: 'BK-2026-0042',
    stall_id: 1,
    stall_number: 'A-01',
    stall_monthly_rate: 2500,
    market_name: 'ตลาดนัดจตุจักร',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-444-5566',
    tenant_email: 'somchai@example.com',
    intended_business: 'เสื้อผ้าและแฟชั่นวินเทจ',
    visit_date: '2026-10-25',
    visit_time_slot: '10:00 - 12:00',
    status: 'approved',
    officer_notes: 'อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรพาเดินชมแผงโซน A',
    created_at: '2026-10-18T10:30:00Z'
  },
  {
    id: 2,
    booking_number: 'BK-2026-0043',
    stall_id: 4,
    stall_number: 'B-04',
    stall_monthly_rate: 1800,
    market_name: 'ตลาดประชานิเวศน์ 1',
    tenant_name: 'สมหญิง รักการค้า',
    tenant_phone: '089-123-4567',
    tenant_email: 'somying@example.com',
    intended_business: 'อาหารพร้อมทานและเบเกอรี่',
    visit_date: '2026-10-26',
    visit_time_slot: '14:00 - 16:00',
    status: 'pending_approval',
    created_at: '2026-10-19T09:15:00Z'
  },
  {
    id: 3,
    booking_number: 'BK-2026-0044',
    stall_id: 8,
    stall_number: 'A-08',
    stall_monthly_rate: 2500,
    market_name: 'ตลาดนัดจตุจักร',
    tenant_name: 'นายกิตติคุณ มั่งคั่ง',
    tenant_phone: '082-998-1122',
    tenant_email: 'kittikun@example.com',
    intended_business: 'ร้านกาแฟโบราณและเครื่องดื่ม',
    visit_date: '2026-10-20',
    visit_time_slot: '10:00 - 12:00',
    status: 'visited',
    officer_notes: 'นำชมแผงเรียบร้อย ผู้ขอจองมีความสนใจยื่นสัญญาเช่า',
    created_at: '2026-10-17T11:00:00Z'
  }
]

const APPLICATIONS_DATA: any[] = [
  {
    id: 1,
    application_number: 'APP-2026-0015',
    tenant_name: 'สมชาย ใจดี',
    tenant_phone: '081-444-5566',
    tenant_id_card: '1-1004-99887-12-3',
    stall_id: 1,
    stall_number: 'A-01',
    market_name: 'ตลาดนัดจตุจักร',
    business_name: 'ร้านเสื้อผ้าวินเทจสมชาย',
    business_type: 'แฟชั่นและเครื่องแต่งกาย',
    stage: 'approved',
    status: 'approved',
    created_at: '2026-10-19T14:20:00Z'
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

  // --- /stalls/geojson ---
  if (cleanSlug === 'stalls/geojson') {
    return {
      type: 'FeatureCollection',
      features: STALLS_DATA.slice(0, 30).map((s, idx) => ({
        type: 'Feature',
        id: s.id,
        properties: {
          id: s.id,
          stall_number: s.stall_number,
          zone_code: s.zone_code,
          status: s.status,
          monthly_rate: s.monthly_rate,
          daily_rate: s.daily_rate,
          size_sqm: s.size_sqm
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [100.5501 + (idx % 6) * 0.0003, 13.7998 + Math.floor(idx / 6) * 0.0003],
            [100.5503 + (idx % 6) * 0.0003, 13.7998 + Math.floor(idx / 6) * 0.0003],
            [100.5503 + (idx % 6) * 0.0003, 13.8000 + Math.floor(idx / 6) * 0.0003],
            [100.5501 + (idx % 6) * 0.0003, 13.8000 + Math.floor(idx / 6) * 0.0003],
            [100.5501 + (idx % 6) * 0.0003, 13.7998 + Math.floor(idx / 6) * 0.0003]
          ]]
        }
      }))
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

  // --- /bookings or /bookings/:id/... ---
  if (cleanSlug.startsWith('bookings')) {
    const parts = cleanSlug.split('/').filter(Boolean)

    // 1. /bookings/:id/approve
    if (parts.length === 3 && parts[2] === 'approve' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'approved'
        booking.officer_notes = body.officer_notes || 'อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง'
      }
      return { status: true, code: 200, message: 'อนุมัตินัดหมายเรียบร้อย', data: booking }
    }

    // 2. /bookings/:id/reject
    if (parts.length === 3 && parts[2] === 'reject' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        booking.status = 'rejected'
        booking.rejection_reason = body.rejection_reason || 'ไม่อนุมัติคำขอ'
      }
      return { status: true, code: 200, message: 'ปฏิเสธคำขอเรียบร้อย', data: booking }
    }

    // 3. /bookings/:id/decide
    if (parts.length === 3 && parts[2] === 'decide' && method === 'POST') {
      const bId = Number(parts[1])
      const body = await readBody(event).catch(() => ({}))
      const booking = BOOKINGS_DATA.find(b => b.id === bId)
      if (booking) {
        if (body.decision === 'interested') {
          booking.status = 'visited'
        } else {
          booking.status = 'cancelled'
        }
      }
      return { status: true, code: 200, message: 'บันทึกการตัดสินใจเรียบร้อย', data: booking }
    }

    // 4. /bookings/waiting-queue/:stallIdent
    if (parts.length === 3 && parts[1] === 'waiting-queue') {
      const stallIdent = decodeURIComponent(parts[2])
      const queues = BOOKINGS_DATA.filter(b => b.stall_number === stallIdent && (b.status === 'pending_approval' || b.status === 'pending'))
      return {
        stall_code: stallIdent,
        total_in_queue: queues.length,
        current_queue: queues.length > 0 ? 1 : 0,
        estimated_wait_days: queues.length * 3,
        can_queue: true
      }
    }

    // 5. POST /bookings (Create new booking)
    if (parts.length === 1 && method === 'POST') {
      const body = await readBody(event).catch(() => ({}))
      const stallId = Number(body.stall_id) || 1
      const stall = STALLS_DATA.find(s => s.id === stallId) || STALLS_DATA[0]
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const bookingNumber = `BK-${new Date().getFullYear()}-${randomNum}`

      const newBooking = {
        id: Date.now(),
        booking_number: bookingNumber,
        stall_id: stall?.id || stallId,
        stall_number: stall?.stall_number || `A-${stallId}`,
        stall_monthly_rate: stall?.monthly_rate || 2500,
        market_name: stall?.market_name || 'ตลาดนัดจตุจักร',
        tenant_name: body.tenant_name || 'ผู้ขอจองเข้าชม',
        tenant_phone: body.tenant_phone || '081-000-0000',
        tenant_email: body.tenant_email || '',
        tenant_id_card: body.tenant_id_card || '',
        visit_date: body.visit_date || new Date().toISOString().slice(0, 10),
        visit_time_slot: body.visit_time_slot || '10:00 - 12:00',
        intended_business: body.intended_business || 'จำหน่ายสินค้าทั่วไป',
        status: 'pending_approval',
        created_at: new Date().toISOString()
      }

      // Mark stall status as reserved
      if (stall) {
        stall.status = 'reserved'
      }

      // Store in memory so it appears immediately in GET /bookings
      BOOKINGS_DATA.unshift(newBooking)

      return {
        status: true,
        code: 200,
        data: newBooking,
        ...newBooking
      }
    }

    // 6. GET /bookings
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
    if (method === 'POST') {
      const body = await readBody(event).catch(() => ({}))
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const appNumber = `APP-${new Date().getFullYear()}-${randomNum}`
      const stallId = Number(body.stall_id) || 1
      const stall = STALLS_DATA.find(s => s.id === stallId) || STALLS_DATA[0]

      const newApp = {
        id: Date.now(),
        application_number: appNumber,
        tenant_name: body.applicant_name || body.tenant_name || 'ผู้ยื่นคำร้อง',
        tenant_phone: body.applicant_phone || body.tenant_phone || '',
        tenant_id_card: body.id_card_number || body.tenant_id_card || '',
        stall_id: stallId,
        stall_number: stall?.stall_number || `A-${stallId}`,
        market_name: stall?.market_name || 'ตลาดนัดจตุจักร',
        business_name: body.intended_product_type || body.business_name || 'ร้านค้า',
        business_type: body.business_type || 'ทั่วไป',
        stage: 'submitted',
        status: 'pending',
        created_at: new Date().toISOString()
      }

      APPLICATIONS_DATA.unshift(newApp)
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
    return {
      status: true,
      code: 200,
      data: {
        access_token: 'mock-jwt-token-bma-emarket-2026',
        token_type: 'bearer',
        role,
        user: userInfo
      },
      access_token: 'mock-jwt-token-bma-emarket-2026',
      token_type: 'bearer',
      role,
      user: userInfo
    }
  }

  // Fallback default response
  return { status: true, message: 'BMA e-Market API Ready', slug: cleanSlug }
})
