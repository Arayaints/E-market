package usecases

import (
	"errors"
	"net/http"

	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/responses"
	"emarket-api/src/market/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetMarkets(search string) ([]models.Market, error) {
	markets, err := u.repo.FindAll(search)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return markets, nil
}

func (u *useCase) GetMarketByIDOrSlug(idOrSlug string) (*models.Market, error) {
	market, err := u.repo.FindByIDOrSlug(idOrSlug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลตลาด")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return market, nil
}

func (u *useCase) GetMarketZones(marketID int) ([]models.Zone, error) {
	zones, err := u.repo.FindZonesByMarketID(marketID)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return zones, nil
}
