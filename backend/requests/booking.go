package requests

type BookingFilter struct {
	StallIdent string `form:"stall_ident"`
	Status     string `form:"status"`
	Search     string `form:"search"`
	Page       string `form:"page"`
	Limit      string `form:"limit"`
}

type CreateBookingRequest struct {
	StallIdent     string `json:"stall_ident" validate:"nonzero"`
	ApplicantName  string `json:"applicant_name" validate:"nonzero"`
	ApplicantPhone string `json:"applicant_phone" validate:"nonzero"`
	ApplicantEmail string `json:"applicant_email"`
	BusinessType   string `json:"business_type"`
	VisitDate      string `json:"visit_date" validate:"nonzero"`
	VisitTime      string `json:"visit_time" validate:"nonzero"`
	Note           string `json:"note"`
}

type UpdateBookingStatusRequest struct {
	Status string `json:"status" validate:"nonzero"`
	Reason string `json:"reason"`
}
