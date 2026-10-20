package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	GetStalls(filter requests.StallFilter) ([]responses.StallResponse, error)
	GetStallByID(id int) (*responses.StallResponse, error)
	GetWaitingQueue(ident string) (*responses.WaitingQueueResponse, error)
	CreateStall(userID int, req requests.CreateStallRequest) (*responses.StallResponse, error)
}

type Repository interface {
	FindAll(filter requests.StallFilter) ([]models.Stall, error)
	FindByID(id int) (*models.Stall, error)
	ByIdent(ident string) (*models.Stall, error)
	Create(stall *models.Stall) error
	GetActiveBooking(stallIdent string) (*models.Booking, error)
	CountQueue(stallIdent string) (int64, error)
}
