from fastapi.testclient import TestClient
from app.main import app

def test_booking_and_application_workflow():
    with TestClient(app) as client:
        # 1. Login
        login_res = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin1234"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Stalls GIS GeoJSON
        geojson_res = client.get("/api/v1/stalls/gis-geojson", headers=headers)
        assert geojson_res.status_code == 200
        geojson = geojson_res.json()
        assert geojson["type"] == "FeatureCollection"
        assert len(geojson["features"]) > 0
        print(f"GIS GeoJSON retrieved successfully: {len(geojson['features'])} features found.")

        # 3. Create a Booking (Step 1 in Flow: ผู้เช่ากดจองดูแผง)
        available_stall = client.get("/api/v1/stalls?status=available", headers=headers).json()[0]
        booking_data = {
            "stall_id": available_stall["id"],
            "tenant_name": "สมศรี แม่ค้าสายหวาน",
            "tenant_phone": "081-999-8888",
            "tenant_email": "somsri@gmail.com",
            "visit_date": "2026-10-25",
            "visit_time_slot": "10:00 - 12:00",
            "intended_business": "ร้านขนมไทยโบราณและทองหยอด"
        }
        create_res = client.post("/api/v1/bookings", headers=headers, json=booking_data)
        assert create_res.status_code == 201
        booking = create_res.json()
        assert booking["status"] == "pending_approval"
        print(f"Booking created: {booking['booking_number']}, Status: {booking['status']}")

        # 4. Officer Approves Booking (Step 2 in Flow: จนท. อนุมัติวันเข้าชม)
        approve_res = client.post(f"/api/v1/bookings/{booking['id']}/approve", headers=headers, json={
            "officer_notes": "อนุมัตินัดหมาย ให้เข้าชมตามเวลา"
        })
        assert approve_res.status_code == 200
        approved_booking = approve_res.json()
        assert approved_booking["status"] == "approved"
        print(f"Booking approved by officer: {approved_booking['status']}")

        # 5. Tenant Decision after Visit (Step 3 in Flow: ผู้เช่าเข้าดูแผงแล้วกดสนใจ)
        decide_res = client.post(f"/api/v1/bookings/{booking['id']}/decide", headers=headers, json={
            "decision": "interested"
        })
        assert decide_res.status_code == 200
        assert decide_res.json()["status"] == "visited"
        print(f"Tenant visited and decided: {decide_res.json()['status']}")

        # 6. Submit Lease Application (Step 4 in Flow: ยื่นคำร้องขอเช่าแผง)
        app_data = {
            "stall_id": available_stall["id"],
            "booking_id": booking["id"],
            "applicant_name": "สมศรี แม่ค้าสายหวาน",
            "applicant_id_card": "1100500998877",
            "applicant_phone": "081-999-8888",
            "applicant_email": "somsri@gmail.com",
            "applicant_address": "99/1 ซอยอารีย์ พญาไท กทม.",
            "shop_name": "หวานละมุน ขนมไทย",
            "product_type": "ขนมไทยและของหวาน",
            "requested_start_date": "2026-11-01",
            "requested_period_months": 12,
            "proposed_rent_type": "monthly"
        }
        app_res = client.post("/api/v1/applications", headers=headers, json=app_data)
        assert app_res.status_code == 201
        application = app_res.json()
        assert application["status"] == "pending_officer"
        print(f"Lease Application submitted: {application['application_number']}, Status: {application['status']}")

        # 7. Approve Application through Tiers (จนท -> ผอ.ตลาด -> ผอ.สำนักตลาด)
        # Tier 1: Officer approves
        t1_res = client.post(f"/api/v1/applications/{application['id']}/action", headers=headers, json={
            "action": "approve",
            "comment": "เจ้าหน้าที่ตรวจสอบเอกสารครบถ้วน"
        })
        assert t1_res.json()["status"] == "pending_market_director"

        # Tier 2: Market Director approves
        t2_res = client.post(f"/api/v1/applications/{application['id']}/action", headers=headers, json={
            "action": "approve",
            "comment": "ผอ.ตลาด อนุมัติคำร้อง"
        })
        assert t2_res.json()["status"] == "pending_bureau_director"

        # Tier 3: Bureau Director approves
        t3_res = client.post(f"/api/v1/applications/{application['id']}/action", headers=headers, json={
            "action": "approve",
            "comment": "ผอ.สำนักตลาด อนุมัติเรียบร้อย จัดทำสัญญาเช่าได้"
        })
        assert t3_res.json()["status"] == "approved"
        print("Application fully approved through 3 management tiers!")

        print("\n=== ALL BOOKING & GIS APPLICATION TESTS PASSED! ===")

if __name__ == "__main__":
    test_booking_and_application_workflow()
