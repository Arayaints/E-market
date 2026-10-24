package repositories

import (
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/src/stall/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(filter requests.StallFilter) ([]models.Stall, error) {
	var stalls []models.Stall
	query := r.conn.Model(&models.Stall{}).Where("status = 'A'")

	if filter.MarketID > 0 {
		query = query.Where("market_id = ?", filter.MarketID)
	}
	marketKey := filter.Market
	if marketKey == "" {
		marketKey = filter.Slug
	}
	if marketKey != "" {
		query = query.Where("market_slug = ? OR market_name LIKE ?", marketKey, "%"+marketKey+"%")
	}
	if filter.ZoneID > 0 {
		query = query.Where("zone_id = ?", filter.ZoneID)
	}
	if filter.Status != "" {
		query = query.Where("stall_status = ?", filter.Status)
	}
	if filter.Search != "" {
		query = query.Where("ident LIKE ? OR name LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	err := query.Order("ident ASC").Find(&stalls).Error
	return stalls, err
}

func (r *repository) FindByID(id int) (*models.Stall, error) {
	var stall models.Stall
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&stall).Error
	if err != nil {
		return nil, err
	}
	return &stall, nil
}

func (r *repository) ByIdent(ident string) (*models.Stall, error) {
	var stall models.Stall
	err := r.conn.Where("ident = ? AND status = 'A'", ident).First(&stall).Error
	if err != nil {
		return nil, err
	}
	return &stall, nil
}

func (r *repository) Create(stall *models.Stall) error {
	now := time.Now()
	stall.CreatedAt = now
	stall.UpdatedAt = now
	stall.Status = "A"
	return r.conn.Create(stall).Error
}

func (r *repository) GetActiveBooking(stallIdent string) (*models.Booking, error) {
	var booking models.Booking
	err := r.conn.Where("stall_ident = ? AND booking_status IN ('pending', 'confirmed', 'approved') AND status = 'A'", stallIdent).
		Order("queue_number ASC, id ASC").
		First(&booking).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *repository) CountQueue(stallIdent string) (int64, error) {
	var total int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND booking_status IN ('pending', 'confirmed', 'approved') AND status = 'A'", stallIdent).
		Count(&total).Error
	return total, err
}
