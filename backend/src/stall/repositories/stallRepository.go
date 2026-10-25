package repositories

import (
	"strings"
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
	resolvedMarketID := filter.MarketID
	resolvedMarketSlug := ""
	resolvedMarketName := ""

	marketKey := filter.Market
	if marketKey == "" {
		marketKey = filter.Slug
	}
	if resolvedMarketID == 0 && marketKey != "" {
		var market models.Market
		if err := r.conn.Where("status != 'D' AND (slug = ? OR code = ? OR name = ?)", marketKey, marketKey, marketKey).
			First(&market).Error; err == nil {
			resolvedMarketID = market.ID
			resolvedMarketSlug = market.Slug
			resolvedMarketName = market.Name
		}
	}
	if resolvedMarketID > 0 {
		query = query.Where("market_id = ?", resolvedMarketID)
	}
	if marketKey != "" {
		if resolvedMarketID == 0 {
			query = query.Where("market_slug = ? OR market_name LIKE ?", marketKey, "%"+marketKey+"%")
		}
	}
	if filter.ZoneID > 0 {
		query = query.Where("zone_id = ?", filter.ZoneID)
	}
	if filter.Search != "" {
		query = query.Where("ident LIKE ? OR name LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	if err := query.Order("ident ASC").Find(&stalls).Error; err != nil {
		return nil, err
	}

	// GIS creates selectable stall codes dynamically, so a booked stall may not
	// have a physical row in the representative seed data. Merge active booking
	// states into the response so the map can still render those stalls as
	// reserved/occupied. No tenant information is exposed here.
	var activeBookings []models.Booking
	bookingQuery := r.conn.Model(&models.Booking{}).
		Where("status = 'A' AND booking_status NOT IN ('waiting_queue', 'rejected', 'not_interested', 'cancelled', 'no_show', 'terminated')")
	if resolvedMarketID > 0 {
		if resolvedMarketName == "" {
			var market models.Market
			if err := r.conn.Where("id = ?", resolvedMarketID).First(&market).Error; err == nil {
				resolvedMarketSlug = market.Slug
				resolvedMarketName = market.Name
			}
		}
		bookingQuery = bookingQuery.Where("market_id = ? OR market_name LIKE ?", resolvedMarketID, "%"+resolvedMarketName+"%")
	} else if marketKey != "" {
		bookingQuery = bookingQuery.Where("market_name LIKE ?", "%"+marketKey+"%")
	}
	if err := bookingQuery.Order("id ASC").Find(&activeBookings).Error; err != nil {
		return nil, err
	}

	stallIndexes := make(map[string]int, len(stalls))
	for i := range stalls {
		stallIndexes[stalls[i].Ident] = i
	}
	for _, booking := range activeBookings {
		ident := strings.TrimSpace(booking.StallIdent)
		if ident == "" {
			continue
		}
		derivedStatus := "reserved"
		if booking.BookingStatus == "lease_applied" || booking.BookingStatus == "completed" {
			derivedStatus = "occupied"
		}

		if index, exists := stallIndexes[ident]; exists {
			// Occupied is stronger than reserved if legacy data contains more than
			// one active workflow for the same stall.
			if stalls[index].StallStatus != "occupied" || derivedStatus == "occupied" {
				stalls[index].StallStatus = derivedStatus
			}
			continue
		}
		if filter.ZoneID > 0 || (filter.Search != "" && !strings.Contains(strings.ToLower(ident), strings.ToLower(filter.Search))) {
			continue
		}

		marketID := resolvedMarketID
		if booking.MarketID != nil {
			marketID = *booking.MarketID
		}
		stalls = append(stalls, models.Stall{
			MarketID:    marketID,
			MarketSlug:  resolvedMarketSlug,
			MarketName:  booking.MarketName,
			ProjectName: booking.ProjectName,
			Ident:       ident,
			Name:        "แผงค้า " + ident,
			StallStatus: derivedStatus,
			Status:      "A",
		})
		stallIndexes[ident] = len(stalls) - 1
	}

	if filter.Status == "" {
		return stalls, nil
	}
	filtered := make([]models.Stall, 0, len(stalls))
	for _, stall := range stalls {
		if stall.StallStatus == filter.Status {
			filtered = append(filtered, stall)
		}
	}
	return filtered, nil
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
	err := r.conn.Where("stall_ident = ? AND queue_number = 0 AND booking_status NOT IN ('waiting_queue', 'rejected', 'not_interested', 'cancelled', 'no_show', 'terminated') AND status = 'A'", stallIdent).
		Order("id ASC").
		First(&booking).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *repository) CountQueue(stallIdent string) (int64, error) {
	var total int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND (queue_number > 0 OR booking_status = 'waiting_queue') AND booking_status NOT IN ('rejected', 'not_interested', 'cancelled', 'no_show', 'lease_applied', 'completed', 'terminated') AND status = 'A'", stallIdent).
		Count(&total).Error
	return total, err
}
