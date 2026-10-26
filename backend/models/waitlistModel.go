package models

import "time"

// Waitlist is intentionally separate from Booking. Joining a queue never
// creates an appointment, reservation, or financial obligation.
type Waitlist struct {
	ID                 int        `gorm:"primaryKey;autoIncrement" json:"id"`
	StallID            *int       `gorm:"column:stall_id;index" json:"stall_id,omitempty"`
	StallIdent         string     `gorm:"size:50;not null;index:idx_waitlist_stall_position" json:"stall_ident"`
	MarketID           *int       `gorm:"column:market_id;index" json:"market_id,omitempty"`
	MarketName         string     `gorm:"size:255;column:market_name" json:"market_name"`
	ProjectName        string     `gorm:"size:255;column:project_name" json:"project_name"`
	TenantID           int        `gorm:"column:tenant_id;index;not null" json:"tenant_id"`
	TenantName         string     `gorm:"size:255;column:tenant_name" json:"tenant_name"`
	TenantPhone        string     `gorm:"size:50;column:tenant_phone" json:"tenant_phone"`
	Position           int        `gorm:"not null;column:position;index:idx_waitlist_stall_position" json:"position"`
	Status             string     `gorm:"size:30;not null;default:'waiting';index" json:"status"` // waiting, offered, accepted, withdrawn, expired, cancelled
	DismissReason      string     `gorm:"size:255;column:dismiss_reason" json:"dismiss_reason,omitempty"`
	OfferedAt          *time.Time `gorm:"column:offered_at" json:"offered_at,omitempty"`
	ExpiresAt          *time.Time `gorm:"column:expires_at" json:"expires_at,omitempty"`
	NearExpiryNotified bool       `gorm:"column:near_expiry_notified;default:false" json:"near_expiry_notified"`
	CreatedAt          time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Waitlist) TableName() string { return "waitlist" }
