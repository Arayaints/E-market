package repositories

import (
	"strconv"

	"emarket-api/models"
	"emarket-api/src/market/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(search string) ([]models.Market, error) {
	var markets []models.Market
	query := r.conn.Model(&models.Market{}).Where("status != 'D'")
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name LIKE ? OR name_en LIKE ? OR district LIKE ? OR code LIKE ?", s, s, s, s)
	}
	err := query.Order("id ASC").Find(&markets).Error
	return markets, err
}

func (r *repository) FindByIDOrSlug(idOrSlug string) (*models.Market, error) {
	var market models.Market
	query := r.conn.Where("status != 'D'")
	if id, err := strconv.Atoi(idOrSlug); err == nil {
		query = query.Where("id = ? OR slug = ?", id, idOrSlug)
	} else {
		query = query.Where("slug = ?", idOrSlug)
	}

	err := query.First(&market).Error
	if err != nil {
		return nil, err
	}
	return &market, nil
}

func (r *repository) FindZonesByMarketID(marketID int) ([]models.Zone, error) {
	var zones []models.Zone
	err := r.conn.Where("market_id = ? AND status = 'A'", marketID).Order("id ASC").Find(&zones).Error
	return zones, err
}
