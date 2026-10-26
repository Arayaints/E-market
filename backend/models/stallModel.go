package models

import "time"

type Stall struct {
	ID                 int       `gorm:"primaryKey;autoIncrement" json:"id"`
	MarketID           int       `gorm:"column:market_id;index" json:"market_id"`
	MarketSlug         string    `gorm:"size:100;column:market_slug;index" json:"market_slug"`
	MarketName         string    `gorm:"size:255;column:market_name" json:"market_name"`
	ZoneID             int       `gorm:"column:zone_id;index" json:"zone_id"`
	ZoneName           string    `gorm:"size:255;column:zone_name" json:"zone_name"`
	ProjectName        string    `gorm:"size:255;column:project_name" json:"project_name"`
	Ident              string    `gorm:"size:50;unique;not null;column:ident" json:"ident"`
	Name               string    `gorm:"size:255;column:name" json:"name"`
	Description        string    `gorm:"type:text;column:description" json:"description"`
	Category           string    `gorm:"size:100;column:category" json:"category"`
	Width              float64   `gorm:"column:width" json:"width"`
	Depth              float64   `gorm:"column:depth" json:"depth"`
	AreaSqm            float64   `gorm:"column:area_sqm" json:"area_sqm"`
	DailyRent          float64   `gorm:"column:daily_rent" json:"daily_rent"`
	MonthlyRent        float64   `gorm:"column:monthly_rent" json:"monthly_rent"`
	StallStatus        string    `gorm:"size:50;default:'available';column:stall_status" json:"stall_status"`
	Floor              string    `gorm:"size:20;default:'1';column:floor" json:"floor"`
	CoordinatesGeoJSON string    `gorm:"type:text;column:coordinates_geojson" json:"coordinates_geojson"`
	Published          bool      `gorm:"default:false;column:published" json:"published"`
	Status             string    `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedBy          *int      `gorm:"column:created_by" json:"created_by"`
	UpdatedBy          *int      `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt          time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Stall) TableName() string {
	return "stall"
}

type StallAuditLog struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	StallID   int       `gorm:"column:stall_id;index;not null" json:"stall_id"`
	Action    string    `gorm:"size:50;column:action;not null" json:"action"`
	Changes   string    `gorm:"type:text;column:changes" json:"changes"`
	ActorID   *int      `gorm:"column:actor_id;index" json:"actor_id"`
	ActorName string    `gorm:"size:255;column:actor_name" json:"actor_name"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
}

func (StallAuditLog) TableName() string { return "stall_audit_log" }
