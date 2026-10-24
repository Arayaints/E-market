package responses

import "time"

type BookingResponse struct {
	ID                 int       `json:"id"`
	BookingNo          string    `json:"booking_no"`
	BookingNumber      string    `json:"booking_number"`
	StallID            *int      `json:"stall_id,omitempty"`
	StallIdent         string    `json:"stall_ident"`
	StallNumber        string    `json:"stall_number"`
	MarketID           *int      `json:"market_id,omitempty"`
	MarketName         string    `json:"market_name"`
	ProjectName        string    `json:"project_name"`
	ApplicantName      string    `json:"applicant_name"`
	TenantName         string    `json:"tenant_name"`
	TenantUserID       *int      `json:"tenant_user_id,omitempty"`
	ApplicantPhone     string    `json:"applicant_phone"`
	TenantPhone        string    `json:"tenant_phone"`
	ApplicantEmail     string    `json:"applicant_email"`
	BusinessType       string    `json:"business_type"`
	IntendedBusiness   string    `json:"intended_business"`
	VisitDate          string    `json:"visit_date"`
	VisitTime          string    `json:"visit_time"`
	VisitTimeSlot      string    `json:"visit_time_slot"`
	Note               string    `json:"note"`
	Status             string    `json:"status"`
	QueueNumber        int       `json:"queue_number"`
	QueuePosition      int       `json:"queue_position,omitempty"`
	HoldingStall       bool      `json:"holding_stall"`
	AppointmentGroupID string `json:"appointment_group_id,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}
