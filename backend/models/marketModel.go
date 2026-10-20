package models

import "time"

type Market struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"size:255;not null;column:name" json:"name"`
	Code        string    `gorm:"size:50;unique;not null;column:code" json:"code"`
	Location    string    `gorm:"size:255;column:location" json:"location"`
	Latitude    float64   `gorm:"type:decimal(10,7);column:latitude" json:"latitude"`
	Longitude   float64   `gorm:"type:decimal(10,7);column:longitude" json:"longitude"`
	TotalStalls int       `gorm:"default:0;column:total_stalls" json:"total_stalls"`
	Description string    `gorm:"type:text;column:description" json:"description"`
	Status      string    `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Market) TableName() string {
	return "market"
}

type Zone struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	MarketID    int       `gorm:"not null;column:market_id" json:"market_id"`
	Name        string    `gorm:"size:255;not null;column:name" json:"name"`
	Code        string    `gorm:"size:50;not null;column:code" json:"code"`
	Color       string    `gorm:"size:50;column:color" json:"color"`
	TotalStalls int       `gorm:"default:0;column:total_stalls" json:"total_stalls"`
	Status      string    `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Zone) TableName() string {
	return "zone"
}
