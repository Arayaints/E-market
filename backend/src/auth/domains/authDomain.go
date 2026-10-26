package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	Login(req requests.LoginRequest) (*responses.LoginResponse, error)
	GetProfile(userID int) (*responses.UserResponse, error)
}

type Repository interface {
	FindByUsername(username string) (*models.User, error)
	FindByID(id int) (*models.User, error)
	FindAssignedMarkets(userID int) ([]models.Market, error)
}
