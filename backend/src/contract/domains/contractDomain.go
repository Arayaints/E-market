package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	GetContracts(filter requests.ContractFilter) ([]responses.ContractResponse, error)
	GetContractByID(id int) (*responses.ContractResponse, error)
	CreateContract(userID int, req requests.CreateContractRequest) (*responses.ContractResponse, error)
	TerminateContract(id int, userID int) error
}

type Repository interface {
	FindAll(filter requests.ContractFilter) ([]models.Contract, error)
	FindByID(id int) (*models.Contract, error)
	Create(contract *models.Contract) error
	UpdateStallStatus(stallIdent string, status string) error
	Terminate(contractID int) error
}
