package models

import "time"

type Item struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	ProjectID   int       `gorm:"not null;column:project_id" json:"project_id"`
	Name        string    `gorm:"size:255;not null;column:name" json:"name"`
	Description string    `gorm:"type:text;column:description" json:"description"`
	Status      string    `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedBy   *int      `gorm:"column:created_by" json:"created_by"`
	UpdatedBy   *int      `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP;autoCreateTime:false" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP;autoUpdateTime:false" json:"updated_at"`
}

func (Item) TableName() string {
	return "item"
}
