package repositories

import (
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/src/application/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(filter requests.ApplicationFilter) ([]models.Application, error) {
	var apps []models.Application
	query := r.conn.Model(&models.Application{}).Where("status = 'A'")

	if filter.StallIdent != "" {
		query = query.Where("stall_ident = ?", filter.StallIdent)
	}
	if filter.Status != "" {
		query = query.Where("application_state = ?", filter.Status)
	}
	if filter.Search != "" {
		query = query.Where("applicant_name LIKE ? OR applicant_phone LIKE ? OR shop_name LIKE ? OR application_no LIKE ?",
			"%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	err := query.Order("id DESC").Find(&apps).Error
	return apps, err
}

func (r *repository) FindByID(id int) (*models.Application, error) {
	var app models.Application
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&app).Error
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *repository) Create(app *models.Application) error {
	now := time.Now()
	app.CreatedAt = now
	app.UpdatedAt = now
	app.Status = "A"
	return r.conn.Create(app).Error
}

func (r *repository) Update(app *models.Application) error {
	app.UpdatedAt = time.Now()
	return r.conn.Save(app).Error
}
