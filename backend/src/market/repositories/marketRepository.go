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

func (r *repository) syncMarketStats(m *models.Market) {
	var occupiedCount int64
	r.conn.Model(&models.Booking{}).
		Where("status = 'A' AND (market_id = ? OR market_name LIKE ?) AND booking_status IN ('lease_applied', 'completed')", m.ID, "%"+m.Name+"%").
		Count(&occupiedCount)

	var reservedCount int64
	r.conn.Model(&models.Booking{}).
		Where("status = 'A' AND (market_id = ? OR market_name LIKE ?) AND booking_status IN ('pending', 'approved', 'visited') AND booking_status NOT IN ('rejected', 'not_interested', 'cancelled', 'no_show')", m.ID, "%"+m.Name+"%").
		Count(&reservedCount)

	m.OccupiedStalls = int(occupiedCount)
	m.ReservedStalls = int(reservedCount)
	avail := m.TotalStalls - m.OccupiedStalls - m.ReservedStalls
	if avail < 0 {
		avail = 0
	}
	m.AvailableStalls = avail
	if m.TotalStalls > 0 && m.AvailableStalls == 0 {
		m.Status = "full"
	}
}

func (r *repository) FindAll(search string) ([]models.Market, error) {
	var markets []models.Market
	query := r.conn.Model(&models.Market{}).Where("status != 'D'")
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name LIKE ? OR name_en LIKE ? OR district LIKE ? OR code LIKE ?", s, s, s, s)
	}
	err := query.Order("id ASC").Find(&markets).Error
	if err != nil {
		return nil, err
	}
	for i := range markets {
		r.syncMarketStats(&markets[i])
	}
	return markets, nil
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
	r.syncMarketStats(&market)
	return &market, nil
}

func (r *repository) FindZonesByMarketID(marketID int) ([]models.Zone, error) {
	var zones []models.Zone
	err := r.conn.Where("market_id = ? AND status = 'A'", marketID).Order("id ASC").Find(&zones).Error
	return zones, err
}
