package models

import "time"

// MarketGISConfig keeps the editable GIS workspace separate from the public
// market profile. ProjectsJSON and FacilitiesJSON are GeoJSON-compatible JSON.
type MarketGISConfig struct {
	ID             int       `gorm:"primaryKey;autoIncrement" json:"id"`
	MarketID       int       `gorm:"column:market_id;uniqueIndex;not null" json:"market_id"`
	ProjectsJSON   string    `gorm:"type:text;column:projects_json" json:"-"`
	FacilitiesJSON string    `gorm:"type:text;column:facilities_json" json:"-"`
	Published      bool      `gorm:"default:false;column:published" json:"published"`
	CreatedBy      *int      `gorm:"column:created_by" json:"created_by"`
	UpdatedBy      *int      `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt      time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt      time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (MarketGISConfig) TableName() string { return "market_gis_config" }
