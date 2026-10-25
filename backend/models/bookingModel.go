package models

import "time"

type Booking struct {
	ID                 int        `gorm:"primaryKey;autoIncrement" json:"id"`
	BookingNo          string     `gorm:"size:50;unique;not null;column:booking_no" json:"booking_no"`
	StallID            *int       `gorm:"column:stall_id" json:"stall_id"`
	StallIdent         string     `gorm:"size:50;not null;column:stall_ident" json:"stall_ident"`
	MarketID           *int       `gorm:"column:market_id" json:"market_id"`
	MarketName         string     `gorm:"size:255;column:market_name" json:"market_name"`
	ProjectName        string     `gorm:"size:255;column:project_name" json:"project_name"`
	ApplicantName      string     `gorm:"size:255;not null;column:applicant_name" json:"applicant_name"`
	ApplicantPhone     string     `gorm:"size:50;not null;column:applicant_phone" json:"applicant_phone"`
	ApplicantEmail     string     `gorm:"size:255;column:applicant_email" json:"applicant_email"`
	ApplicantIdCard    string     `gorm:"size:50;column:applicant_id_card" json:"applicant_id_card"`
	BusinessType       string     `gorm:"size:255;column:business_type" json:"business_type"`
	VisitDate          string     `gorm:"size:20;not null;column:visit_date" json:"visit_date"`
	VisitTime          string     `gorm:"size:20;not null;column:visit_time" json:"visit_time"`
	MeetingPoint       string     `gorm:"size:255;column:meeting_point" json:"meeting_point"`
	EscortOfficer      string     `gorm:"size:255;column:escort_officer" json:"escort_officer"`
	OfficerNotes       string     `gorm:"type:text;column:officer_notes" json:"officer_notes"`
	RejectionReason    string     `gorm:"type:text;column:rejection_reason" json:"rejection_reason"`
	Note               string     `gorm:"type:text;column:note" json:"note"`
	BookingStatus      string     `gorm:"size:50;default:'pending';column:booking_status" json:"booking_status"`
	QueueNumber        int        `gorm:"default:0;column:queue_number" json:"queue_number"`
	AppointmentGroupID string     `gorm:"size:100;column:appointment_group_id" json:"appointment_group_id"`
	Timeline           string     `gorm:"type:text;column:timeline" json:"timeline"`
	ExpiresAt          *time.Time `gorm:"column:expires_at" json:"expires_at"`
	Status             string     `gorm:"type:char(1);default:'A';column:status" json:"status"`
	CreatedBy          *int       `gorm:"column:created_by" json:"created_by"`
	UpdatedBy          *int       `gorm:"column:updated_by" json:"updated_by"`
	CreatedAt          time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Booking) TableName() string {
	return "booking"
}
