package repositories

import (
	"fmt"
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

func (r *repository) FindAll(filter requests.BookingFilter, ownerID *int) ([]models.Booking, error) {
	var bookings []models.Booking
	query := r.conn.Model(&models.Booking{}).Where("status = 'A'")

	if filter.StallIdent != "" {
		query = query.Where("stall_ident = ?", filter.StallIdent)
	}
	if ownerID != nil {
		query = query.Where("created_by = ?", *ownerID)
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

func (r *repository) FindActiveDuplicate(stallIdent string, userID int, applicantName string, applicantPhone string) (*models.Booking, error) {
	var booking models.Booking
	query := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND status = 'A' AND booking_status NOT IN ('rejected', 'cancelled', 'not_interested', 'no_show')", stallIdent)

	if userID > 0 {
		// The authenticated account is the only authoritative owner. Contact fields
		// are editable profile data and must never make two tenants look identical.
		query = query.Where("created_by = ?", userID)
	} else {
		query = query.Where("(applicant_phone = ? OR applicant_name = ?)", applicantPhone, applicantName)
	}

	err := query.Order("id DESC").First(&booking).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

func (r *repository) HasActiveHolder(stallIdent string) (bool, error) {
	var count int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND status = 'A' AND booking_status NOT IN ('waiting_queue', 'rejected', 'cancelled', 'not_interested', 'no_show')", stallIdent).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) Create(booking *models.Booking) error {
	now := time.Now()
	booking.CreatedAt = now
	booking.UpdatedAt = now
	booking.Status = "A"
	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(booking).Error; err != nil {
			return err
		}

		bookingID := booking.ID
		tenantID := booking.CreatedBy
		statusLabel := "รออนุมัติวันนัด"
		tenantTitle := "ส่งคำขอนัดชมแผงสำเร็จ"
		officerTitle := "มีคำขอนัดชมแผงใหม่"
		if booking.BookingStatus == "waiting_queue" {
			statusLabel = "คิวสำรอง"
			tenantTitle = "เข้าคิวสำรองแผงสำเร็จ"
			officerTitle = "มีผู้เช่าต่อคิวสำรองใหม่"
		}

		notifications := []models.Notification{
			{
				RecipientRole: "tenant", RecipientUserID: tenantID, RecipientName: booking.ApplicantName,
				Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: statusLabel,
				Title: tenantTitle + " " + booking.StallIdent + " (" + booking.BookingNo + ")",
				Message: "ระบบได้รับรายการสำหรับแผง " + booking.StallIdent + " แล้ว",
				BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
				MarketName: booking.MarketName, ProjectName: booking.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=tenant",
			},
			{
				RecipientRole: "officer", RecipientName: "เจ้าหน้าที่ดูแลตลาด",
				Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: statusLabel,
				Title: officerTitle + " " + booking.StallIdent + " (" + booking.BookingNo + ")",
				Message: booking.ApplicantName + " ส่งรายการสำหรับแผง " + booking.StallIdent,
				BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
				MarketName: booking.MarketName, ProjectName: booking.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=officer",
			},
		}
		if err := tx.Create(&notifications).Error; err != nil {
			return err
		}
		return tx.Model(&models.Stall{}).
			Where("ident = ?", booking.StallIdent).
			Update("stall_status", "reserved").Error
	})
}

func (r *repository) Update(booking *models.Booking) error {
	booking.UpdatedAt = time.Now()
	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(booking).Error; err != nil {
			return err
		}

		statusLabels := map[string]string{
			"approved":         "อนุมัตินัดชมแผง",
			"rejected":         "ไม่อนุมัตินัดหมาย",
			"interested":       "พร้อมยื่นคำร้องขอเช่า",
			"cancelled":        "ยกเลิกรายการแล้ว",
			"pending_approval": "รออนุมัติวันนัด",
		}
		label := statusLabels[booking.BookingStatus]
		if label == "" {
			label = booking.BookingStatus
		}
		bookingID := booking.ID
		notification := models.Notification{
			RecipientRole: "tenant", RecipientUserID: booking.CreatedBy, RecipientName: booking.ApplicantName,
			Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: label,
			Title: label + " " + booking.StallIdent + " (" + booking.BookingNo + ")",
			Message: "สถานะรายการแผง " + booking.StallIdent + " เปลี่ยนเป็น " + label,
			BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
			MarketName: booking.MarketName, ProjectName: booking.ProjectName,
			TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=tenant",
		}
		if err := tx.Create(&notification).Error; err != nil {
			return err
		}

		if booking.BookingStatus != "cancelled" && booking.BookingStatus != "rejected" && booking.BookingStatus != "not_interested" && booking.BookingStatus != "no_show" {
			return nil
		}

		// Check if there is still an active holder on this stall (e.g., if a waiting queue item was cancelled)
		var activeHolderCount int64
		if err := tx.Model(&models.Booking{}).
			Where("stall_ident = ? AND status = 'A' AND booking_status NOT IN ('waiting_queue', 'rejected', 'cancelled', 'not_interested', 'no_show')", booking.StallIdent).
			Count(&activeHolderCount).Error; err != nil {
			return err
		}
		if activeHolderCount > 0 {
			// Re-index remaining waiting queue items
			var waitingItems []models.Booking
			if err := tx.Where("stall_ident = ? AND status = 'A' AND booking_status = 'waiting_queue'", booking.StallIdent).
				Order("queue_number ASC, id ASC").Find(&waitingItems).Error; err != nil {
				return err
			}
			for idx := range waitingItems {
				waitingItems[idx].QueueNumber = idx + 1
				if err := tx.Save(&waitingItems[idx]).Error; err != nil {
					return err
				}
			}
			return nil
		}

		var next models.Booking
		err := tx.Where("stall_ident = ? AND status = 'A' AND booking_status = 'waiting_queue'", booking.StallIdent).
			Order("queue_number ASC, id ASC").First(&next).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}
		if err == gorm.ErrRecordNotFound {
			return tx.Model(&models.Stall{}).Where("ident = ?", booking.StallIdent).Update("stall_status", "available").Error
		}

		next.BookingStatus = "pending_slot"
		next.QueueNumber = 1
		next.UpdatedAt = time.Now()
		if err := tx.Save(&next).Error; err != nil {
			return err
		}

		// Re-index remaining waiting queue items behind the promoted one
		var remainingQueues []models.Booking
		if err := tx.Where("stall_ident = ? AND status = 'A' AND booking_status = 'waiting_queue'", booking.StallIdent).
			Order("queue_number ASC, id ASC").Find(&remainingQueues).Error; err != nil {
			return err
		}
		for idx := range remainingQueues {
			remainingQueues[idx].QueueNumber = idx + 1
			if err := tx.Save(&remainingQueues[idx]).Error; err != nil {
				return err
			}
		}

		nextID := next.ID
		promotion := models.Notification{
			RecipientRole: "tenant", RecipientUserID: next.CreatedBy, RecipientName: next.ApplicantName,
			Type: "pending_slot", StatusCode: "pending_slot", StatusLabel: "ถึงคิวสำรองของคุณแล้ว",
			Title: "ถึงคิวสำรองของแผง " + next.StallIdent + " แล้ว",
			Message: "คิวก่อนหน้าสละสิทธิ์ กรุณาเลือกวันและเวลานัดหมายสำหรับแผง " + next.StallIdent,
			BookingID: &nextID, BookingNumber: next.BookingNo, StallNumber: next.StallIdent,
			MarketName: next.MarketName, ProjectName: next.ProjectName,
			TargetURL: "/bookings/" + fmt.Sprint(next.ID) + "?role=tenant",
		}
		return tx.Create(&promotion).Error
	})
}

func (r *repository) CountActiveQueue(stallIdent string) (int64, error) {
	var count int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND booking_status = 'waiting_queue' AND status = 'A'", stallIdent).
		Count(&count).Error
	return count, err
}

func (r *repository) UpdateStallStatus(stallIdent string, status string) error {
	return r.conn.Model(&models.Stall{}).
		Where("ident = ?", stallIdent).
		Update("stall_status", status).Error
}
