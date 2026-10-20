package models

import "time"

type Application struct {
	ID               int        `gorm:"primaryKey;autoIncrement" json:"id"`
	ApplicationNo    string     `gorm:"size:50;unique;not null;column:application_no" json:"application_no"`
	StallID          *int       `gorm:"column:stall_id" json:"stall_id"`
	StallIdent       string     `gorm:"size:50;not null;column:stall_ident" json:"stall_ident"`
	ApplicantName    string     `gorm:"size:255;not null;column:applicant_name" json:"applicant_name"`
	ApplicantPhone   string     `gorm:"size:50;not null;column:applicant_phone" json:"applicant_phone"`
	ApplicantIDCard  string     `gorm:"size:50;column:applicant_id_card" json:"applicant_id_card"`
	ShopName         string     `gorm:"size:255;not null;column:shop_name" json:"shop_name"`
	ProductCategory  string     `gorm:"size:255;column:product_category" json:"product_category"`
	LeaseTermMonths  int        `gorm:"default:12;column:lease_term_months" json:"lease_term_months"`
	MonthlyRate      float64    `gorm:"column:monthly_rate" json:"monthly_rate"`
	ApplicationState string     `gorm:"size:50;default:'submitted';column:application_state" json:"application_state"`
	ReviewedAt       *time.Time `gorm:"column:reviewed_at" json:"reviewed_at"`
	ReviewNote       string     `gorm:"type:text;column:review_note" json:"review_note"`
	Status           string     `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedBy        *int       `gorm:"column:created_by" json:"created_by"`
	UpdatedBy        *int       `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Application) TableName() string {
	return "application"
}
