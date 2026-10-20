from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    color_code = Column(String(20), default="#3B82F6")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    stalls = relationship("Stall", back_populates="zone", cascade="all, delete-orphan")


class Stall(Base):
    __tablename__ = "stalls"

    id = Column(Integer, primary_key=True, index=True)
    stall_number = Column(String(20), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    
    size_width = Column(Float, default=2.5)   # meters
    size_length = Column(Float, default=3.0)  # meters
    area_sqm = Column(Float, default=7.5)     # calculated width * length
    
    daily_rate = Column(Float, default=150.0)    # THB per day
    monthly_rate = Column(Float, default=4000.0) # THB per month
    
    # Status: available, occupied, reserved, maintenance
    status = Column(String(30), default="available", index=True)
    
    category = Column(String(50), default="อาหารปรุงสุก")  # e.g. อาหาร, ผักผลไม้, เสื้อผ้า, เครื่องดื่ม
    electricity_meter = Column(String(50), nullable=True)
    water_meter = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    
    # Grid Position
    position_x = Column(Integer, default=1)
    position_y = Column(Integer, default=1)
    
    # Real GIS Coordinates (Latitude, Longitude & GeoJSON Polygon Bounds)
    lat = Column(Float, default=13.7998)
    lng = Column(Float, default=100.5501)
    polygon_geojson = Column(Text, nullable=True)  # JSON string of [[lng, lat], ...]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    zone = relationship("Zone", back_populates="stalls")
    contracts = relationship("Contract", back_populates="stall")
    bookings = relationship("StallBooking", back_populates="stall")
    applications = relationship("LeaseApplication", back_populates="stall")
