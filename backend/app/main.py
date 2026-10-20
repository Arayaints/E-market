from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.seed import seed_database
from app.routers import auth_router, stalls_router, contracts_router, dashboard_router, bookings_router, markets_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data (Admin user, Market Zones, Stalls, Contracts)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## e-Market Management System REST API (ระบบจัดการแผงเช่าตลาดและสัญญาการเช่า)
    
    API ตามมาตรฐาน REST API สำหรับระบบบริหารจัดการตลาดสด ตลาดนัด และศูนย์การค้าชุมชน
    
    ### ฟีเจอร์หลัก:
    * 🔐 **Authentication (JWT Token)**: เข้าสู่ระบบและยืนยันตัวตนด้วย Bearer JWT Token
    * 🗺️ **GIS Market Map & Stalls**: แผนที่ GIS สำหรับจัดการและกดจองแผงเช่า
    * 📅 **Stall Bookings & Approval**: ระบบจองดูแผง นัดหมายเข้าชม และการอนุมัติโดยเจ้าหน้าที่
    * 📋 **Lease Applications**: ยื่นคำร้องขอเช่าแผง และการอนุมัติตามลำดับขั้น (จนท. -> ผอ.ตลาด -> ผอ.สำนักตลาด)
    * 📝 **Rental Contracts**: จัดการสัญญาการเช่า ข้อมูลผู้เช่า เงินประกัน และรอบการชำระ
    * 📊 **Dashboard & Analytics**: สรุปภาพรวมอัตราการเช่า รายได้ และสัญญาใกล้หมดอายุ
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(stalls_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(contracts_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(markets_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System"])
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "redoc": "/redoc",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy"}
