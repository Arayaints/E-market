package responses

import "time"

type BookingResponse struct {
	ID             int       `json:"id"`
	BookingNo      string    `json:"booking_no"`
	StallID        *int      `json:"stall_id,omitempty"`
	StallIdent     string    `json:"stall_ident"`
	ApplicantName  string    `json:"applicant_name"`
	ApplicantPhone string    `json:"applicant_phone"`
	ApplicantEmail string    `json:"applicant_email"`
	BusinessType   string    `json:"business_type"`
	VisitDate      string    `json:"visit_date"`
	VisitTime      string    `json:"visit_time"`
	Note           string    `json:"note"`
	Status         string    `json:"status"`
	QueueNumber    int       `json:"queue_number"`
	CreatedAt      time.Time `json:"created_at"`
}
