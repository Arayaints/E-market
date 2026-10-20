package repositories

import (
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/src/contract/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindAll(filter requests.ContractFilter) ([]models.Contract, error) {
	var contracts []models.Contract
	query := r.conn.Model(&models.Contract{}).Where("status = 'A'")

	if filter.StallIdent != "" {
		query = query.Where("stall_ident = ?", filter.StallIdent)
	}
	if filter.Status != "" {
		query = query.Where("contract_state = ?", filter.Status)
	}
	if filter.Search != "" {
		query = query.Where("tenant_name LIKE ? OR tenant_phone LIKE ? OR shop_name LIKE ? OR contract_number LIKE ?",
			"%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	err := query.Order("id DESC").Find(&contracts).Error
	return contracts, err
}

func (r *repository) FindByID(id int) (*models.Contract, error) {
	var contract models.Contract
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&contract).Error
	if err != nil {
		return nil, err
	}
	return &contract, nil
}

func (r *repository) Create(contract *models.Contract) error {
	now := time.Now()
	contract.CreatedAt = now
	contract.UpdatedAt = now
	contract.Status = "A"
	return r.conn.Create(contract).Error
}

func (r *repository) UpdateStallStatus(stallIdent string, status string) error {
	return r.conn.Model(&models.Stall{}).
		Where("ident = ?", stallIdent).
		Update("stall_status", status).Error
}
