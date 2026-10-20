from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class StallBrief(BaseModel):
    id: int
    stall_number: str
    category: str
    monthly_rate: float
    daily_rate: float
    zone_code: Optional[str] = None
    zone_name: Optional[str] = None

class ContractBase(BaseModel):
    stall_id: int
    tenant_name: str
    tenant_id_card: str
    tenant_phone: str
    tenant_email: Optional[str] = None
    tenant_address: Optional[str] = None
    business_name: str
    business_type: Optional[str] = None
    start_date: date
    end_date: date
    billing_cycle: str = "monthly"  # monthly, daily
    rental_fee: float
    security_deposit: float = 0.0
    advance_payment: float = 0.0
    terms_and_conditions: Optional[str] = None
    status: str = "active"  # active, pending, expired, terminated

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    tenant_name: Optional[str] = None
    tenant_id_card: Optional[str] = None
    tenant_phone: Optional[str] = None
    tenant_email: Optional[str] = None
    tenant_address: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    billing_cycle: Optional[str] = None
    rental_fee: Optional[float] = None
    security_deposit: Optional[float] = None
    advance_payment: Optional[float] = None
    terms_and_conditions: Optional[str] = None
    status: Optional[str] = None

class ContractResponse(ContractBase):
    id: int
    contract_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by_id: Optional[int] = None
    stall: Optional[StallBrief] = None

    class Config:
        from_attributes = True
