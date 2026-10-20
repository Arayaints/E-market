package requests

type ApplicationFilter struct {
	StallIdent string `form:"stall_ident"`
	Status     string `form:"status"`
	Search     string `form:"search"`
	Page       string `form:"page"`
	Limit      string `form:"limit"`
}

type CreateApplicationRequest struct {
	StallIdent      string `json:"stall_ident" validate:"nonzero"`
	ApplicantName   string `json:"applicant_name" validate:"nonzero"`
	ApplicantPhone  string `json:"applicant_phone" validate:"nonzero"`
	ApplicantIDCard string `json:"applicant_id_card" validate:"nonzero"`
	ShopName        string `json:"shop_name" validate:"nonzero"`
	ProductCategory string `json:"product_category"`
	LeaseTermMonths int    `json:"lease_term_months" validate:"nonzero"`
}

type UpdateApplicationStatusRequest struct {
	Status string `json:"status" validate:"nonzero"`
	Reason string `json:"reason"`
}
