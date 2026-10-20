from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel

# --- Stall Booking Schemas ---
class StallBookingBase(BaseModel):
    stall_id: int
    tenant_name: str
    tenant_phone: str
    tenant_email: Optional[str] = None
    tenant_id_card: Optional[str] = None
    visit_date: date
    visit_time_slot: str = "09:00 - 12:00"
    intended_business: Optional[str] = None

class StallBookingCreate(StallBookingBase):
    pass

class StallBookingApprove(BaseModel):
    officer_notes: Optional[str] = "อนุมัตินัดหมายเข้าชมแผงตามวันเวลาที่ขอ"

class StallBookingReject(BaseModel):
    rejection_reason: str

class StallBookingDecide(BaseModel):
    decision: str  # "interested" or "not_interested"

class StallBookingResponse(StallBookingBase):
    id: int
    booking_number: str
    status: str
    officer_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Stall Brief details
    stall_number: Optional[str] = None
    stall_category: Optional[str] = None
    stall_zone_name: Optional[str] = None
    stall_monthly_rate: Optional[float] = None
    stall_lat: Optional[float] = None
    stall_lng: Optional[float] = None

    class Config:
        from_attributes = True


# --- Waiting List & Queue Schemas (PDPA-Compliant) ---
class StallWaitingQueueItem(BaseModel):
    queue_number: int
    booking_number: str
    masked_name: str
    masked_phone: str
    visit_date: Optional[date] = None
    visit_time_slot: Optional[str] = None
    status: str
    status_label: str
    created_at: Optional[datetime] = None
    days_left_estimate: int = 2

class StallWaitingQueueResponse(BaseModel):
    stall_id: Optional[int] = None
    stall_number: str
    total_waiting_count: int
    next_queue_number: int
    has_waiting_list: bool
    current_booker: Optional[StallWaitingQueueItem] = None
    queues: List[StallWaitingQueueItem] = []


# --- Lease Application Schemas ---
class LeaseApplicationCreate(BaseModel):
    stall_id: int
    booking_id: Optional[int] = None
    applicant_name: str
    applicant_id_card: str
    applicant_phone: str
    applicant_email: Optional[str] = None
    applicant_address: Optional[str] = None
    shop_name: str
    product_type: Optional[str] = None
    requested_start_date: date
    requested_period_months: int = 12
    proposed_rent_type: str = "monthly"

class LeaseApplicationApprovalAction(BaseModel):
    action: str  # "approve", "reject", "request_revision"
    comment: Optional[str] = None

class LeaseApplicationResponse(BaseModel):
    id: int
    application_number: str
    stall_id: int
    booking_id: Optional[int] = None
    applicant_name: str
    applicant_id_card: str
    applicant_phone: str
    applicant_email: Optional[str] = None
    applicant_address: Optional[str] = None
    shop_name: str
    product_type: Optional[str] = None
    requested_start_date: date
    requested_period_months: int
    proposed_rent_type: str
    status: str
    officer_comment: Optional[str] = None
    market_director_comment: Optional[str] = None
    bureau_director_comment: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    stall_number: Optional[str] = None
    stall_zone_name: Optional[str] = None
    stall_monthly_rate: Optional[float] = None

    class Config:
        from_attributes = True
