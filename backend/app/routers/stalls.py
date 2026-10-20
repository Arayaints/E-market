import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.stall import Zone, Stall
from app.models.contract import Contract
from app.models.booking import StallBooking
from app.models.user import User
from app.schemas.stall import (
    ZoneCreate, ZoneUpdate, ZoneResponse,
    StallCreate, StallUpdate, StallResponse, ActiveContractBrief,
    GeoJsonFeatureCollection, GeoJsonFeature, GeoJsonGeometry
)
from app.core.deps import get_current_user

router = APIRouter(tags=["Market Stalls & Zones"])

# ==========================================
# Zones Endpoints
# ==========================================
@router.get("/zones", response_model=List[ZoneResponse], summary="List All Market Zones")
def list_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all zones with stall count"""
    zones = db.query(Zone).all()
    results = []
    for z in zones:
        stalls_count = db.query(Stall).filter(Stall.zone_id == z.id).count()
        results.append(
            ZoneResponse(
                id=z.id,
                code=z.code,
                name=z.name,
                color_code=z.color_code,
                description=z.description,
                created_at=z.created_at,
                stalls_count=stalls_count
            )
        )
    return results

@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED, summary="Create Market Zone")
def create_zone(
    zone_in: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Zone).filter(Zone.code == zone_in.code.upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Zone with code '{zone_in.code}' already exists"
        )
    new_zone = Zone(
        code=zone_in.code.upper(),
        name=zone_in.name,
        color_code=zone_in.color_code,
        description=zone_in.description
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)
    return ZoneResponse(
        id=new_zone.id,
        code=new_zone.code,
        name=new_zone.name,
        color_code=new_zone.color_code,
        description=new_zone.description,
        created_at=new_zone.created_at,
        stalls_count=0
    )

@router.put("/zones/{zone_id}", response_model=ZoneResponse, summary="Update Market Zone")
def update_zone(
    zone_id: int,
    zone_in: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        
    update_data = zone_in.model_dump(exclude_unset=True)
    if "code" in update_data and update_data["code"]:
        update_data["code"] = update_data["code"].upper()
        dup = db.query(Zone).filter(Zone.code == update_data["code"], Zone.id != zone_id).first()
        if dup:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone code already in use")

    for key, val in update_data.items():
        setattr(zone, key, val)

    db.commit()
    db.refresh(zone)
    stalls_count = db.query(Stall).filter(Stall.zone_id == zone.id).count()
    return ZoneResponse(
        id=zone.id,
        code=zone.code,
        name=zone.name,
        color_code=zone.color_code,
        description=zone.description,
        created_at=zone.created_at,
        stalls_count=stalls_count
    )

@router.delete("/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Market Zone")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    stalls_count = db.query(Stall).filter(Stall.zone_id == zone_id).count()
    if stalls_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete zone containing {stalls_count} stalls. Please delete or reassign stalls first."
        )
    db.delete(zone)
    db.commit()
    return None


# ==========================================
# Stalls Endpoints
# ==========================================
def _build_stall_response(stall: Stall, db: Session) -> StallResponse:
    # Find active contract if any
    active_contract = db.query(Contract).filter(
        Contract.stall_id == stall.id,
        Contract.status == "active"
    ).order_by(Contract.id.desc()).first()

    contract_brief = None
    if active_contract:
        contract_brief = ActiveContractBrief(
            id=active_contract.id,
            contract_number=active_contract.contract_number,
            tenant_name=active_contract.tenant_name,
            tenant_phone=active_contract.tenant_phone,
            business_name=active_contract.business_name,
            start_date=str(active_contract.start_date),
            end_date=str(active_contract.end_date),
            status=active_contract.status
        )

    # Check active booking for this stall
    active_booking = db.query(StallBooking).filter(
        StallBooking.stall_id == stall.id,
        StallBooking.status.in_(["pending_approval", "approved", "visited"])
    ).order_by(StallBooking.id.desc()).first()

    zone_res = None
    if stall.zone:
        zone_res = ZoneResponse(
            id=stall.zone.id,
            code=stall.zone.code,
            name=stall.zone.name,
            color_code=stall.zone.color_code,
            description=stall.zone.description,
            created_at=stall.zone.created_at,
            stalls_count=0
        )

    return StallResponse(
        id=stall.id,
        stall_number=stall.stall_number,
        zone_id=stall.zone_id,
        size_width=stall.size_width,
        size_length=stall.size_length,
        area_sqm=stall.area_sqm,
        daily_rate=stall.daily_rate,
        monthly_rate=stall.monthly_rate,
        status=stall.status,
        category=stall.category,
        electricity_meter=stall.electricity_meter,
        water_meter=stall.water_meter,
        description=stall.description,
        position_x=stall.position_x,
        position_y=stall.position_y,
        lat=stall.lat,
        lng=stall.lng,
        polygon_geojson=stall.polygon_geojson,
        created_at=stall.created_at,
        updated_at=stall.updated_at,
        zone=zone_res,
        active_contract=contract_brief,
        has_active_booking=bool(active_booking),
        active_booking_id=active_booking.id if active_booking else None,
        active_booking_number=active_booking.booking_number if active_booking else None,
        active_booking_status=active_booking.status if active_booking else None
    )

@router.get("/stalls", response_model=List[StallResponse], summary="List All Stalls with Filters")
def list_stalls(
    zone_id: Optional[int] = Query(None, description="Filter by zone ID"),
    status: Optional[str] = Query(None, description="Filter by status (available, occupied, reserved, maintenance)"),
    category: Optional[str] = Query(None, description="Filter by stall category"),
    search: Optional[str] = Query(None, description="Search stall number or description"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Stall)
    
    if zone_id:
        query = query.filter(Stall.zone_id == zone_id)
    if status:
        query = query.filter(Stall.status == status)
    if category:
        query = query.filter(Stall.category == category)
    if search:
        query = query.filter(
            or_(
                Stall.stall_number.ilike(f"%{search}%"),
                Stall.description.ilike(f"%{search}%"),
                Stall.category.ilike(f"%{search}%")
            )
        )
        
    stalls = query.order_by(Stall.stall_number.asc()).all()
    return [_build_stall_response(s, db) for s in stalls]


@router.get("/stalls/gis-geojson", summary="Get Stalls as GeoJSON for GIS Map")
def get_stalls_geojson(
    zone_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns valid GeoJSON FeatureCollection with polygon boundaries
    and properties for Leaflet GIS rendering.
    """
    query = db.query(Stall)
    if zone_id:
        query = query.filter(Stall.zone_id == zone_id)
    if status:
        query = query.filter(Stall.status == status)
        
    stalls = query.all()
    features = []

    for s in stalls:
        # Check active booking
        active_booking = db.query(StallBooking).filter(
            StallBooking.stall_id == s.id,
            StallBooking.status.in_(["pending_approval", "approved", "visited"])
        ).order_by(StallBooking.id.desc()).first()

        # Construct GeoJSON polygon
        coords = None
        if s.polygon_geojson:
            try:
                coords = json.loads(s.polygon_geojson)
            except Exception:
                coords = None

        if not coords:
            # Default ~3m box around lat/lng (0.00003 deg approx 3.3 meters)
            lat = s.lat or 13.7998
            lng = s.lng or 100.5501
            d_lat = 0.00003 * (s.size_length / 3.0)
            d_lng = 0.00003 * (s.size_width / 2.5)
            coords = [[
                [lng - d_lng, lat - d_lat],
                [lng + d_lng, lat - d_lat],
                [lng + d_lng, lat + d_lat],
                [lng - d_lng, lat + d_lat],
                [lng - d_lng, lat - d_lat]
            ]]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": coords
            },
            "properties": {
                "id": s.id,
                "stall_number": s.stall_number,
                "zone_id": s.zone_id,
                "zone_code": s.zone.code if s.zone else "",
                "zone_name": s.zone.name if s.zone else "",
                "zone_color": s.zone.color_code if s.zone else "#3B82F6",
                "category": s.category,
                "status": s.status,
                "size_width": s.size_width,
                "size_length": s.size_length,
                "area_sqm": s.area_sqm,
                "daily_rate": s.daily_rate,
                "monthly_rate": s.monthly_rate,
                "lat": s.lat,
                "lng": s.lng,
                "has_active_booking": bool(active_booking),
                "active_booking_id": active_booking.id if active_booking else None,
                "active_booking_status": active_booking.status if active_booking else None,
                "active_booking_number": active_booking.booking_number if active_booking else None
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "market_center": [13.7998, 100.5501],
        "features": features
    }


@router.get("/stalls/{stall_id}", response_model=StallResponse, summary="Get Single Stall Detail")
def get_stall(
    stall_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
    return _build_stall_response(stall, db)

@router.post("/stalls", response_model=StallResponse, status_code=status.HTTP_201_CREATED, summary="Create New Stall")
def create_stall(
    stall_in: StallCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Stall).filter(Stall.stall_number == stall_in.stall_number.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"แผงเช่าเลขที่ '{stall_in.stall_number}' มีอยู่แล้วในระบบ"
        )
        
    zone = db.query(Zone).filter(Zone.id == stall_in.zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid zone_id")

    area = round(stall_in.size_width * stall_in.size_length, 2)
    new_stall = Stall(
        stall_number=stall_in.stall_number.strip().upper(),
        zone_id=stall_in.zone_id,
        size_width=stall_in.size_width,
        size_length=stall_in.size_length,
        area_sqm=area,
        daily_rate=stall_in.daily_rate,
        monthly_rate=stall_in.monthly_rate,
        status=stall_in.status or "available",
        category=stall_in.category,
        electricity_meter=stall_in.electricity_meter,
        water_meter=stall_in.water_meter,
        description=stall_in.description,
        position_x=stall_in.position_x,
        position_y=stall_in.position_y,
        lat=stall_in.lat or 13.7998,
        lng=stall_in.lng or 100.5501,
        polygon_geojson=stall_in.polygon_geojson
    )
    db.add(new_stall)
    db.commit()
    db.refresh(new_stall)
    return _build_stall_response(new_stall, db)

@router.put("/stalls/{stall_id}", response_model=StallResponse, summary="Update Stall Information")
def update_stall(
    stall_id: int,
    stall_in: StallUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
        
    update_data = stall_in.model_dump(exclude_unset=True)
    if "stall_number" in update_data and update_data["stall_number"]:
        update_data["stall_number"] = update_data["stall_number"].strip().upper()
        dup = db.query(Stall).filter(Stall.stall_number == update_data["stall_number"], Stall.id != stall_id).first()
        if dup:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="เลขที่แผงนี้ซ้ำกับแผงอื่นในระบบ")

    width = update_data.get("size_width", stall.size_width)
    length = update_data.get("size_length", stall.size_length)
    if "size_width" in update_data or "size_length" in update_data:
        update_data["area_sqm"] = round(width * length, 2)

    for key, val in update_data.items():
        setattr(stall, key, val)

    db.commit()
    db.refresh(stall)
    return _build_stall_response(stall, db)

@router.delete("/stalls/{stall_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Stall")
def delete_stall(
    stall_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stall not found")
        
    active_contract = db.query(Contract).filter(
        Contract.stall_id == stall_id,
        Contract.status == "active"
    ).first()
    if active_contract:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ไม่สามารถลบแผงที่มีสัญญาเช่าที่ยังเปิดใช้งานอยู่ได้"
        )
        
    db.delete(stall)
    db.commit()
    return None
