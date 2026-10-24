package domains

import "emarket-api/models"

type UseCase interface {
	GetMarkets(search string) ([]models.Market, error)
	GetMarketByIDOrSlug(idOrSlug string) (*models.Market, error)
	GetMarketZones(marketID int) ([]models.Zone, error)
}

type Repository interface {
	FindAll(search string) ([]models.Market, error)
	FindByIDOrSlug(idOrSlug string) (*models.Market, error)
	FindZonesByMarketID(marketID int) ([]models.Zone, error)
}
