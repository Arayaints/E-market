package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	GetApplications(filter requests.ApplicationFilter) ([]responses.ApplicationResponse, error)
	GetApplicationByID(id int) (*responses.ApplicationResponse, error)
	CreateApplication(userID int, req requests.CreateApplicationRequest) (*responses.ApplicationResponse, error)
	UpdateStatus(id int, userID int, req requests.UpdateApplicationStatusRequest) (*responses.ApplicationResponse, error)
	Action(id int, userID int, req requests.ApplicationActionRequest) (*responses.ApplicationResponse, error)
}

type Repository interface {
	FindAll(filter requests.ApplicationFilter) ([]models.Application, error)
	FindByID(id int) (*models.Application, error)
	Create(app *models.Application) error
	Update(app *models.Application) error
	UpdateStallStatus(stallIdent string, status string) error
}
