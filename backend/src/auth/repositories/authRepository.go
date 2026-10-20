package repositories

import (
	"emarket-api/models"
	"emarket-api/src/auth/domains"
	"gorm.io/gorm"
)

type repository struct {
	conn *gorm.DB
}

func NewRepository(db *gorm.DB) domains.Repository {
	return &repository{conn: db}
}

func (r *repository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.conn.Where("(username = ? OR email = ?) AND status = 'A'", username, username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repository) FindByID(id int) (*models.User, error) {
	var user models.User
	err := r.conn.Where("id = ? AND status = 'A'", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
