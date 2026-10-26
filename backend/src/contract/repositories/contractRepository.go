package repositories

import (
	"encoding/json"
	"fmt"
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
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
	if filter.MarketID != 0 {
		query = query.Where("market_id = ?", filter.MarketID)
	}
	if filter.CreatedBy != 0 {
		query = query.Where("tenant_user_id = ?", filter.CreatedBy)
	}

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
	if contract.MarketID == nil {
		var stall models.Stall
		query := r.conn.Where("status = 'A'")
		if contract.StallID != nil && *contract.StallID > 0 {
			query = query.Where("id = ?", *contract.StallID)
		} else {
			query = query.Where("ident = ?", contract.StallIdent)
		}
		if query.First(&stall).Error == nil {
			contract.MarketID = &stall.MarketID
		}
	}
	if contract.TenantUserID == nil && contract.ApplicationID != nil {
		var application models.Application
		if r.conn.Select("created_by").First(&application, *contract.ApplicationID).Error == nil {
			contract.TenantUserID = application.CreatedBy
		}
	}
	if contract.TenantUserID == nil {
		var booking models.Booking
		if r.conn.Select("created_by").Where("stall_ident = ? AND created_by IS NOT NULL", contract.StallIdent).
			Order("id DESC").First(&booking).Error == nil {
			contract.TenantUserID = booking.CreatedBy
		}
	}
	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(contract).Error; err != nil {
			return err
		}
		// Upsert stall status to occupied
		var stallCount int64
		tx.Model(&models.Stall{}).Where("ident = ?", contract.StallIdent).Count(&stallCount)
		if stallCount == 0 {
			newStall := models.Stall{
				Ident:       contract.StallIdent,
				Name:        "แผงค้า " + contract.StallIdent,
				StallStatus: "occupied",
				Floor:       "1",
				Status:      "A",
			}
			_ = tx.Create(&newStall).Error
		} else {
			_ = tx.Model(&models.Stall{}).Where("ident = ?", contract.StallIdent).Update("stall_status", "occupied").Error
		}

		// If this contract is for an active booking, complete that booking and append timeline
		var activeBookings []models.Booking
		tx.Model(&models.Booking{}).
			Where("stall_ident = ? AND status = 'A' AND booking_status NOT IN ('rejected', 'cancelled', 'completed', 'terminated')", contract.StallIdent).
			Find(&activeBookings)
		for _, bk := range activeBookings {
			var tl []responses.TimelineItem
			if bk.Timeline != "" {
				_ = json.Unmarshal([]byte(bk.Timeline), &tl)
			}
			tl = append(tl, responses.TimelineItem{
				Action:    "อนุมัติสัญญาเช่าแผงค้าสำเร็จ",
				ActorRole: "officer",
				ActorName: "ผู้อำนวยการสำนักตลาด",
				Timestamp: now.Format("2006-01-02T15:04:05Z07:00"),
				Note:      fmt.Sprintf("จัดทำสัญญาเช่าแผงค้าเรียบร้อยแล้ว เลขที่สัญญา: %s", contract.ContractNumber),
			})
			tlBytes, _ := json.Marshal(tl)
			_ = tx.Model(&models.Booking{}).Where("id = ?", bk.ID).Updates(map[string]interface{}{
				"booking_status": "completed",
				"timeline":       string(tlBytes),
				"updated_at":     now,
			}).Error
		}

		// If application_id was provided, update application state
		if contract.ApplicationID != nil && *contract.ApplicationID > 0 {
			_ = tx.Model(&models.Application{}).
				Where("id = ?", *contract.ApplicationID).
				Update("application_state", "completed").Error
		}

		return nil
	})
}

func (r *repository) UpdateStallStatus(stallIdent string, status string) error {
	var stallCount int64
	r.conn.Model(&models.Stall{}).Where("ident = ?", stallIdent).Count(&stallCount)
	if stallCount == 0 {
		newStall := models.Stall{
			Ident:       stallIdent,
			Name:        "แผงค้า " + stallIdent,
			StallStatus: status,
			Floor:       "1",
			Status:      "A",
		}
		return r.conn.Create(&newStall).Error
	}
	return r.conn.Model(&models.Stall{}).
		Where("ident = ?", stallIdent).
		Update("stall_status", status).Error
}

func (r *repository) Terminate(contractID int) error {
	var contract models.Contract
	if err := r.conn.Where("id = ? AND status = 'A'", contractID).First(&contract).Error; err != nil {
		return err
	}
	now := time.Now()
	contract.ContractState = "terminated"
	contract.UpdatedAt = now
	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&contract).Error; err != nil {
			return err
		}
		// Free stall to available
		_ = tx.Model(&models.Stall{}).Where("ident = ?", contract.StallIdent).Update("stall_status", "available").Error

		// Close any linked completed/lease_applied booking for this stall and append timeline
		var linkedBookings []models.Booking
		tx.Model(&models.Booking{}).
			Where("stall_ident = ? AND status = 'A' AND booking_status IN ('completed', 'lease_applied')", contract.StallIdent).
			Find(&linkedBookings)
		for _, bk := range linkedBookings {
			var tl []responses.TimelineItem
			if bk.Timeline != "" {
				_ = json.Unmarshal([]byte(bk.Timeline), &tl)
			}
			tl = append(tl, responses.TimelineItem{
				Action:    "สิ้นสุดสัญญาเช่า",
				ActorRole: "officer",
				ActorName: "เจ้าหน้าที่ตลาด",
				Timestamp: now.Format("2006-01-02T15:04:05Z07:00"),
				Note:      "สัญญาเช่าสิ้นสุดเรียบร้อยแล้ว แผงค้ากลับมาว่างอีกครั้ง",
			})
			tlBytes, _ := json.Marshal(tl)
			_ = tx.Model(&models.Booking{}).Where("id = ?", bk.ID).Updates(map[string]interface{}{
				"booking_status": "terminated",
				"timeline":       string(tlBytes),
				"updated_at":     now,
			}).Error
		}

		// Check if there is waiting queue in booking
		var nextQueue models.Booking
		if err := tx.Where("stall_ident = ? AND status = 'A' AND (queue_number > 0 OR booking_status = 'waiting_queue') AND booking_status NOT IN ('rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed', 'terminated')", contract.StallIdent).
			Order("queue_number ASC, id ASC").First(&nextQueue).Error; err == nil {
			if nextQueue.BookingStatus == "waiting_queue" || nextQueue.BookingStatus == "pending_slot" || nextQueue.BookingStatus == "" {
				nextQueue.BookingStatus = "pending_approval"
			}
			nextQueue.QueueNumber = 0
			nextQueue.UpdatedAt = now
			_ = tx.Save(&nextQueue).Error
			_ = tx.Model(&models.Stall{}).Where("ident = ?", contract.StallIdent).Update("stall_status", "reserved").Error
		}
		return nil
	})
}
