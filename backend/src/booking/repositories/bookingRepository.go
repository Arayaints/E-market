package repositories

import (
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/src/booking/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(filter requests.BookingFilter) ([]models.Booking, error) {
	var bookings []models.Booking
	query := r.conn.Model(&models.Booking{}).Where("status = 'A'")

	if filter.StallIdent != "" {
		query = query.Where("stall_ident = ?", filter.StallIdent)
	}
	if filter.Status != "" {
		query = query.Where("booking_status = ?", filter.Status)
	}
	if filter.Search != "" {
		query = query.Where("applicant_name LIKE ? OR applicant_phone LIKE ? OR booking_no LIKE ?",
			"%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	err := query.Order("id DESC").Find(&bookings).Error
	return bookings, err
}

func (r *repository) FindByID(id int) (*models.Booking, error) {
	var booking models.Booking
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&booking).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *repository) Create(booking *models.Booking) error {
	now := time.Now()
	booking.CreatedAt = now
	booking.UpdatedAt = now
	booking.Status = "A"
	return r.conn.Create(booking).Error
}

func (r *repository) Update(booking *models.Booking) error {
	booking.UpdatedAt = time.Now()
	return r.conn.Save(booking).Error
}

func (r *repository) CountActiveQueue(stallIdent string) (int64, error) {
	var count int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND booking_status IN ('pending', 'confirmed', 'approved') AND status = 'A'", stallIdent).
		Count(&count).Error
	return count, err
}

func (r *repository) UpdateStallStatus(stallIdent string, status string) error {
	return r.conn.Model(&models.Stall{}).
		Where("ident = ?", stallIdent).
		Update("stall_status", status).Error
}
