package requests

type CreateItemRequest struct {
	ProjectID   int    `json:"project_id" validate:"nonzero"`
	Name        string `json:"name" validate:"nonzero"`
	Description string `json:"description"`
}

type UpdateItemRequest struct {
	Name        string `json:"name" validate:"nonzero"`
	Description string `json:"description"`
}

type ItemFilter struct {
	ProjectID int    `form:"project_id"`
	Search    string `form:"search"`
	Page      string `form:"page"`
	Limit     string `form:"limit"`
}
