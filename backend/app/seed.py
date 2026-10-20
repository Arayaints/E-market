import json
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.stall import Zone, Stall
from app.models.contract import Contract
from app.models.booking import StallBooking, LeaseApplication
from app.core.security import get_password_hash

def seed_database(db: Session):
    # 1. Create Default Users
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            username="admin",
            email="admin@emarket.com",
            hashed_password=get_password_hash("admin1234"),
            full_name="ผู้ดูแลระบบ (System Admin)",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
    else:
        admin_user.email = "admin@emarket.com"

    staff_user = db.query(User).filter(User.username == "staff").first()
    if not staff_user:
        staff_user = User(
            username="staff",
            email="staff@emarket.com",
            hashed_password=get_password_hash("staff1234"),
            full_name="เจ้าหน้าที่ดูแลตลาด (Market Staff)",
            role="staff",
            is_active=True
        )
        db.add(staff_user)
    else:
        staff_user.email = "staff@emarket.com"

    tenant_user = db.query(User).filter(User.username == "tenant").first()
    if not tenant_user:
        tenant_user = User(
            username="tenant",
            email="somchai@tenant.com",
            hashed_password=get_password_hash("tenant1234"),
            full_name="สมชาย ใจดี (ผู้เช่าแผงค้า)",
            role="tenant",
            is_active=True
        )
        db.add(tenant_user)
    else:
        tenant_user.email = "somchai@tenant.com"

    db.commit()
    db.refresh(admin_user)

    # 2. Create Zones if none exist
    if db.query(Zone).count() == 0:
        zones_data = [
            {
                "code": "A",
                "name": "โซน A: ตลาดสดและวัตถุดิบ (Fresh Market)",
                "color_code": "#10B981", # Emerald
                "description": "เนื้อสัตว์ ผักสด ผลไม้ตามฤดูกาล อาหารทะเลสด"
            },
            {
                "code": "B",
                "name": "โซน B: สตรีทฟู้ดและอาหารปรุงสุก (Street Food & Dining)",
                "color_code": "#F59E0B", # Amber
                "description": "อาหารปรุงร้อน ก๋วยเตี๋ยว อาหารตามสั่ง ขนมหวาน และเครื่องดื่ม"
            },
            {
                "code": "C",
                "name": "โซน C: แฟชั่นและเสื้อผ้า (Fashion & Apparel)",
                "color_code": "#8B5CF6", # Purple
                "description": "เสื้อผ้าแฟชั่น รองเท้า กระเป๋า เครื่องประดับ และของแต่งตัว"
            },
            {
                "code": "D",
                "name": "โซน D: สินค้าเบ็ดเตล็ดและไอที (General & IT Accessories)",
                "color_code": "#3B82F6", # Blue
                "description": "ของใช้ในบ้าน อุปกรณ์มือถือ เครื่องใช้ไฟฟ้าขนาดเล็ก ซ่อมอุปกรณ์"
            }
        ]
        zone_map = {}
        for zd in zones_data:
            z = Zone(**zd)
            db.add(z)
            db.commit()
            db.refresh(z)
            zone_map[z.code] = z

        # 3. Create Sample Stalls with GIS Coordinates (Chatuchak Market area, Bangkok)
        # Base origin: lat 13.8000, lng 100.5500
        # Each stall is approx 3m x 3m (0.00003 deg latitude/longitude)
        stalls_seed = [
            # Zone A: Fresh Market (rows 1-2)
            {"stall_number": "A-01", "zone": "A", "category": "ผักและผลไม้", "daily_rate": 150, "monthly_rate": 3800, "status": "occupied", "pos_x": 1, "pos_y": 1, "d_lat": 0.00030, "d_lng": 0.00010},
            {"stall_number": "A-02", "zone": "A", "category": "ผักและผลไม้", "daily_rate": 150, "monthly_rate": 3800, "status": "occupied", "pos_x": 2, "pos_y": 1, "d_lat": 0.00030, "d_lng": 0.00020},
            {"stall_number": "A-03", "zone": "A", "category": "อาหารทะเลสด", "daily_rate": 200, "monthly_rate": 4500, "status": "available", "pos_x": 3, "pos_y": 1, "d_lat": 0.00030, "d_lng": 0.00030},
            {"stall_number": "A-04", "zone": "A", "category": "เนื้อสัตว์สด", "daily_rate": 200, "monthly_rate": 4500, "status": "occupied", "pos_x": 4, "pos_y": 1, "d_lat": 0.00030, "d_lng": 0.00040},
            {"stall_number": "A-05", "zone": "A", "category": "เครื่องเทศและของแห้ง", "daily_rate": 140, "monthly_rate": 3500, "status": "available", "pos_x": 1, "pos_y": 2, "d_lat": 0.00022, "d_lng": 0.00010},
            {"stall_number": "A-06", "zone": "A", "category": "ผลไม้นำเข้า", "daily_rate": 160, "monthly_rate": 4000, "status": "maintenance", "pos_x": 2, "pos_y": 2, "d_lat": 0.00022, "d_lng": 0.00020},

            # Zone B: Street Food (rows 3-4)
            {"stall_number": "B-01", "zone": "B", "category": "อาหารจานด่วน", "daily_rate": 250, "monthly_rate": 6000, "status": "occupied", "pos_x": 1, "pos_y": 3, "d_lat": 0.00010, "d_lng": 0.00010},
            {"stall_number": "B-02", "zone": "B", "category": "ก๋วยเตี๋ยวและราเมง", "daily_rate": 250, "monthly_rate": 6000, "status": "occupied", "pos_x": 2, "pos_y": 3, "d_lat": 0.00010, "d_lng": 0.00020},
            {"stall_number": "B-03", "zone": "B", "category": "เครื่องดื่มและชาชง", "daily_rate": 200, "monthly_rate": 5000, "status": "occupied", "pos_x": 3, "pos_y": 3, "d_lat": 0.00010, "d_lng": 0.00030},
            {"stall_number": "B-04", "zone": "B", "category": "ของทอดและลูกชิ้นปิ้ง", "daily_rate": 180, "monthly_rate": 4500, "status": "available", "pos_x": 4, "pos_y": 3, "d_lat": 0.00010, "d_lng": 0.00040},
            {"stall_number": "B-05", "zone": "B", "category": "เบเกอรี่และของหวาน", "daily_rate": 200, "monthly_rate": 5000, "status": "available", "pos_x": 1, "pos_y": 4, "d_lat": 0.00002, "d_lng": 0.00010},
            {"stall_number": "B-06", "zone": "B", "category": "ส้มตำ ไก่ย่าง", "daily_rate": 220, "monthly_rate": 5500, "status": "occupied", "pos_x": 2, "pos_y": 4, "d_lat": 0.00002, "d_lng": 0.00020},

            # Zone C: Fashion (rows 5-6)
            {"stall_number": "C-01", "zone": "C", "category": "เสื้อผ้าแฟชั่นสตรี", "daily_rate": 180, "monthly_rate": 4200, "status": "occupied", "pos_x": 1, "pos_y": 5, "d_lat": -0.00010, "d_lng": 0.00010},
            {"stall_number": "C-02", "zone": "C", "category": "รองเท้าและกระเป๋า", "daily_rate": 180, "monthly_rate": 4200, "status": "available", "pos_x": 2, "pos_y": 5, "d_lat": -0.00010, "d_lng": 0.00020},
            {"stall_number": "C-03", "zone": "C", "category": "เสื้อยืดและกางเกงยีนส์", "daily_rate": 180, "monthly_rate": 4200, "status": "occupied", "pos_x": 3, "pos_y": 5, "d_lat": -0.00010, "d_lng": 0.00030},
            {"stall_number": "C-04", "zone": "C", "category": "เครื่องประดับและกิ๊ฟช็อป", "daily_rate": 150, "monthly_rate": 3500, "status": "available", "pos_x": 4, "pos_y": 5, "d_lat": -0.00010, "d_lng": 0.00040},

            # Zone D: General & IT (rows 7-8)
            {"stall_number": "D-01", "zone": "D", "category": "อุปกรณ์โทรศัพท์และเคส", "daily_rate": 160, "monthly_rate": 4000, "status": "occupied", "pos_x": 1, "pos_y": 6, "d_lat": -0.00022, "d_lng": 0.00010},
            {"stall_number": "D-02", "zone": "D", "category": "ของใช้จิปาถะในบ้าน", "daily_rate": 150, "monthly_rate": 3600, "status": "available", "pos_x": 2, "pos_y": 6, "d_lat": -0.00022, "d_lng": 0.00020},
            {"stall_number": "D-03", "zone": "D", "category": "ร้านซ่อมมือถือและคอม", "daily_rate": 180, "monthly_rate": 4200, "status": "occupied", "pos_x": 3, "pos_y": 6, "d_lat": -0.00022, "d_lng": 0.00030},
            {"stall_number": "D-04", "zone": "D", "category": "อุปกรณ์สัตว์เลี้ยง", "daily_rate": 150, "monthly_rate": 3500, "status": "available", "pos_x": 4, "pos_y": 6, "d_lat": -0.00022, "d_lng": 0.00040},
        ]

        stall_map = {}
        base_center_lat = 13.79980
        base_center_lng = 100.55010
        box_half = 0.000035

        for s in stalls_seed:
            zone_obj = zone_map[s["zone"]]
            lat = round(base_center_lat + s["d_lat"], 6)
            lng = round(base_center_lng + s["d_lng"], 6)
            
            # Construct standard GeoJSON polygon
            polygon = [[[
                round(lng - box_half, 6), round(lat - box_half, 6)
            ], [
                round(lng + box_half, 6), round(lat - box_half, 6)
            ], [
                round(lng + box_half, 6), round(lat + box_half, 6)
            ], [
                round(lng - box_half, 6), round(lat + box_half, 6)
            ], [
                round(lng - box_half, 6), round(lat - box_half, 6)
            ]]]

            stall = Stall(
                stall_number=s["stall_number"],
                zone_id=zone_obj.id,
                size_width=2.5,
                size_length=3.0,
                area_sqm=7.5,
                daily_rate=s["daily_rate"],
                monthly_rate=s["monthly_rate"],
                status=s["status"],
                category=s["category"],
                electricity_meter=f"EM-{s['stall_number']}",
                water_meter=f"WM-{s['stall_number']}",
                description=f"แผงเช่ามาตรฐาน ขนาด 7.5 ตร.ม. พร้อมปลั๊กไฟและมิเตอร์แยก",
                position_x=s["pos_x"],
                position_y=s["pos_y"],
                lat=lat,
                lng=lng,
                polygon_geojson=json.dumps(polygon)
            )
            db.add(stall)
            db.commit()
            db.refresh(stall)
            stall_map[stall.stall_number] = stall

        # 4. Create Sample Contracts for Occupied Stalls
        contracts_seed = [
            {
                "contract_number": "CNT-2026-0001",
                "stall_num": "A-01",
                "tenant_name": "สมชาย ใจดี",
                "tenant_id_card": "1100500123456",
                "tenant_phone": "081-234-5678",
                "tenant_email": "somchai.j@gmail.com",
                "tenant_address": "88/1 หมู่ 3 ต.บางแค อ.ภาษีเจริญ กทม.",
                "business_name": "สวนผักลุงสมชาย สดจากไร่",
                "business_type": "ผักสดออร์แกนิก",
                "start_date": date.today() - timedelta(days=90),
                "end_date": date.today() + timedelta(days=275),
                "billing_cycle": "monthly",
                "rental_fee": 3800.0,
                "security_deposit": 7600.0,
                "advance_payment": 3800.0,
                "terms_and_conditions": "ห้ามนำสินค้าผิดกฎหมายมาจำหน่าย ทำความสะอาดแผงหลังปิดตลาดทุกวัน",
                "status": "active"
            },
            {
                "contract_number": "CNT-2026-0002",
                "stall_num": "A-02",
                "tenant_name": "วันดี มีทรัพย์",
                "tenant_id_card": "3101200456789",
                "tenant_phone": "089-876-5432",
                "tenant_email": "wandee.fruit@hotmail.com",
                "tenant_address": "120/4 ถ.จรัญสนิทวงศ์ บางพลัด กทม.",
                "business_name": "เจ๊วันดี ผลไม้ตามฤดูกาล",
                "business_type": "ผลไม้สดเกรดพรีเมียม",
                "start_date": date.today() - timedelta(days=60),
                "end_date": date.today() + timedelta(days=20),
                "billing_cycle": "monthly",
                "rental_fee": 3800.0,
                "security_deposit": 7600.0,
                "advance_payment": 3800.0,
                "terms_and_conditions": "รักษาความสะอาดของแผงและพื้นที่โดยรอบ ทิ้งขยะในจุดที่ตลาดกำหนด",
                "status": "active"
            },
            {
                "contract_number": "CNT-2026-0003",
                "stall_num": "B-01",
                "tenant_name": "ชัยวัฒน์ รัตนวิชัย",
                "tenant_id_card": "1103700987654",
                "tenant_phone": "092-334-9988",
                "tenant_email": "chaiwat.chicken@gmail.com",
                "tenant_address": "45 ซอยเพชรเกษม 54 ภาษีเจริญ กทม.",
                "business_name": "ข้าวมันไก่เฮียชัย สูตรไหหลำ",
                "business_type": "อาหารจานเดียว",
                "start_date": date.today() - timedelta(days=120),
                "end_date": date.today() + timedelta(days=245),
                "billing_cycle": "monthly",
                "rental_fee": 6000.0,
                "security_deposit": 12000.0,
                "advance_payment": 6000.0,
                "terms_and_conditions": "ติดตั้งถังดักไขมันตามมาตรฐานของตลาด ตรวจเช็คถังดับเพลิงประจำเดือน",
                "status": "active"
            },
            {
                "contract_number": "CNT-2026-0004",
                "stall_num": "B-03",
                "tenant_name": "ปิยะนุช สดใส",
                "tenant_id_card": "2104500332211",
                "tenant_phone": "085-555-1234",
                "tenant_email": "nuch.cafe@yahoo.com",
                "tenant_address": "9/15 ซอยสุขสวัสดิ์ 26 ราษฎร์บูรณะ กทม.",
                "business_name": "ชงเจริญ ชาไทย & กาแฟโบราณ",
                "business_type": "เครื่องดื่มชงสด",
                "start_date": date.today() - timedelta(days=30),
                "end_date": date.today() + timedelta(days=335),
                "billing_cycle": "monthly",
                "rental_fee": 5000.0,
                "security_deposit": 10000.0,
                "advance_payment": 5000.0,
                "terms_and_conditions": "ใช้น้ำแข็งที่สะอาดและมีมาตรฐานตามสุขอนามัย",
                "status": "active"
            }
        ]

        for cd in contracts_seed:
            stall_obj = stall_map.get(cd["stall_num"])
            if stall_obj:
                c = Contract(
                    contract_number=cd["contract_number"],
                    stall_id=stall_obj.id,
                    tenant_name=cd["tenant_name"],
                    tenant_id_card=cd["tenant_id_card"],
                    tenant_phone=cd["tenant_phone"],
                    tenant_email=cd["tenant_email"],
                    tenant_address=cd["tenant_address"],
                    business_name=cd["business_name"],
                    business_type=cd["business_type"],
                    start_date=cd["start_date"],
                    end_date=cd["end_date"],
                    billing_cycle=cd["billing_cycle"],
                    rental_fee=cd["rental_fee"],
                    security_deposit=cd["security_deposit"],
                    advance_payment=cd["advance_payment"],
                    terms_and_conditions=cd["terms_and_conditions"],
                    status=cd["status"],
                    created_by_id=admin_user.id
                )
                db.add(c)
        db.commit()

        # 5. Create Sample Stall Bookings (ตาม Flow ใหม่: จองดูแผง -> จนท. อนุมัติ -> เข้าดูแผง)
        sample_bookings = [
            {
                "booking_number": "BK-2026-0001",
                "stall_num": "A-03",
                "tenant_name": "กิตติพงษ์ มั่นคง",
                "tenant_phone": "089-111-2233",
                "tenant_email": "kittipong@gmail.com",
                "tenant_id_card": "1100200334455",
                "visit_date": date.today() + timedelta(days=2),
                "visit_time_slot": "10:00 - 12:00",
                "intended_business": "ร้านอาหารทะเลแห้งแปรรูป",
                "status": "pending_approval" # รอเจ้าหน้าที่อนุมัติ
            },
            {
                "booking_number": "BK-2026-0002",
                "stall_num": "B-04",
                "tenant_name": "รัตนาภรณ์ มีโชค",
                "tenant_phone": "081-444-5566",
                "tenant_email": "rattanaporn@gmail.com",
                "tenant_id_card": "3100500778899",
                "visit_date": date.today() + timedelta(days=1),
                "visit_time_slot": "14:00 - 16:00",
                "intended_business": "ร้านลูกชิ้นปลาระเบิดและไก่ทอดหาดใหญ่",
                "status": "approved", # นัดหมายสำเร็จ (จนท. อนุมัติแล้ว)
                "officer_notes": "อนุมัตินัดหมาย ให้เจ้าหน้าที่เวรนำชมแผง"
            },
            {
                "booking_number": "BK-2026-0003",
                "stall_num": "C-02",
                "tenant_name": "อนันต์ เจริญสุข",
                "tenant_phone": "086-777-8899",
                "tenant_email": "anan.shoe@gmail.com",
                "tenant_id_card": "1103300556677",
                "visit_date": date.today() - timedelta(days=1),
                "visit_time_slot": "13:00 - 15:00",
                "intended_business": "ร้านรองเท้าผ้าใบแฟชั่นมือหนึ่ง",
                "status": "visited" # ดูแผงหน้างานแล้ว รอตัดสินใจยื่นคำร้อง
            }
        ]

        for b in sample_bookings:
            stall_obj = stall_map.get(b["stall_num"])
            if stall_obj:
                booking_obj = StallBooking(
                    booking_number=b["booking_number"],
                    stall_id=stall_obj.id,
                    tenant_name=b["tenant_name"],
                    tenant_phone=b["tenant_phone"],
                    tenant_email=b["tenant_email"],
                    tenant_id_card=b["tenant_id_card"],
                    visit_date=b["visit_date"],
                    visit_time_slot=b["visit_time_slot"],
                    intended_business=b["intended_business"],
                    status=b["status"],
                    officer_notes=b.get("officer_notes")
                )
                db.add(booking_obj)
        db.commit()

        # 6. Create Sample Lease Application (ผู้เช่ายื่นคำร้องขอเช่าแผง)
        app_stall = stall_map.get("C-02")
        if app_stall:
            app_obj = LeaseApplication(
                application_number="REQ-2026-0001",
                stall_id=app_stall.id,
                applicant_name="อนันต์ เจริญสุข",
                applicant_id_card="1103300556677",
                applicant_phone="086-777-8899",
                applicant_email="anan.shoe@gmail.com",
                applicant_address="55/2 ซอยประชาอุทิศ 12 บางมด ทุ่งครุ กทม.",
                shop_name="อนันต์ สนีกเกอร์",
                product_type="รองเท้าแฟชั่นและอุปกรณ์ดูแลรองเท้า",
                requested_start_date=date.today() + timedelta(days=10),
                requested_period_months=12,
                proposed_rent_type="monthly",
                status="pending_officer", # รอเจ้าหน้าที่ตรวจสอบคำร้อง
                officer_comment="เอกสารครบถ้วน รอเสนอ ผอ.ตลาด"
            )
            db.add(app_obj)
        db.commit()
