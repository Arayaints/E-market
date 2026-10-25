package repositories

import (
	"encoding/json"
	"fmt"
	"time"

	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
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
		Where("stall_ident = ? AND status = 'A' AND booking_status NOT IN ('rejected', 'cancelled', 'not_interested', 'no_show', 'terminated')", stallIdent)

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
		Where("stall_ident = ? AND status = 'A' AND queue_number = 0 AND booking_status NOT IN ('waiting_queue', 'rejected', 'cancelled', 'not_interested', 'no_show', 'terminated')", stallIdent).
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
		tenantMsg := "ระบบได้รับรายการนัดชมแผง " + booking.StallIdent + " แล้ว กรุณารอเจ้าหน้าที่อนุมัติวันและเวลานัดหมาย"
		officerTitle := "มีคำขอนัดชมแผงใหม่"
		officerMsg := booking.ApplicantName + " ส่งคำขอนัดชมแผง " + booking.StallIdent + " (ผู้จองหลัก)"
		if booking.QueueNumber > 0 || booking.BookingStatus == "waiting_queue" {
			qNum := booking.QueueNumber
			if qNum <= 0 {
				qNum = 1
			}
			statusLabel = fmt.Sprintf("คิวสำรองที่ %d • รออนุมัตินัด", qNum)
			tenantTitle = fmt.Sprintf("ลงทะเบียนคิวสำรองที่ %d สำเร็จ", qNum)
			tenantMsg = fmt.Sprintf("คุณได้รับสิทธิ์คิวสำรองที่ %d สำหรับแผง %s ระบบบันทึกวันเวลานัดชมของคุณแล้ว กรุณารอเจ้าหน้าที่อนุมัตินัดหมาย", qNum, booking.StallIdent)
			officerTitle = fmt.Sprintf("มีผู้เช่าต่อคิวสำรองที่ %d (รออนุมัตินัด)", qNum)
			officerMsg = fmt.Sprintf("%s จองต่อคิวสำรองที่ %d แผง %s (วันที่ %s เวลา %s) กรุณาตรวจสอบและกดอนุมัตินัด", booking.ApplicantName, qNum, booking.StallIdent, booking.VisitDate, booking.VisitTime)
		}

		notifications := []models.Notification{
			{
				RecipientRole: "tenant", RecipientUserID: tenantID, RecipientName: booking.ApplicantName,
				Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: statusLabel,
				Title: tenantTitle + " " + booking.StallIdent + " (" + booking.BookingNo + ")",
				Message: tenantMsg,
				BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
				MarketName: booking.MarketName, ProjectName: booking.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=tenant",
			},
			{
				RecipientRole: "officer", RecipientName: "เจ้าหน้าที่ดูแลตลาด",
				Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: statusLabel,
				Title: officerTitle + " " + booking.StallIdent + " (" + booking.BookingNo + ")",
				Message: officerMsg,
				BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
				MarketName: booking.MarketName, ProjectName: booking.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=officer",
			},
		}
		if err := tx.Create(&notifications).Error; err != nil {
			return err
		}
		var stallCount int64
		tx.Model(&models.Stall{}).Where("ident = ?", booking.StallIdent).Count(&stallCount)
		if stallCount == 0 {
			marketID := 1
			if booking.MarketID != nil {
				marketID = *booking.MarketID
			}
			newStall := models.Stall{
				MarketID:    marketID,
				MarketName:  booking.MarketName,
				ProjectName: booking.ProjectName,
				Ident:       booking.StallIdent,
				Name:        "แผงค้า " + booking.StallIdent,
				StallStatus: "reserved",
				Floor:       "1",
				Status:      "A",
			}
			return tx.Create(&newStall).Error
		}
		return tx.Model(&models.Stall{}).
			Where("ident = ?", booking.StallIdent).
			Update("stall_status", "reserved").Error
	})
}

func appendTimelineOnModel(b *models.Booking, item responses.TimelineItem) {
	var tl []responses.TimelineItem
	if b.Timeline != "" {
		_ = json.Unmarshal([]byte(b.Timeline), &tl)
	}
	tl = append(tl, item)
	if bytes, err := json.Marshal(tl); err == nil {
		b.Timeline = string(bytes)
	}
}

func (r *repository) Update(booking *models.Booking) error {
	now := time.Now()
	booking.UpdatedAt = now
	isTerminalCancel := booking.BookingStatus == "cancelled" ||
		booking.BookingStatus == "rejected" ||
		booking.BookingStatus == "not_interested" ||
		booking.BookingStatus == "no_show"
	wasQueueItem := booking.QueueNumber > 0
	if isTerminalCancel {
		booking.QueueNumber = 0
	}

	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(booking).Error; err != nil {
			return err
		}

		statusLabels := map[string]string{
			"approved":         "นัดหมายสำเร็จ",
			"rejected":         "ไม่อนุมัตินัดหมาย",
			"interested":       "พร้อมยื่นคำร้องขอเช่า",
			"cancelled":        "ยกเลิกรายการแล้ว",
			"pending_approval": "รออนุมัติวันนัด",
		}
		label := statusLabels[booking.BookingStatus]
		if label == "" {
			label = booking.BookingStatus
		}
		notifTitle := label + " " + booking.StallIdent + " (" + booking.BookingNo + ")"
		notifMsg := "สถานะรายการแผง " + booking.StallIdent + " เปลี่ยนเป็น " + label
		if booking.BookingStatus == "approved" && booking.QueueNumber > 0 {
			label = fmt.Sprintf("นัดหมายสำเร็จ (คิวสำรองที่ %d)", booking.QueueNumber)
			notifTitle = fmt.Sprintf("อนุมัตินัดชมแผง %s • คิวสำรองที่ %d (%s)", booking.StallIdent, booking.QueueNumber, booking.BookingNo)
			notifMsg = fmt.Sprintf("เจ้าหน้าที่อนุมัตินัดหมายเข้าชมแผง %s วันที่ %s (%s) แล้ว คุณสามารถเข้าชมแผงตามวันนัดได้ตามปกติ และรอผลจากผู้จองคิวหลัก", booking.StallIdent, booking.VisitDate, booking.VisitTime)
		} else if booking.BookingStatus == "interested" {
			notifTitle = "เปิดสิทธิ์ยื่นคำร้องขอเช่าแผง " + booking.StallIdent + " (" + booking.BookingNo + ")"
			notifMsg = "เจ้าหน้าที่ยืนยันการเช่าแผง " + booking.StallIdent + " เรียบร้อยแล้ว กรุณากดปุ่ม 'ยื่นคำร้องขอเช่าแผงนี้' เพื่อส่งเอกสารเช่าแผง"
		}

		bookingID := booking.ID
		notification := models.Notification{
			RecipientRole: "tenant", RecipientUserID: booking.CreatedBy, RecipientName: booking.ApplicantName,
			Type: booking.BookingStatus, StatusCode: booking.BookingStatus, StatusLabel: label,
			Title: notifTitle,
			Message: notifMsg,
			BookingID: &bookingID, BookingNumber: booking.BookingNo, StallNumber: booking.StallIdent,
			MarketName: booking.MarketName, ProjectName: booking.ProjectName,
			TargetURL: "/bookings/" + fmt.Sprint(booking.ID) + "?role=tenant",
		}
		if err := tx.Create(&notification).Error; err != nil {
			return err
		}

		if booking.BookingStatus == "completed" {
			return tx.Model(&models.Stall{}).Where("ident = ?", booking.StallIdent).Update("stall_status", "occupied").Error
		}
		if booking.BookingStatus == "lease_applied" {
			return tx.Model(&models.Stall{}).Where("ident = ?", booking.StallIdent).Update("stall_status", "occupied").Error
		}

		if !isTerminalCancel {
			return nil
		}

		// Check if there is still an active primary holder on this stall
		var activeHolderCount int64
		if err := tx.Model(&models.Booking{}).
			Where("stall_ident = ? AND status = 'A' AND queue_number = 0 AND booking_status NOT IN ('waiting_queue', 'rejected', 'cancelled', 'not_interested', 'no_show', 'terminated')", booking.StallIdent).
			Count(&activeHolderCount).Error; err != nil {
			return err
		}

		// Find all active backup queue items for this stall
		var waitingItems []models.Booking
		if err := tx.Where("stall_ident = ? AND status = 'A' AND (queue_number > 0 OR booking_status = 'waiting_queue') AND booking_status NOT IN ('rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed', 'terminated')", booking.StallIdent).
			Order("queue_number ASC, id ASC").Find(&waitingItems).Error; err != nil {
			return err
		}

		if wasQueueItem || activeHolderCount > 0 {
			// A backup queue item cancelled/forfeited while primary holder still holds the stall: re-index remaining queues
			for idx := range waitingItems {
				oldPos := waitingItems[idx].QueueNumber
				newPos := idx + 1
				waitingItems[idx].QueueNumber = newPos
				if waitingItems[idx].BookingStatus == "waiting_queue" {
					waitingItems[idx].BookingStatus = "pending_approval"
				}
				if oldPos != newPos {
					appendTimelineOnModel(&waitingItems[idx], responses.TimelineItem{
						Action:    fmt.Sprintf("ขยับลำดับคิวสำรองขึ้นเป็นคิวที่ %d", newPos),
						ActorRole: "system",
						ActorName: "ระบบจัดการคิวอัตโนมัติ",
						Timestamp: now.Format("2006-01-02T15:04:05Z07:00"),
						Note:      fmt.Sprintf("คิวสำรองก่อนหน้าสละสิทธิ์ ลำดับคิวของคุณขยับขึ้นเป็นคิวสำรองที่ %d", newPos),
					})
				}
				if err := tx.Save(&waitingItems[idx]).Error; err != nil {
					return err
				}
				if oldPos != newPos {
					qID := waitingItems[idx].ID
					shiftNotif := models.Notification{
						RecipientRole: "tenant", RecipientUserID: waitingItems[idx].CreatedBy, RecipientName: waitingItems[idx].ApplicantName,
						Type: waitingItems[idx].BookingStatus, StatusCode: waitingItems[idx].BookingStatus,
						StatusLabel: fmt.Sprintf("ขยับเป็นคิวสำรองที่ %d", newPos),
						Title:       fmt.Sprintf("ลำดับคิวสำรองแผง %s ขยับขึ้นเป็นคิวที่ %d", waitingItems[idx].StallIdent, newPos),
						Message:     fmt.Sprintf("คิวก่อนหน้าสละสิทธิ์ ระบบปรับลำดับคิวแผง %s ของคุณขึ้นเป็นคิวสำรองที่ %d โดยอัตโนมัติ", waitingItems[idx].StallIdent, newPos),
						BookingID:   &qID, BookingNumber: waitingItems[idx].BookingNo, StallNumber: waitingItems[idx].StallIdent,
						MarketName: waitingItems[idx].MarketName, ProjectName: waitingItems[idx].ProjectName,
						TargetURL: "/bookings/" + fmt.Sprint(waitingItems[idx].ID) + "?role=tenant",
					}
					if err := tx.Create(&shiftNotif).Error; err != nil {
						return err
					}
				}
			}
			return nil
		}

		// Primary holder forfeited/cancelled and there is no active holder left
		if len(waitingItems) == 0 {
			return tx.Model(&models.Stall{}).Where("ident = ?", booking.StallIdent).Update("stall_status", "available").Error
		}

		// Promote queue position 1 (waitingItems[0]) to Primary Holder (QueueNumber = 0) immediately!
		// Keep their existing appointment status ('approved' stays 'approved', 'pending_approval' stays 'pending_approval').
		next := waitingItems[0]
		if next.BookingStatus == "waiting_queue" || next.BookingStatus == "pending_slot" || next.BookingStatus == "" {
			next.BookingStatus = "pending_approval"
		}
		next.QueueNumber = 0
		next.UpdatedAt = now
		appendTimelineOnModel(&next, responses.TimelineItem{
			Action:    "เลื่อนคิวขึ้นเป็นผู้จองหลัก (ตัวจริง)",
			ActorRole: "system",
			ActorName: "ระบบจัดการคิวอัตโนมัติ",
			Timestamp: now.Format("2006-01-02T15:04:05Z07:00"),
			Note:      "ผู้จองคิวหลักสละสิทธิ์ ระบบเลื่อนคิวสำรองที่ 1 ขึ้นเป็นผู้จองหลักโดยอัตโนมัติ (สามารถดำเนินการต่อได้ทันทีโดยไม่ต้องเลือกวันนัดใหม่)",
		})
		if err := tx.Save(&next).Error; err != nil {
			return err
		}

		nextID := next.ID
		promotionNotifications := []models.Notification{
			{
				RecipientRole: "tenant", RecipientUserID: next.CreatedBy, RecipientName: next.ApplicantName,
				Type: next.BookingStatus, StatusCode: next.BookingStatus, StatusLabel: "ถึงคิวของคุณแล้ว (ผู้จองหลัก)",
				Title:   "ถึงคิวของคุณแล้ว! แผง " + next.StallIdent + " (" + next.BookingNo + ")",
				Message: "ถึงคิวของคุณแล้ว! ผู้จองคิวหลักสละสิทธิ์แผง " + next.StallIdent + " เจ้าหน้าที่จะติดต่อคุณเพื่อยืนยันการเช่า (หากเข้าชมแผงแล้วและตกลงเช่า เจ้าหน้าที่จะเปิดสิทธิ์ให้ยื่นคำร้องทันที)",
				BookingID: &nextID, BookingNumber: next.BookingNo, StallNumber: next.StallIdent,
				MarketName: next.MarketName, ProjectName: next.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(next.ID) + "?role=tenant",
			},
			{
				RecipientRole: "officer", RecipientName: "เจ้าหน้าที่ดูแลตลาด",
				Type: next.BookingStatus, StatusCode: next.BookingStatus, StatusLabel: "เลื่อนคิวขึ้นเป็นผู้จองหลัก",
				Title:   "ผู้จองคิวหลักสละสิทธิ์ • เลื่อนคุณ" + next.ApplicantName + " ขึ้นเป็นผู้จองหลักแผง " + next.StallIdent,
				Message: "ผู้จองคิวหลักสละสิทธิ์ ระบบเลื่อนคุณ" + next.ApplicantName + " ขึ้นเป็นผู้จองหลักแผง " + next.StallIdent + " แล้ว กรุณาติดต่อสอบถามผู้เช่า หากตกลงเช่าสามารถกดยืนยันการเช่าได้ทันที",
				BookingID: &nextID, BookingNumber: next.BookingNo, StallNumber: next.StallIdent,
				MarketName: next.MarketName, ProjectName: next.ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(next.ID) + "?role=officer",
			},
		}
		if err := tx.Create(&promotionNotifications).Error; err != nil {
			return err
		}

		// Re-index remaining backup queue items behind the promoted one (2 -> 1, 3 -> 2, ...)
		remainingQueues := waitingItems[1:]
		for idx := range remainingQueues {
			newPos := idx + 1
			remainingQueues[idx].QueueNumber = newPos
			if remainingQueues[idx].BookingStatus == "waiting_queue" {
				remainingQueues[idx].BookingStatus = "pending_approval"
			}
			appendTimelineOnModel(&remainingQueues[idx], responses.TimelineItem{
				Action:    fmt.Sprintf("ขยับลำดับคิวสำรองขึ้นเป็นคิวที่ %d", newPos),
				ActorRole: "system",
				ActorName: "ระบบจัดการคิวอัตโนมัติ",
				Timestamp: now.Format("2006-01-02T15:04:05Z07:00"),
				Note:      fmt.Sprintf("ผู้จองหลักสละสิทธิ์ ลำดับคิวของคุณขยับขึ้นเป็นคิวสำรองที่ %d", newPos),
			})
			if err := tx.Save(&remainingQueues[idx]).Error; err != nil {
				return err
			}
			qID := remainingQueues[idx].ID
			shiftNotif := models.Notification{
				RecipientRole: "tenant", RecipientUserID: remainingQueues[idx].CreatedBy, RecipientName: remainingQueues[idx].ApplicantName,
				Type: remainingQueues[idx].BookingStatus, StatusCode: remainingQueues[idx].BookingStatus,
				StatusLabel: fmt.Sprintf("ขยับเป็นคิวสำรองที่ %d", newPos),
				Title:       fmt.Sprintf("ลำดับคิวสำรองแผง %s ขยับขึ้นเป็นคิวที่ %d", remainingQueues[idx].StallIdent, newPos),
				Message:     fmt.Sprintf("ผู้จองคิวหลักสละสิทธิ์ ระบบปรับลำดับคิวแผง %s ของคุณขึ้นเป็นคิวสำรองที่ %d โดยอัตโนมัติ", remainingQueues[idx].StallIdent, newPos),
				BookingID:   &qID, BookingNumber: remainingQueues[idx].BookingNo, StallNumber: remainingQueues[idx].StallIdent,
				MarketName: remainingQueues[idx].MarketName, ProjectName: remainingQueues[idx].ProjectName,
				TargetURL: "/bookings/" + fmt.Sprint(remainingQueues[idx].ID) + "?role=tenant",
			}
			if err := tx.Create(&shiftNotif).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *repository) CountActiveQueue(stallIdent string) (int64, error) {
	var count int64
	err := r.conn.Model(&models.Booking{}).
		Where("stall_ident = ? AND (queue_number > 0 OR booking_status = 'waiting_queue') AND booking_status NOT IN ('rejected', 'cancelled', 'not_interested', 'no_show', 'lease_applied', 'completed', 'terminated') AND status = 'A'", stallIdent).
		Count(&count).Error
	return count, err
}

func (r *repository) UpdateStallStatus(stallIdent string, status string) error {
	return r.conn.Model(&models.Stall{}).
		Where("ident = ?", stallIdent).
		Update("stall_status", status).Error
}

func (r *repository) ClearAll() error {
	return r.conn.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("1 = 1").Delete(&models.Notification{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Contract{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Application{}).Error; err != nil {
			return err
		}
		if err := tx.Where("1 = 1").Delete(&models.Booking{}).Error; err != nil {
			return err
		}
		return tx.Model(&models.Stall{}).Where("stall_status IN ('reserved', 'booked', 'occupied')").Update("stall_status", "available").Error
	})
}
