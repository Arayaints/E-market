package requests

type BookingFilter struct {
	StallIdent string `form:"stall_ident"`
	Status     string `form:"status"`
	Search     string `form:"search"`
	Page       string `form:"page"`
	Limit      string `form:"limit"`
}

type CreateBookingRequest struct {
	StallIdent         string `json:"stall_ident" validate:"nonzero"`
	MarketID           *int   `json:"market_id"`
	MarketName         string `json:"market_name"`
	ProjectName        string `json:"project_name"`
	ApplicantName      string `json:"applicant_name" validate:"nonzero"`
	ApplicantPhone     string `json:"applicant_phone" validate:"nonzero"`
	ApplicantEmail     string `json:"applicant_email"`
	BusinessType       string `json:"business_type"`
	VisitDate          string `json:"visit_date"`
	VisitTime          string `json:"visit_time"`
	Note               string `json:"note"`
	IsQueue            bool   `json:"is_queue"`
	AppointmentGroupID string `json:"appointment_group_id"`
}

type UpdateBookingStatusRequest struct {
	Status string `json:"status" validate:"nonzero"`
	Reason string `json:"reason"`
}
