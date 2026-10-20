package requests

type ContractFilter struct {
	StallIdent string `form:"stall_ident"`
	Status     string `form:"status"`
	Search     string `form:"search"`
	Page       string `form:"page"`
	Limit      string `form:"limit"`
}

type CreateContractRequest struct {
	ApplicationID   int     `json:"application_id"`
	StallIdent      string  `json:"stall_ident" validate:"nonzero"`
	TenantName      string  `json:"tenant_name" validate:"nonzero"`
	TenantPhone     string  `json:"tenant_phone" validate:"nonzero"`
	TenantIDCard    string  `json:"tenant_id_card"`
	ShopName        string  `json:"shop_name" validate:"nonzero"`
	StartDate       string  `json:"start_date" validate:"nonzero"`
	EndDate         string  `json:"end_date" validate:"nonzero"`
	MonthlyRental   float64 `json:"monthly_rental" validate:"nonzero"`
	SecurityDeposit float64 `json:"security_deposit"`
}
