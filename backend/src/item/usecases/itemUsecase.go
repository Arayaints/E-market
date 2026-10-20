package usecases

import (
	"errors"
	"net/http"

	"emarket-api/helpers"
	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/item/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func toItemResponse(m *models.Item) responses.ItemResponse {
	return responses.ItemResponse{
		ID:          m.ID,
		ProjectID:   m.ProjectID,
		Name:        m.Name,
		Description: m.Description,
		Status:      m.Status,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func (u *useCase) GetItems(filter requests.ItemFilter) (responses.Pagination, error) {
	items, total, err := u.repo.FindAll(filter)
	if err != nil {
		logs.Error(err)
		return responses.Pagination{}, responses.NewInternalServerError()
	}

	page, limit := helpers.ParsePageAndLimit(filter.Page, filter.Limit)
	resList := make([]responses.ItemResponse, len(items))
	for i, item := range items {
		resList[i] = toItemResponse(&item)
	}

	return helpers.Pagination(resList, limit, page, total), nil
}

func (u *useCase) GetItemByID(id int) (*responses.ItemResponse, error) {
	item, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลที่ต้องการ")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toItemResponse(item)
	return &res, nil
}

func (u *useCase) CreateItem(userID int, req requests.CreateItemRequest) (*responses.ItemResponse, error) {
	item := models.Item{
		ProjectID:   req.ProjectID,
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   &userID,
		UpdatedBy:   &userID,
	}

	if err := u.repo.Create(&item); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toItemResponse(&item)
	return &res, nil
}

func (u *useCase) UpdateItem(id int, userID int, req requests.UpdateItemRequest) (*responses.ItemResponse, error) {
	item, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลที่ต้องการ")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	item.Name = req.Name
	item.Description = req.Description
	item.UpdatedBy = &userID

	if err := u.repo.Update(item); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toItemResponse(item)
	return &res, nil
}

func (u *useCase) DeleteItem(id int, userID int) error {
	_, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลที่ต้องการ")
		}
		logs.Error(err)
		return responses.NewInternalServerError()
	}
	return u.repo.Delete(id, userID)
}
