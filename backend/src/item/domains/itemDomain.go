package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	GetItems(filter requests.ItemFilter) (responses.Pagination, error)
	GetItemByID(id int) (*responses.ItemResponse, error)
	CreateItem(userID int, req requests.CreateItemRequest) (*responses.ItemResponse, error)
	UpdateItem(id int, userID int, req requests.UpdateItemRequest) (*responses.ItemResponse, error)
	DeleteItem(id int, userID int) error
}

type Repository interface {
	FindAll(filter requests.ItemFilter) ([]models.Item, int64, error)
	FindByID(id int) (*models.Item, error)
	Create(item *models.Item) error
	Update(item *models.Item) error
	Delete(id int, userID int) error
}
