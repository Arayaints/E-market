package models

import "time"

type User struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string    `gorm:"size:100;unique;not null;column:username" json:"username"`
	Password  string    `gorm:"size:255;not null;column:password" json:"-"`
	FullName  string    `gorm:"size:255;column:full_name" json:"full_name"`
	Role      string    `gorm:"size:50;not null;default:'tenant';column:role" json:"role"`
	Email     string    `gorm:"size:255;column:email" json:"email"`
	Phone     string    `gorm:"size:50;column:phone" json:"phone"`
	Status    string    `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (User) TableName() string {
	return "user"
}
