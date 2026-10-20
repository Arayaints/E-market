from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String(50), unique=True, index=True, nullable=False)
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    
    # Tenant Details
    tenant_name = Column(String(100), nullable=False)
    tenant_id_card = Column(String(30), nullable=False)
    tenant_phone = Column(String(30), nullable=False)
    tenant_email = Column(String(100), nullable=True)
    tenant_address = Column(Text, nullable=True)
    
    # Business Details
    business_name = Column(String(100), nullable=False)
    business_type = Column(String(50), nullable=True)
    
    # Lease Details
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    billing_cycle = Column(String(20), default="monthly")  # daily, monthly
    rental_fee = Column(Float, nullable=False)
    security_deposit = Column(Float, default=0.0)
    advance_payment = Column(Float, default=0.0)
    
    terms_and_conditions = Column(Text, nullable=True)
    
    # Status: active, pending, expired, terminated
    status = Column(String(30), default="active", index=True)
    
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stall = relationship("Stall", back_populates="contracts")
    created_by = relationship("User")
