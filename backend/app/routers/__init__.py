from app.routers.auth import router as auth_router
from app.routers.stalls import router as stalls_router
from app.routers.contracts import router as contracts_router
from app.routers.dashboard import router as dashboard_router
from app.routers.bookings import router as bookings_router
from app.routers.markets import router as markets_router

__all__ = ["auth_router", "stalls_router", "contracts_router", "dashboard_router", "bookings_router", "markets_router"]

