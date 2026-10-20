from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# --- Zone Schemas ---
class ZoneBase(BaseModel):
    code: str
    name: str
    color_code: str = "#3B82F6"
    description: Optional[str] = None

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    color_code: Optional[str] = None
    description: Optional[str] = None

class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime
    stalls_count: Optional[int] = 0

    class Config:
        from_attributes = True


# --- Stall Schemas ---
class StallBase(BaseModel):
    stall_number: str
    zone_id: int
    size_width: float = 2.5
    size_length: float = 3.0
    area_sqm: Optional[float] = 7.5
    daily_rate: float = 150.0
    monthly_rate: float = 4000.0
    status: str = "available"  # available, occupied, reserved, maintenance
    category: str = "อาหารปรุงสุก"
    electricity_meter: Optional[str] = None
    water_meter: Optional[str] = None
    description: Optional[str] = None
    position_x: int = 1
    position_y: int = 1
    lat: Optional[float] = 13.7998
    lng: Optional[float] = 100.5501
    polygon_geojson: Optional[str] = None

class StallCreate(StallBase):
    pass

class StallUpdate(BaseModel):
    stall_number: Optional[str] = None
    zone_id: Optional[int] = None
    size_width: Optional[float] = None
    size_length: Optional[float] = None
    area_sqm: Optional[float] = None
    daily_rate: Optional[float] = None
    monthly_rate: Optional[float] = None
    status: Optional[str] = None
    category: Optional[str] = None
    electricity_meter: Optional[str] = None
    water_meter: Optional[str] = None
    description: Optional[str] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    polygon_geojson: Optional[str] = None

class ActiveContractBrief(BaseModel):
    id: int
    contract_number: str
    tenant_name: str
    tenant_phone: str
    business_name: str
    start_date: str
    end_date: str
    status: str

class StallResponse(StallBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    zone: Optional[ZoneResponse] = None
    active_contract: Optional[ActiveContractBrief] = None
    has_active_booking: Optional[bool] = False
    active_booking_id: Optional[int] = None
    active_booking_number: Optional[str] = None
    active_booking_status: Optional[str] = None

    class Config:
        from_attributes = True

# --- GIS / GeoJSON Schemas ---
class GeoJsonGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class GeoJsonFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJsonGeometry
    properties: Dict[str, Any]

class GeoJsonFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJsonFeature]
