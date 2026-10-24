# Persistent mock API for booking tests

Use this setup when testing the deployed frontend without real business data.

1. Start the persistent mock API:

   ```bash
   docker compose -f backend/docker/docker-compose.mock.yaml up -d --build
   ```

2. Configure the frontend environment with the public API address:

   ```env
   NUXT_PUBLIC_API_BASE=https://<mock-api-host>/api/v1
   NUXT_PUBLIC_API_URL=https://<mock-api-host>/api/v1
   ```

3. Deploy the backend first, then redeploy the frontend.

The mock service stores SQLite at `/data/emarket-test.db` in the `emarket_mock_data`
Docker volume. Booking and notification records therefore survive refreshes and API
container restarts. Admin can clear test bookings and notifications through the
existing clear-test-data action; user accounts are preserved.

The reset operation calls `POST /api/v1/bookings/clear`. It requires an Admin token
and clears only bookings, related notifications, and booking stall states. It does
not remove seeded users, markets, projects, or stalls, so the same test accounts can
start a new scenario immediately.

For a hosted test environment, expose the API with HTTPS and attach persistent disk
storage to `/data`; do not use a temporary/container filesystem for this path.

The mock API is intentionally for testing only. Do not use it for real tenant data.
