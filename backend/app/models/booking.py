from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class StallBooking(Base):
    """
    ขั้นตอนที่ 1 & 2 ใน Flow: ผู้เช่าจองวันเข้าดูแผง -> รอเจ้าหน้าที่อนุมัติ
    """
    __tablename__ = "stall_bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. BK-2026-0001
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    
    # ข้อมูลผู้จองเข้าดูแผง
    tenant_name = Column(String(100), nullable=False)
    tenant_phone = Column(String(30), nullable=False)
    tenant_email = Column(String(100), nullable=True)
    tenant_id_card = Column(String(30), nullable=True)
    
    # นัดหมายเข้าดูแผง
    visit_date = Column(Date, nullable=False)
    visit_time_slot = Column(String(50), default="09:00 - 12:00") # 09:00-12:00, 13:00-16:00, 17:00-20:00
    intended_business = Column(String(100), nullable=True) # สินค้าหรือธุรกิจที่ต้องการขาย
    
    # สถานะตาม Flow:
    # pending_approval = รอเจ้าหน้าที่อนุมัติ
    # approved = นัดหมายสำเร็จ (จนท. อนุมัติวันเข้าชมแล้ว)
    # visited = ดูแผงแล้ว (ตัดสินใจต่อ)
    # lease_applied = ยื่นคำร้องขอเช่าแล้ว
    # rejected = ไม่อนุมัติ (จนท. ปฏิเสธ พร้อมหมายเหตุ)
    # cancelled = ยกเลิกการจอง (ไม่สนใจ หรือหมดอายุ 3 วัน)
    status = Column(String(30), default="pending_approval", index=True)
    
    officer_notes = Column(Text, nullable=True) # บันทึกเจ้าหน้าที่
    rejection_reason = Column(Text, nullable=True) # เหตุผลไม่อนุมัติ
    
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stall = relationship("Stall", back_populates="bookings")
    reviewed_by = relationship("User")
    applications = relationship("LeaseApplication", back_populates="booking")


class LeaseApplication(Base):
    """
    ขั้นตอนที่ 4 ใน Flow: ผู้เช่าดูแผงแล้วสนใจ -> ยื่นคำร้อง "ขอเช่าแผง"
    เพื่อส่งต่อให้ จนท. ตรวจสอบ -> ผอ.ตลาด -> ผอ.สำนักตลาด
    """
    __tablename__ = "lease_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. REQ-2026-0001
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("stall_bookings.id"), nullable=True)
    
    # ข้อมูลผู้ยื่นคำร้อง
    applicant_name = Column(String(100), nullable=False)
    applicant_id_card = Column(String(30), nullable=False)
    applicant_phone = Column(String(30), nullable=False)
    applicant_email = Column(String(100), nullable=True)
    applicant_address = Column(Text, nullable=True)
    
    # ข้อมูลร้านค้าและสินค้า
    shop_name = Column(String(100), nullable=False)
    product_type = Column(String(100), nullable=True)
    requested_start_date = Column(Date, nullable=False)
    requested_period_months = Column(Integer, default=12) # ระยะเวลาขอเช่า
    proposed_rent_type = Column(String(20), default="monthly") # monthly / daily
    
    # สถานะการอนุมัติคำร้องตามลำดับขั้น:
    # pending_officer = รอเจ้าหน้าที่ตรวจสอบคำร้อง
    # pending_market_director = รอ ผอ.ตลาด อนุมัติ
    # pending_bureau_director = รอ ผอ.สำนักตลาด อนุมัติ
    # approved = อนุมัติคำร้องเรียบร้อย (พร้อมส่งร่างสัญญา)
    # revision_required = ส่งคำร้องกลับแก้ไข
    # rejected = ยกเลิกคำร้อง / ไม่อนุมัติ
    status = Column(String(40), default="pending_officer", index=True)
    
    officer_comment = Column(Text, nullable=True)
    market_director_comment = Column(Text, nullable=True)
    bureau_director_comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stall = relationship("Stall", back_populates="applications")
    booking = relationship("StallBooking", back_populates="applications")
