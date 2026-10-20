package requests

type LoginRequest struct {
	Username string `json:"username" validate:"nonzero"`
	Password string `json:"password" validate:"nonzero"`
}

type RefreshTokenRequest struct {
	AccessToken  string `json:"access_token" validate:"nonzero"`
	RefreshToken string `json:"refresh_token"`
}
