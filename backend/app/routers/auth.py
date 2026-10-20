from typing import List, Optional
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user, get_current_admin_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _authenticate_and_create_token(username: str, password: str, db: Session) -> Token:
    user = db.query(User).filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (Incorrect username or password)",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="บัญชีนี้ถูกปิดการใช้งาน (Account is inactive)"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    )

@router.post("/login", response_model=Token, summary="User Login via JSON")
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Standard JSON login endpoint for frontend web clients.
    Accepts JSON body: { "username": "admin", "password": "..." }
    Returns standard Bearer JWT token.
    """
    return _authenticate_and_create_token(login_data.username, login_data.password, db)

@router.post("/token", response_model=Token, summary="OAuth2 Form Login (Swagger UI compatible)")
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token endpoint for Swagger/OpenAPI interactive documentation.
    """
    return _authenticate_and_create_token(form_data.username, form_data.password, db)

@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Return currently authenticated user information from JWT token.
    """
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register User (Admin)")
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new staff or admin user. Requires admin role.
    """
    existing_user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered"
        )
        
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=user_in.is_active,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users", response_model=List[UserResponse], summary="List All Users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all staff and admin accounts.
    """
    return db.query(User).all()
