from fastapi.testclient import TestClient
from app.main import app

def test_full_api():
    with TestClient(app) as client:
        print("--- 1. Testing System Root & Health ---")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print("Root response:", res.json())

        print("\n--- 2. Testing Auth Login ---")
        login_res = client.post("/api/v1/auth/login", json={"username": "admin", "password": "admin1234"})
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        token = data["access_token"]
        print("JWT Token acquired successfully. Token type:", data["token_type"])
        headers = {"Authorization": f"Bearer {token}"}

        print("\n--- 3. Testing Auth Me ---")
        me_res = client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200, f"Me failed: {me_res.text}"
        print("Authenticated user:", me_res.json()["full_name"], "(Role:", me_res.json()["role"], ")")

        print("\n--- 4. Testing Dashboard Stats ---")
        stats_res = client.get("/api/v1/dashboard/stats", headers=headers)
        assert stats_res.status_code == 200, f"Stats failed: {stats_res.text}"
        stats = stats_res.json()
        print(f"Total Stalls: {stats['total_stalls']}, Occupied: {stats['occupied_stalls']}, Occupancy: {stats['occupancy_rate']}%")
        print(f"Active Contracts: {stats['total_active_contracts']}, Monthly Revenue: ฿{stats['estimated_monthly_revenue']:,}")

        print("\n--- 5. Testing Zones List ---")
        zones_res = client.get("/api/v1/zones", headers=headers)
        assert zones_res.status_code == 200, f"Zones failed: {zones_res.text}"
        zones = zones_res.json()
        print(f"Retrieved {len(zones)} zones")

        print("\n--- 6. Testing Stalls List & Filter ---")
        stalls_res = client.get("/api/v1/stalls", headers=headers)
        assert stalls_res.status_code == 200, f"Stalls failed: {stalls_res.text}"
        stalls = stalls_res.json()
        print(f"Retrieved {len(stalls)} stalls. Sample stall:", stalls[0]["stall_number"], "Status:", stalls[0]["status"])

        print("\n--- 7. Testing Contracts List ---")
        contracts_res = client.get("/api/v1/contracts", headers=headers)
        assert contracts_res.status_code == 200, f"Contracts failed: {contracts_res.text}"
        contracts = contracts_res.json()
        print(f"Retrieved {len(contracts)} contracts. Sample contract:", contracts[0]["contract_number"], "Tenant:", contracts[0]["tenant_name"])

        print("\n--- 8. Testing Create Stall & Contract Workflow ---")
        zone_id = zones[0]["id"]
        new_stall_res = client.post("/api/v1/stalls", headers=headers, json={
            "stall_number": "A-99",
            "zone_id": zone_id,
            "size_width": 3.0,
            "size_length": 3.0,
            "daily_rate": 200,
            "monthly_rate": 5000,
            "category": "ผักและผลไม้",
            "description": "แผงทดสอบระบบ"
        })
        assert new_stall_res.status_code == 201, f"Create stall failed: {new_stall_res.text}"
        new_stall = new_stall_res.json()
        print("Created test stall:", new_stall["stall_number"], "ID:", new_stall["id"])

        # Create Contract for this stall
        new_contract_res = client.post("/api/v1/contracts", headers=headers, json={
            "stall_id": new_stall["id"],
            "tenant_name": "ทดสอบ ผู้เช่าใหม่",
            "tenant_id_card": "1234567890123",
            "tenant_phone": "089-999-9999",
            "tenant_email": "test@tenant.com",
            "business_name": "ร้านทดสอบ",
            "start_date": "2026-10-01",
            "end_date": "2027-09-30",
            "billing_cycle": "monthly",
            "rental_fee": 5000,
            "security_deposit": 10000,
            "status": "active"
        })
        assert new_contract_res.status_code == 201, f"Create contract failed: {new_contract_res.text}"
        new_contract = new_contract_res.json()
        print("Created test contract:", new_contract["contract_number"], "Stall status updated to:", new_contract["status"])

        # Verify stall is now occupied
        check_stall = client.get(f"/api/v1/stalls/{new_stall['id']}", headers=headers).json()
        assert check_stall["status"] == "occupied"
        print("Stall status automatically synchronized to:", check_stall["status"])

        # Terminate contract
        term_res = client.post(f"/api/v1/contracts/{new_contract['id']}/terminate", headers=headers)
        assert term_res.status_code == 200
        print("Contract terminated successfully.")

        # Verify stall is back to available
        check_stall2 = client.get(f"/api/v1/stalls/{new_stall['id']}", headers=headers).json()
        assert check_stall2["status"] == "available"
        print("Stall status automatically reverted to:", check_stall2["status"])

        # Cleanup test contract & stall
        client.delete(f"/api/v1/contracts/{new_contract['id']}", headers=headers)
        client.delete(f"/api/v1/stalls/{new_stall['id']}", headers=headers)
        print("Cleaned up test records successfully.")

        print("\n=== ALL FASTAPI BACKEND REST TESTS PASSED! ===")

if __name__ == "__main__":
    test_full_api()
