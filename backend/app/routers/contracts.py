from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.contract import Contract
from app.models.stall import Stall
from app.models.user import User
from app.schemas.contract import (
    ContractCreate, ContractUpdate, ContractResponse, StallBrief
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/contracts", tags=["Rental Contracts"])

def _build_contract_response(contract: Contract) -> ContractResponse:
    stall_brief = None
    if contract.stall:
        stall_brief = StallBrief(
            id=contract.stall.id,
            stall_number=contract.stall.stall_number,
            category=contract.stall.category,
            monthly_rate=contract.stall.monthly_rate,
            daily_rate=contract.stall.daily_rate,
            zone_code=contract.stall.zone.code if contract.stall.zone else None,
            zone_name=contract.stall.zone.name if contract.stall.zone else None
        )
    return ContractResponse(
        id=contract.id,
        contract_number=contract.contract_number,
        stall_id=contract.stall_id,
        tenant_name=contract.tenant_name,
        tenant_id_card=contract.tenant_id_card,
        tenant_phone=contract.tenant_phone,
        tenant_email=contract.tenant_email,
        tenant_address=contract.tenant_address,
        business_name=contract.business_name,
        business_type=contract.business_type,
        start_date=contract.start_date,
        end_date=contract.end_date,
        billing_cycle=contract.billing_cycle,
        rental_fee=contract.rental_fee,
        security_deposit=contract.security_deposit,
        advance_payment=contract.advance_payment,
        terms_and_conditions=contract.terms_and_conditions,
        status=contract.status,
        created_by_id=contract.created_by_id,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
        stall=stall_brief
    )

@router.get("", response_model=List[ContractResponse], summary="List Rental Contracts")
def list_contracts(
    status: Optional[str] = Query(None, description="Filter by status (active, pending, expired, terminated)"),
    stall_id: Optional[int] = Query(None, description="Filter by stall ID"),
    search: Optional[str] = Query(None, description="Search by tenant name, phone, or contract number"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Contract)
    if status:
        query = query.filter(Contract.status == status)
    if stall_id:
        query = query.filter(Contract.stall_id == stall_id)
    if search:
        query = query.filter(
            or_(
                Contract.contract_number.ilike(f"%{search}%"),
                Contract.tenant_name.ilike(f"%{search}%"),
                Contract.tenant_phone.ilike(f"%{search}%"),
                Contract.business_name.ilike(f"%{search}%")
            )
        )
    contracts = query.order_by(Contract.id.desc()).all()
    return [_build_contract_response(c) for c in contracts]

@router.get("/{contract_id}", response_model=ContractResponse, summary="Get Single Contract Detail")
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ไม่พบข้อมูลสัญญาเช่านี้")
    return _build_contract_response(contract)

@router.post("", response_model=ContractResponse, status_code=status.HTTP_201_CREATED, summary="Create Rental Contract")
def create_contract(
    contract_in: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify stall exists
    stall = db.query(Stall).filter(Stall.id == contract_in.stall_id).first()
    if not stall:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ไม่พบรหัสแผงเช่าที่ระบุ")

    # Check if stall already has an active contract
    existing_active = db.query(Contract).filter(
        Contract.stall_id == contract_in.stall_id,
        Contract.status == "active"
    ).first()
    if existing_active and contract_in.status == "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"แผงเช่า {stall.stall_number} มีสัญญาใช้งานอยู่แล้ว (เลขที่ {existing_active.contract_number})"
        )

    # Generate sequential contract number: CNT-YYYY-XXXX
    year = datetime.utcnow().year
    count_this_year = db.query(Contract).filter(
        Contract.contract_number.like(f"CNT-{year}-%")
    ).count() + 1
    generated_number = f"CNT-{year}-{count_this_year:04d}"

    new_contract = Contract(
        contract_number=generated_number,
        stall_id=contract_in.stall_id,
        tenant_name=contract_in.tenant_name.strip(),
        tenant_id_card=contract_in.tenant_id_card.strip(),
        tenant_phone=contract_in.tenant_phone.strip(),
        tenant_email=contract_in.tenant_email.strip() if contract_in.tenant_email else None,
        tenant_address=contract_in.tenant_address,
        business_name=contract_in.business_name.strip(),
        business_type=contract_in.business_type,
        start_date=contract_in.start_date,
        end_date=contract_in.end_date,
        billing_cycle=contract_in.billing_cycle,
        rental_fee=contract_in.rental_fee,
        security_deposit=contract_in.security_deposit,
        advance_payment=contract_in.advance_payment,
        terms_and_conditions=contract_in.terms_and_conditions,
        status=contract_in.status,
        created_by_id=current_user.id
    )
    db.add(new_contract)
    
    # Automatically update stall status to occupied if active
    if contract_in.status == "active":
        stall.status = "occupied"
    elif contract_in.status == "pending":
        stall.status = "reserved"

    db.commit()
    db.refresh(new_contract)
    return _build_contract_response(new_contract)

@router.put("/{contract_id}", response_model=ContractResponse, summary="Update Rental Contract")
def update_contract(
    contract_id: int,
    contract_in: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ไม่พบข้อมูลสัญญาเช่านี้")
        
    old_status = contract.status
    update_data = contract_in.model_dump(exclude_unset=True)
    
    for key, val in update_data.items():
        setattr(contract, key, val)

    # Sync stall status if contract status changed
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status in ["expired", "terminated"]:
            # Check if there are other active contracts
            other_active = db.query(Contract).filter(
                Contract.stall_id == contract.stall_id,
                Contract.id != contract.id,
                Contract.status == "active"
            ).first()
            if not other_active and contract.stall:
                contract.stall.status = "available"
        elif new_status == "active" and contract.stall:
            contract.stall.status = "occupied"

    db.commit()
    db.refresh(contract)
    return _build_contract_response(contract)

@router.post("/{contract_id}/terminate", response_model=ContractResponse, summary="Terminate Contract Early")
def terminate_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ไม่พบข้อมูลสัญญาเช่านี้")
        
    contract.status = "terminated"
    contract.end_date = date.today()
    if contract.stall:
        contract.stall.status = "available"
        
    db.commit()
    db.refresh(contract)
    return _build_contract_response(contract)

@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Contract")
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
        
    stall = contract.stall
    db.delete(contract)
    db.commit()
    
    # If the stall has no more active contracts, reset to available
    if stall:
        has_active = db.query(Contract).filter(Contract.stall_id == stall.id, Contract.status == "active").count() > 0
        if not has_active and stall.status == "occupied":
            stall.status = "available"
            db.commit()

    return None
