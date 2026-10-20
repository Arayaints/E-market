package responses

import "time"

type ApplicationResponse struct {
	ID              int        `json:"id"`
	ApplicationNo   string     `json:"application_no"`
	StallID         *int       `json:"stall_id,omitempty"`
	StallIdent      string     `json:"stall_ident"`
	ApplicantName   string     `json:"applicant_name"`
	ApplicantPhone  string     `json:"applicant_phone"`
	ApplicantIDCard string     `json:"applicant_id_card"`
	ShopName        string     `json:"shop_name"`
	ProductCategory string     `json:"product_category"`
	LeaseTermMonths int        `json:"lease_term_months"`
	MonthlyRate     float64    `json:"monthly_rate"`
	Status          string     `json:"status"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
	ReviewNote      string     `json:"review_note,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}
