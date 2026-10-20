package repositories

import (
	"time"

	"emarket-api/helpers"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/src/item/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(filter requests.ItemFilter) ([]models.Item, int64, error) {
	var items []models.Item
	var total int64

	query := r.conn.Model(&models.Item{}).Where("status = 'A'")

	if filter.ProjectID > 0 {
		query = query.Where("project_id = ?", filter.ProjectID)
	}
	if filter.Search != "" {
		query = query.Where("name LIKE ?", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page, limit := helpers.ParsePageAndLimit(filter.Page, filter.Limit)
	offset := (page - 1) * limit

	err := query.Order("id DESC").Limit(int(limit)).Offset(int(offset)).Find(&items).Error
	return items, total, err
}

func (r *repository) FindByID(id int) (*models.Item, error) {
	var item models.Item
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *repository) Create(item *models.Item) error {
	now := time.Now()
	item.CreatedAt = now
	item.UpdatedAt = now
	item.Status = "A"
	return r.conn.Create(item).Error
}

func (r *repository) Update(item *models.Item) error {
	item.UpdatedAt = time.Now()
	return r.conn.Save(item).Error
}

func (r *repository) Delete(id int, userID int) error {
	now := time.Now()
	return r.conn.Model(&models.Item{}).
		Where("id = ?", id).
		Updates(map[string]any{
			"status":     "D",
			"updated_by": userID,
			"updated_at": now,
		}).Error
}
