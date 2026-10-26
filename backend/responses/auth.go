package responses

import "time"

type UserResponse struct {
	ID              int                      `json:"id"`
	Username        string                   `json:"username"`
	FullName        string                   `json:"full_name"`
	Role            string                   `json:"role"`
	Email           string                   `json:"email"`
	Phone           string                   `json:"phone"`
	Status          string                   `json:"status"`
	CreatedAt       time.Time                `json:"created_at"`
	AssignedMarkets []AssignedMarketResponse `json:"assigned_markets"`
}

type AssignedMarketResponse struct {
	ID       int    `json:"id"`
	Slug     string `json:"slug"`
	Code     string `json:"code"`
	Name     string `json:"name"`
	District string `json:"district"`
}

type LoginResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token,omitempty"`
	TokenType    string       `json:"token_type"`
	Role         string       `json:"role"`
	User         UserResponse `json:"user"`
}
