from typing import List, Dict, Any
from pydantic import BaseModel

class ZoneOccupancy(BaseModel):
    zone_id: int
    zone_code: str
    zone_name: str
    color_code: str
    total_stalls: int
    occupied_stalls: int
    available_stalls: int
    occupancy_rate: float

class DashboardStats(BaseModel):
    total_stalls: int
    available_stalls: int
    occupied_stalls: int
    reserved_stalls: int
    maintenance_stalls: int
    occupancy_rate: float
    total_active_contracts: int
    estimated_monthly_revenue: float
    total_security_deposits: float
    expiring_soon_count: int  # contracts expiring within 30 days
    zones_breakdown: List[ZoneOccupancy]
