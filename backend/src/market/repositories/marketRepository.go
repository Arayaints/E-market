package repositories

import (
	"encoding/json"
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
	r.conn.Model(&models.Stall{}).
		Where("status = 'A' AND (market_id = ? OR market_name LIKE ?) AND stall_status = 'occupied'", m.ID, "%"+m.Name+"%").
		Distinct("ident").
		Count(&occupiedCount)

	var activeContractCount int64
	r.conn.Model(&models.Contract{}).
		Where("status = 'A' AND contract_state = 'active' AND stall_ident IN (?)",
			r.conn.Model(&models.Stall{}).Select("ident").Where("market_id = ? OR market_name LIKE ?", m.ID, "%"+m.Name+"%"),
		).
		Distinct("stall_ident").
		Count(&activeContractCount)
	if activeContractCount > occupiedCount {
		occupiedCount = activeContractCount
	}

	var reservedCount int64
	r.conn.Model(&models.Stall{}).
		Where("status = 'A' AND (market_id = ? OR market_name LIKE ?) AND stall_status = 'reserved'", m.ID, "%"+m.Name+"%").
		Distinct("ident").
		Count(&reservedCount)

	var activeBookingReserved int64
	r.conn.Model(&models.Booking{}).
		Where("status = 'A' AND (market_id = ? OR market_name LIKE ?) AND booking_status NOT IN ('waiting_queue', 'rejected', 'not_interested', 'cancelled', 'no_show', 'lease_applied', 'completed', 'terminated', 'closed')", m.ID, "%"+m.Name+"%").
		Distinct("stall_ident").
		Count(&activeBookingReserved)
	if activeBookingReserved > reservedCount {
		reservedCount = activeBookingReserved
	}

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

func (r *repository) FindByStaffUserID(search string, userID int) ([]models.Market, error) {
	var markets []models.Market
	query := r.conn.Model(&models.Market{}).
		Joins("JOIN market_staff_assignment msa ON msa.market_id = market.id").
		Where("msa.user_id = ? AND market.status != 'D'", userID)
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("market.name LIKE ? OR market.name_en LIKE ? OR market.district LIKE ? OR market.code LIKE ?", s, s, s, s)
	}
	if err := query.Order("market.id ASC").Find(&markets).Error; err != nil {
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
	query := r.conn.Where("status = 'A'")
	if marketID > 0 {
		query = query.Where("market_id = ?", marketID)
	}
	err := query.Order("id ASC").Find(&zones).Error
	return zones, err
}

func (r *repository) FindGISConfig(marketID int) (*models.MarketGISConfig, error) {
	var config models.MarketGISConfig
	if err := r.conn.Where("market_id = ?", marketID).First(&config).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

func (r *repository) SaveGISConfig(config *models.MarketGISConfig) error {
	var existing models.MarketGISConfig
	if err := r.conn.Where("market_id = ?", config.MarketID).First(&existing).Error; err == nil {
		type projectItem struct {
			ID     string `json:"id"`
			Name   string `json:"name"`
			Stalls []struct {
				Code string `json:"code"`
			} `json:"stalls"`
		}
		var oldProjects, newProjects []projectItem
		_ = json.Unmarshal([]byte(existing.ProjectsJSON), &oldProjects)
		_ = json.Unmarshal([]byte(config.ProjectsJSON), &newProjects)

		activeProjectIDs := make(map[string]bool, len(newProjects))
		activeProjectNames := make(map[string]bool, len(newProjects))
		for _, p := range newProjects {
			activeProjectIDs[p.ID] = true
			activeProjectNames[p.Name] = true
		}

		var removedProjectNames []string
		var removedStallCodes []string
		for _, oldP := range oldProjects {
			if !activeProjectIDs[oldP.ID] && !activeProjectNames[oldP.Name] {
				if oldP.Name != "" {
					removedProjectNames = append(removedProjectNames, oldP.Name)
				}
				for _, s := range oldP.Stalls {
					if s.Code != "" {
						removedStallCodes = append(removedStallCodes, s.Code)
					}
				}
			}
		}

		if len(removedProjectNames) > 0 {
			r.conn.Model(&models.Stall{}).
				Where("market_id = ? AND project_name IN ?", config.MarketID, removedProjectNames).
				Update("status", "D")
		}
		if len(removedStallCodes) > 0 {
			r.conn.Model(&models.Stall{}).
				Where("market_id = ? AND ident IN ?", config.MarketID, removedStallCodes).
				Update("status", "D")
		}
	}

	return r.conn.Where(models.MarketGISConfig{MarketID: config.MarketID}).
		Assign(map[string]interface{}{"projects_json": config.ProjectsJSON, "facilities_json": config.FacilitiesJSON, "published": config.Published, "updated_by": config.UpdatedBy}).
		FirstOrCreate(config).Error
}
