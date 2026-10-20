from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stall import Zone, Stall
from app.models.contract import Contract
from app.models.user import User
from app.schemas.dashboard import DashboardStats, ZoneOccupancy
from app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/stats", response_model=DashboardStats, summary="Get Overview Dashboard Metrics")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_stalls = db.query(Stall).count()
    available_stalls = db.query(Stall).filter(Stall.status == "available").count()
    occupied_stalls = db.query(Stall).filter(Stall.status == "occupied").count()
    reserved_stalls = db.query(Stall).filter(Stall.status == "reserved").count()
    maintenance_stalls = db.query(Stall).filter(Stall.status == "maintenance").count()

    occupancy_rate = 0.0
    if total_stalls > 0:
        occupancy_rate = round((occupied_stalls / total_stalls) * 100, 1)

    active_contracts = db.query(Contract).filter(Contract.status == "active").all()
    total_active_contracts = len(active_contracts)

    monthly_revenue = 0.0
    security_deposits = 0.0
    for c in active_contracts:
        security_deposits += (c.security_deposit or 0.0)
        if c.billing_cycle == "monthly":
            monthly_revenue += (c.rental_fee or 0.0)
        elif c.billing_cycle == "daily":
            monthly_revenue += (c.rental_fee or 0.0) * 30

    # Expiring within 30 days
    today = date.today()
    in_30_days = today + timedelta(days=30)
    expiring_soon_count = db.query(Contract).filter(
        Contract.status == "active",
        Contract.end_date >= today,
        Contract.end_date <= in_30_days
    ).count()

    # Breakdown by zones
    zones = db.query(Zone).all()
    zones_breakdown = []
    for z in zones:
        z_total = db.query(Stall).filter(Stall.zone_id == z.id).count()
        z_occupied = db.query(Stall).filter(Stall.zone_id == z.id, Stall.status == "occupied").count()
        z_avail = db.query(Stall).filter(Stall.zone_id == z.id, Stall.status == "available").count()
        z_rate = round((z_occupied / z_total * 100), 1) if z_total > 0 else 0.0
        
        zones_breakdown.append(
            ZoneOccupancy(
                zone_id=z.id,
                zone_code=z.code,
                zone_name=z.name,
                color_code=z.color_code,
                total_stalls=z_total,
                occupied_stalls=z_occupied,
                available_stalls=z_avail,
                occupancy_rate=z_rate
            )
        )

    return DashboardStats(
        total_stalls=total_stalls,
        available_stalls=available_stalls,
        occupied_stalls=occupied_stalls,
        reserved_stalls=reserved_stalls,
        maintenance_stalls=maintenance_stalls,
        occupancy_rate=occupancy_rate,
        total_active_contracts=total_active_contracts,
        estimated_monthly_revenue=round(monthly_revenue, 2),
        total_security_deposits=round(security_deposits, 2),
        expiring_soon_count=expiring_soon_count,
        zones_breakdown=zones_breakdown
    )
