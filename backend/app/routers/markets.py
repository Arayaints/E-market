from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/markets", tags=["Markets Directory"])

class MarketItem(BaseModel):
    id: int
    slug: str
    name: str
    name_en: str
    district: str
    address: str
    lat: float
    lng: float
    status: str  # 'open', 'full'
    total_stalls: int
    available_stalls: int
    starting_price_daily: int
    starting_price_monthly: int
    image_url: str
    tags: List[str]
    category: str
    operating_hours: str
    description: str
    has_event: bool = False
    event_title: Optional[str] = None

class MarketEvent(BaseModel):
    id: int
    market_id: int
    market_name: str
    title: str
    date_range: str
    location_detail: str
    vacancies_count: int
    is_open: bool
    badge: str
    image_url: str

MARKETS_DATA = [
    {
        "id": 1,
        "slug": "chatuchak",
        "name": "ตลาดนัดจตุจักร",
        "name_en": "Chatuchak Weekend Market",
        "district": "เขตจตุจักร",
        "address": "587/10 ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
        "lat": 13.79996,
        "lng": 100.55047,
        "status": "open",
        "total_stalls": 1500,
        "available_stalls": 12,
        "starting_price_daily": 120,
        "starting_price_monthly": 1800,
        "image_url": "/images/chatuchak_entrance.jpg",
        "tags": ["🛒 ตลาดนัดสุดสัปดาห์", "🚇 BTS หมอชิต / MRT สวนจตุจักร", "🅿️ มีที่จอดรถ 800+ คัน"],
        "category": "weekend",
        "operating_hours": "เสาร์ - อาทิตย์ 09:00 - 18:00 น.",
        "description": "ศูนย์รวมการค้าปลีกกลางแจ้งที่ใหญ่ที่สุดในโลก สินค้าแฟชั่น ของแต่งบ้าน งานคราฟต์ อาหาร และต้นไม้",
        "has_event": True,
        "event_title": "Weekend Craft & Fashion Market"
    },
    {
        "id": 2,
        "slug": "pracha-niwet-1",
        "name": "ตลาดประชานิเวศน์ 1",
        "name_en": "Pracha Niwet 1 Market",
        "district": "เขตจตุจักร",
        "address": "ถนนเทศบาลสงเคราะห์ แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
        "lat": 13.8441,
        "lng": 100.5489,
        "status": "open",
        "total_stalls": 180,
        "available_stalls": 8,
        "starting_price_daily": 150,
        "starting_price_monthly": 2200,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🍲 อาหารปรุงสำเร็จ", "🥦 ผักผลไม้สด", "🚌 รถเมล์สาย 67, 70"],
        "category": "fresh_market",
        "operating_hours": "ทุกวัน 05:00 - 19:00 น.",
        "description": "ตลาดสดและอาหารสำเร็จรูปชื่อดังย่านประชานิเวศน์ สะอาด ปลอดภัย สินค้าคุณภาพดีเพื่อคนเมือง",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 3,
        "slug": "min-buri",
        "name": "ตลาดมีนบุรี",
        "name_en": "Min Buri Market",
        "district": "เขตมีนบุรี",
        "address": "ถนนสีหบุรานุกิจ แขวงมีนบุรี เขตมีนบุรี กรุงเทพฯ 10510",
        "lat": 13.8139,
        "lng": 100.7188,
        "status": "open",
        "total_stalls": 450,
        "available_stalls": 15,
        "starting_price_daily": 100,
        "starting_price_monthly": 1500,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🚝 รถไฟฟ้าสายสีชมพู (สถานีตลาดมีนบุรี)", "🛍️ ศูนย์ค้าปลีก-ส่ง", "🅿️ มีที่จอดรถ"],
        "category": "metro",
        "operating_hours": "ทุกวัน 04:00 - 20:00 น.",
        "description": "ศูนย์กลางตลาดค้าส่ง-ปลีกฝั่งกรุงเทพฯ ตะวันออก เชื่อมต่อการเดินทางด้วยรถไฟฟ้าสายสีชมพู",
        "has_event": True,
        "event_title": "ตลาดนัดสินค้าชุมชนมีนบุรี"
    },
    {
        "id": 4,
        "slug": "singhanat",
        "name": "ตลาดสิงหนาท",
        "name_en": "Singhanat Market",
        "district": "เขตคลองเตย",
        "address": "ซอยสุขุมวิท 22 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        "lat": 13.7285,
        "lng": 100.5642,
        "status": "open",
        "total_stalls": 90,
        "available_stalls": 4,
        "starting_price_daily": 180,
        "starting_price_monthly": 2500,
        "image_url": "/images/market_promo_hero.jpg",
        "tags": ["🚇 MRT ศูนย์สิริกิติ์", "🏙️ ย่านธุรกิจสุขุมวิท", "☕ อาหารและเครื่องดื่ม"],
        "category": "metro",
        "operating_hours": "จันทร์ - ศุกร์ 06:00 - 15:00 น.",
        "description": "ตลาดชุมชนใจกลางสุขุมวิท 22 รองรับกลุ่มคนทำงานออฟฟิศ นักท่องเที่ยว และผู้อยู่อาศัยในพื้นที่",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 5,
        "slug": "thewarat",
        "name": "ตลาดเทวราช",
        "name_en": "Thewarat Market",
        "district": "เขตดุสิต",
        "address": "ถนนพิษณุโลก แขวงสี่แยกมหานาค เขตดุสิต กรุงเทพฯ 10300",
        "lat": 13.7712,
        "lng": 100.5050,
        "status": "open",
        "total_stalls": 260,
        "available_stalls": 7,
        "starting_price_daily": 120,
        "starting_price_monthly": 1800,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🚤 ท่าเรือเทเวศร์", "🌸 ไม้ดอกไม้ประดับ", "🥦 ผักสดปลอดสาร"],
        "category": "fresh_market",
        "operating_hours": "ทุกวัน 04:00 - 18:00 น.",
        "description": "ตลาดเก่าแก่ริมแม่น้ำเจ้าพระยา แหล่งรวมต้นไม้ พืชสวน ผักผลไม้สดคุณภาพสูง",
        "has_event": True,
        "event_title": "Green Living & Organic Pop-up"
    },
    {
        "id": 6,
        "slug": "rat-burana",
        "name": "ตลาดราษฎร์บูรณะ",
        "name_en": "Rat Burana Market",
        "district": "เขตราษฎร์บูรณะ",
        "address": "ถนนราษฎร์บูรณะ แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ 10140",
        "lat": 13.6823,
        "lng": 100.5034,
        "status": "open",
        "total_stalls": 140,
        "available_stalls": 6,
        "starting_price_daily": 90,
        "starting_price_monthly": 1400,
        "image_url": "/images/market_promo_hero.jpg",
        "tags": ["🦀 อาหารทะเลสด", "🌊 ทำเลริมแม่น้ำ", "🚌 สาย 6, 17, 37"],
        "category": "fresh_market",
        "operating_hours": "ทุกวัน 05:00 - 19:00 น.",
        "description": "ตลาดสดชุมชนฝั่งธนบุรี โดดเด่นด้านอาหารทะเลสดใหม่ และอาหารพื้นบ้านรสเลิศ",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 7,
        "slug": "bang-kapi",
        "name": "ตลาดบางกะปิ",
        "name_en": "Bang Kapi Market",
        "district": "เขตบางกะปิ",
        "address": "ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ 10240",
        "lat": 13.7668,
        "lng": 100.6445,
        "status": "open",
        "total_stalls": 320,
        "available_stalls": 11,
        "starting_price_daily": 130,
        "starting_price_monthly": 1900,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🚝 รถไฟฟ้าสายสีเหลือง (สถานีบางกะปิ)", "🚤 ท่าเรือเดอะมอลล์บางกะปิ", "🛍️ สินค้าแฟชั่น"],
        "category": "metro",
        "operating_hours": "ทุกวัน 06:00 - 21:00 น.",
        "description": "ย่านการค้าที่มีผู้คนสัญจรหนาแน่น เชื่อมต่อระบบรางและคลองแสนแสบ เหมาะกับร้านค้าทุกประเภท",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 8,
        "slug": "wongwian-lek",
        "name": "ตลาดพระเครื่องวงเวียนเล็ก",
        "name_en": "Wongwian Lek Amulet Market",
        "district": "เขตคลองสาน",
        "address": "ซอยสมเด็จเจ้าพระยา แขวงสมเด็จเจ้าพระยา เขตคลองสาน กรุงเทพฯ 10600",
        "lat": 13.7335,
        "lng": 100.4965,
        "status": "full",
        "total_stalls": 120,
        "available_stalls": 0,
        "starting_price_daily": 160,
        "starting_price_monthly": 2400,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🚝 รถไฟฟ้าสายสีทอง (สถานีคลองสาน)", "🏺 ศูนย์รวมพระเครื่อง", "🔴 ติดจองเต็ม"],
        "category": "popular",
        "operating_hours": "ทุกวัน 08:00 - 17:00 น.",
        "description": "ศูนย์พระเครื่องชั้นนำระดับประเทศ เป็นที่นิยมของเซียนพระและนักสะสมทั่วประเทศ",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 9,
        "slug": "nong-chok",
        "name": "ตลาดหนองจอก",
        "name_en": "Nong Chok Market",
        "district": "เขตหนองจอก",
        "address": "ถนนมิตรไมตรี แขวงหนองจอก เขตหนองจอก กรุงเทพฯ 10530",
        "lat": 13.8564,
        "lng": 100.8641,
        "status": "open",
        "total_stalls": 210,
        "available_stalls": 14,
        "starting_price_daily": 80,
        "starting_price_monthly": 1200,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🕌 อาหารฮาลาล", "🌾 ผลผลิตเกษตรชุมชน", "🅿️ จอดรถสะดวก"],
        "category": "fresh_market",
        "operating_hours": "ทุกวัน 05:00 - 18:00 น.",
        "description": "ตลาดชุมชนชานเมืองกรุงเทพฯ ศูนย์กลางอาหารฮาลาลและผลิตผลเกษตรอินทรีย์คุณภาพดี",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 10,
        "slug": "ratchadaphisek",
        "name": "ตลาดรัชดาภิเษก",
        "name_en": "Ratchadaphisek Market",
        "district": "เขตธนบุรี",
        "address": "ถนนรัชดาภิเษก แขวงดาวคะนอง เขตธนบุรี กรุงเทพฯ 10600",
        "lat": 13.7088,
        "lng": 100.4823,
        "status": "open",
        "total_stalls": 160,
        "available_stalls": 9,
        "starting_price_daily": 140,
        "starting_price_monthly": 2000,
        "image_url": "/images/market_promo_hero.jpg",
        "tags": ["🚝 BTS ตลาดพลู / BRT ราชพฤกษ์", "🍱 สตรีทฟู้ด", "🥐 ขนมไทยโบราณ"],
        "category": "metro",
        "operating_hours": "ทุกวัน 06:00 - 20:00 น.",
        "description": "ตลาดสดและสตรีทฟู้ดย่านตลาดพลู แหล่งรวมของอร่อยสำหรับคนทำงานและครอบครัว",
        "has_event": False,
        "event_title": None
    },
    {
        "id": 11,
        "slug": "thonburi-sanamluang-2",
        "name": "ตลาดธนบุรี (สนามหลวง 2)",
        "name_en": "Thonburi Market (Sanam Luang 2)",
        "district": "เขตทวีวัฒนา",
        "address": "ถนนเลียบคลองทวีวัฒนา แขวงทวีวัฒนา เขตทวีวัฒนา กรุงเทพฯ 10170",
        "lat": 13.7479,
        "lng": 100.3542,
        "status": "open",
        "total_stalls": 800,
        "available_stalls": 22,
        "starting_price_daily": 100,
        "starting_price_monthly": 1500,
        "image_url": "/images/market_hall_front.jpg",
        "tags": ["🐶 โซนสัตว์เลี้ยง", "🪴 ตลาดต้นไม้ใหญ่", "🅿️ ที่จอดรถกว่า 1,200 คัน"],
        "category": "popular",
        "operating_hours": "ทุกวัน 08:00 - 18:00 น.",
        "description": "ตลาดนัดสุดสัปดาห์ฝั่งธนบุรี บรรยากาศร่มรื่น ศูนย์รวมสัตว์เลี้ยง ต้นไม้ ของสะสม และงานฝีมือ",
        "has_event": True,
        "event_title": "Food Festival & Music Fest 2026"
    },
    {
        "id": 12,
        "slug": "bang-khae-phirom",
        "name": "ตลาดบางแคภิรมย์",
        "name_en": "Bang Khae Phirom Market",
        "district": "เขตบางแค",
        "address": "ซอยเพชรเกษม 69 แขวงหลักสอง เขตบางแค กรุงเทพฯ 10160",
        "lat": 13.6896,
        "lng": 100.3807,
        "status": "open",
        "total_stalls": 190,
        "available_stalls": 5,
        "starting_price_daily": 110,
        "starting_price_monthly": 1600,
        "image_url": "/images/market_promo_hero.jpg",
        "tags": ["🌳 ติดสวนสาธารณะ", "🏃‍♂️ ตลาดคนรักสุขภาพ", "🚇 MRT หลักสอง (5 นาที)"],
        "category": "popular",
        "operating_hours": "ทุกวัน 06:00 - 20:00 น.",
        "description": "ตลาดริมสวนสุขภาพบางแคภิรมย์ บรรยากาศโปร่งสบาย เหมาะกับสินค้าเพื่อสุขภาพและอาหารครอบครัว",
        "has_event": False,
        "event_title": None
    }
]

EVENTS_DATA = [
    {
        "id": 1,
        "market_id": 1,
        "market_name": "ตลาดนัดจตุจักร (โครงการ 23)",
        "title": "Weekend Craft & Fashion Market",
        "date_range": "25 - 26 ต.ค. 2026 (09:00 - 18:00 น.)",
        "location_detail": "โซนลานกิจกรรมพิเศษ โครงการ 23 ตลาดนัดจตุจักร",
        "vacancies_count": 12,
        "is_open": True,
        "badge": "รับสมัครผู้ค้า",
        "image_url": "/images/chatuchak_entrance.jpg"
    },
    {
        "id": 2,
        "market_id": 11,
        "market_name": "ตลาดธนบุรี (สนามหลวง 2)",
        "title": "Food Festival & Music Fest 2026",
        "date_range": "1 - 3 พ.ย. 2026 (10:00 - 20:00 น.)",
        "location_detail": "ลานน้ำพุกลางแจ้ง ตลาดธนบุรี (สนามหลวง 2)",
        "vacancies_count": 18,
        "is_open": True,
        "badge": "รับสมัครผู้ค้า",
        "image_url": "/images/market_hall_front.jpg"
    },
    {
        "id": 3,
        "market_id": 5,
        "market_name": "ตลาดเทวราช ดุสิต",
        "title": "Green Living & Organic Pop-up",
        "date_range": "8 - 10 พ.ย. 2026 (08:00 - 17:00 น.)",
        "location_detail": "โซนริมน้ำ ท่าเรือเทเวศร์ ตลาดเทวราช",
        "vacancies_count": 3,
        "is_open": True,
        "badge": "รับสมัครผู้ค้า",
        "image_url": "/images/market_promo_hero.jpg"
    }
]

@router.get("", response_model=List[MarketItem], summary="Get all 12 BMA markets")
def get_all_markets(
    search: Optional[str] = Query(None, description="Search by name, district, or tags"),
    category: Optional[str] = Query(None, description="Filter by category"),
    only_available: bool = Query(False, description="Filter only markets with open stalls")
):
    results = MARKETS_DATA
    if search:
        q = search.lower().strip()
        results = [
            m for m in results
            if q in m["name"].lower() or q in m["name_en"].lower() or q in m["district"].lower() or any(q in t.lower() for t in m["tags"])
        ]
    if category and category != "all":
        results = [m for m in results if m["category"] == category]
    if only_available:
        results = [m for m in results if m["status"] == "open" and m["available_stalls"] > 0]
    return results

@router.get("/events", response_model=List[MarketEvent], summary="Get featured market events")
def get_market_events():
    return EVENTS_DATA

@router.get("/{market_id}", response_model=MarketItem, summary="Get single market details")
def get_market_by_id(market_id: int):
    for m in MARKETS_DATA:
        if m["id"] == market_id:
            return m
    raise HTTPException(status_code=404, detail="ไม่พบข้อมูลตลาดที่ระบุ")
