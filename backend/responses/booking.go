package responses

import "time"

type TimelineItem struct {
	Action    string `json:"action"`
	ActorRole string `json:"actor_role"`
	ActorName string `json:"actor_name"`
	Timestamp string `json:"timestamp"`
	Note      string `json:"note,omitempty"`
}

type BookingResponse struct {
	ID                 int            `json:"id"`
	BookingNo          string         `json:"booking_no"`
	BookingNumber      string         `json:"booking_number"`
	StallID            *int           `json:"stall_id,omitempty"`
	StallIdent         string         `json:"stall_ident"`
	StallNumber        string         `json:"stall_number"`
	MarketID           *int           `json:"market_id,omitempty"`
	MarketName         string         `json:"market_name"`
	ProjectName        string         `json:"project_name"`
	ApplicantName      string         `json:"applicant_name"`
	TenantName         string         `json:"tenant_name"`
	TenantUserID       *int           `json:"tenant_user_id,omitempty"`
	ApplicantPhone      string         `json:"applicant_phone"`
	TenantPhone         string         `json:"tenant_phone"`
	ApplicantEmail      string         `json:"applicant_email"`
	TenantEmail         string         `json:"tenant_email"`
	TenantIdCard        string         `json:"tenant_id_card,omitempty"`
	BusinessType        string         `json:"business_type"`
	IntendedBusiness    string         `json:"intended_business"`
	VisitDate           string         `json:"visit_date"`
	VisitTime           string         `json:"visit_time"`
	VisitTimeSlot       string         `json:"visit_time_slot"`
	MeetingPoint        string         `json:"meeting_point,omitempty"`
	EscortOfficer       string         `json:"escort_officer,omitempty"`
	OfficerNotes        string         `json:"officer_notes,omitempty"`
	RejectionReason     string         `json:"rejection_reason,omitempty"`
	CancelReason        string         `json:"cancel_reason,omitempty"`
	NotInterestedReason string         `json:"not_interested_reason,omitempty"`
	Note                string         `json:"note"`
	Status              string         `json:"status"`
	ApplicationNumber   string         `json:"application_number,omitempty"`
	QueueNumber         int            `json:"queue_number"`
	QueuePosition       int            `json:"queue_position"`
	HoldingStall        bool           `json:"holding_stall"`
	AppointmentGroupID string         `json:"appointment_group_id,omitempty"`
	Timeline           []TimelineItem `json:"timeline"`
	CreatedAt          time.Time      `json:"created_at"`
}
