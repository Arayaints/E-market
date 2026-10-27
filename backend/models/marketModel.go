package models

import "time"

type Market struct {
	ID                   int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug                 string    `gorm:"size:100;unique;not null;column:slug" json:"slug"`
	Name                 string    `gorm:"size:255;not null;column:name" json:"name"`
	NameEn               string    `gorm:"size:255;column:name_en" json:"name_en"`
	Code                 string    `gorm:"size:50;unique;not null;column:code" json:"code"`
	Location             string    `gorm:"size:255;column:location" json:"location"`
	Address              string    `gorm:"type:text;column:address" json:"address"`
	District             string    `gorm:"size:100;column:district" json:"district"`
	Latitude             float64   `gorm:"type:decimal(10,7);column:latitude" json:"latitude"`
	Longitude            float64   `gorm:"type:decimal(10,7);column:longitude" json:"longitude"`
	Lat                  float64   `gorm:"type:decimal(10,7);column:lat" json:"lat"`
	Lng                  float64   `gorm:"type:decimal(10,7);column:lng" json:"lng"`
	TotalStalls          int       `gorm:"default:0;column:total_stalls" json:"total_stalls"`
	AvailableStalls      int       `gorm:"default:0;column:available_stalls" json:"available_stalls"`
	OccupiedStalls       int       `gorm:"default:0;column:occupied_stalls" json:"occupied_stalls"`
	ReservedStalls       int       `gorm:"default:0;column:reserved_stalls" json:"reserved_stalls"`
	StartingPriceDaily   float64   `gorm:"column:starting_price_daily;default:0" json:"starting_price_daily"`
	StartingPriceMonthly float64   `gorm:"column:starting_price_monthly;default:0" json:"starting_price_monthly"`
	ImageUrl             string    `gorm:"size:500;column:image_url" json:"image_url"`
	Category             string    `gorm:"size:100;column:category" json:"category"`
	OperatingHours               string    `gorm:"size:255;column:operating_hours" json:"operating_hours"`
	Description                  string    `gorm:"type:text;column:description" json:"description"`
	Status                       string    `gorm:"size:50;default:'open';column:status" json:"status"`
	LeaseApplicationDeadlineDays int       `gorm:"default:3;column:lease_application_deadline_days" json:"lease_application_deadline_days"`
	WaitlistOfferHours           int       `gorm:"default:48;column:waitlist_offer_hours" json:"waitlist_offer_hours"`
	CreatedAt                    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt            time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
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

