package usecases

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/booking/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func ensureStatusMilestone(b *models.Booking, items *[]responses.TimelineItem) {
	if b == nil || items == nil {
		return
	}
	updatedStr := b.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")
	actorName := b.ApplicantName
	if actorName == "" {
		actorName = "ผู้เช่า"
	}

	switch b.BookingStatus {
	case "lease_applied":
		hasApp := false
		for _, it := range *items {
			if strings.Contains(it.Action, "ยื่นคำร้อง") {
				hasApp = true
				break
			}
		}
		if !hasApp {
			*items = append(*items, responses.TimelineItem{
				Action:    "ยื่นคำร้องขอเช่าแผงค้า",
				ActorRole: "tenant",
				ActorName: actorName,
				Timestamp: updatedStr,
				Note:      "ส่งคำร้องขอเช่าแผงค้าเข้าสู่ระบบเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร",
			})
		}
	case "completed":
		hasContract := false
		for _, it := range *items {
			if strings.Contains(it.Action, "สัญญา") {
				hasContract = true
				break
			}
		}
		if !hasContract {
			*items = append(*items, responses.TimelineItem{
				Action:    "อนุมัติสัญญาเช่าแผงค้าสำเร็จ",
				ActorRole: "officer",
				ActorName: "ผู้อำนวยการสำนักตลาด",
				Timestamp: updatedStr,
				Note:      "คำร้องผ่านการอนุมัติและจัดทำสัญญาเช่าเรียบร้อยแล้ว",
			})
		}
	case "terminated":
		hasTerm := false
		for _, it := range *items {
			if strings.Contains(it.Action, "สิ้นสุดสัญญา") {
				hasTerm = true
				break
			}
		}
		if !hasTerm {
			*items = append(*items, responses.TimelineItem{
				Action:    "สิ้นสุดสัญญาเช่า",
				ActorRole: "officer",
				ActorName: "เจ้าหน้าที่ตลาด",
				Timestamp: updatedStr,
				Note:      "สัญญาเช่าสิ้นสุดเรียบร้อยแล้ว แผงค้ากลับมาว่างอีกครั้ง",
			})
		}
	}
}

func parseTimeline(b *models.Booking) []responses.TimelineItem {
	var items []responses.TimelineItem
	if b.Timeline != "" {
		if err := json.Unmarshal([]byte(b.Timeline), &items); err == nil && len(items) > 0 {
			ensureStatusMilestone(b, &items)
			return items
		}
	}

	items = make([]responses.TimelineItem, 0)
	createdStr := b.CreatedAt.Format("2006-01-02T15:04:05Z07:00")
	updatedStr := b.UpdatedAt.Format("2006-01-02T15:04:05Z07:00")

	actorName := b.ApplicantName
	if actorName == "" {
		actorName = "ผู้เช่า"
	}

	if b.BookingStatus == "waiting_queue" || b.QueueNumber > 0 {
		noteText := fmt.Sprintf("ลงทะเบียนรับสิทธิ์คิวสำรองอันดับที่ %d", b.QueueNumber)
		if b.VisitDate != "" && b.VisitTime != "" {
			noteText = fmt.Sprintf("ลงทะเบียนคิวสำรองอันดับที่ %d (เลือกนัดหมายเข้าชมวันที่ %s รอบเวลา %s)", b.QueueNumber, b.VisitDate, b.VisitTime)
		}
		items = append(items, responses.TimelineItem{
			Action:    "ลงทะเบียนคิวสำรองและนัดหมายเข้าชม",
			ActorRole: "tenant",
			ActorName: actorName,
			Timestamp: createdStr,
			Note:      noteText,
		})
	} else {
		initNote := ""
		if b.VisitDate != "" && b.VisitTime != "" {
			initNote = fmt.Sprintf("เลือกนัดหมายเข้าชมวันที่ %s รอบเวลา %s", b.VisitDate, b.VisitTime)
		}
		items = append(items, responses.TimelineItem{
			Action:    "ลงทะเบียนจองแผงและนัดหมายเข้าชม",
			ActorRole: "tenant",
			ActorName: actorName,
			Timestamp: createdStr,
			Note:      initNote,
		})
	}

	switch b.BookingStatus {
	case "approved":
		items = append(items, responses.TimelineItem{
			Action:    "เจ้าหน้าที่อนุมัติการนัดหมาย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: updatedStr,
			Note:      "ตรวจสอบเอกสารเบื้องต้นและยืนยันรอบเวลานัดหมายเข้าชมเรียบร้อย",
		})
	case "visited", "interested":
		items = append(items, responses.TimelineItem{
			Action:    "เจ้าหน้าที่อนุมัติการนัดหมาย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: createdStr,
		})
		items = append(items, responses.TimelineItem{
			Action:    "ยืนยันการเข้าชมแผงเรียบร้อย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: updatedStr,
			Note:      "ผู้เช่าเดินทางมาชมแผงค้าตามนัดหมายเรียบร้อยแล้ว",
		})
	case "lease_applied":
		items = append(items, responses.TimelineItem{
			Action:    "เจ้าหน้าที่อนุมัติการนัดหมาย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: createdStr,
		})
		items = append(items, responses.TimelineItem{
			Action:    "ยืนยันการเข้าชมแผงเรียบร้อย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: updatedStr,
		})
		items = append(items, responses.TimelineItem{
			Action:    "ยื่นคำร้องขอเช่าแผงค้า",
			ActorRole: "tenant",
			ActorName: actorName,
			Timestamp: updatedStr,
			Note:      "ส่งคำร้องขอเช่าแผงค้าเข้าสู่ระบบเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร",
		})
	case "completed":
		items = append(items, responses.TimelineItem{
			Action:    "อนุมัติสัญญาเช่าแผงค้าสำเร็จ",
			ActorRole: "officer",
			ActorName: "ผู้อำนวยการสำนักตลาด",
			Timestamp: updatedStr,
			Note:      "คำร้องผ่านการอนุมัติครบทุกขั้นตอน พร้อมทำสัญญาเช่า",
		})
	case "rejected":
		items = append(items, responses.TimelineItem{
			Action:    "ปฏิเสธการนัดหมาย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: updatedStr,
			Note:      b.Note,
		})
	case "cancelled":
		items = append(items, responses.TimelineItem{
			Action:    "ยกเลิกการนัดหมาย",
			ActorRole: "tenant",
			ActorName: actorName,
			Timestamp: updatedStr,
			Note:      b.Note,
		})
	case "no_show":
		items = append(items, responses.TimelineItem{
			Action:    "บันทึกไม่มาตามนัดหมาย",
			ActorRole: "officer",
			ActorName: "เจ้าหน้าที่ตลาด",
			Timestamp: updatedStr,
			Note:      "ผู้เช่าไม่เดินทางมาตามวันและเวลานัดหมาย",
		})
	}

	return items
}

func appendTimeline(b *models.Booking, item responses.TimelineItem) {
	current := parseTimeline(b)
	current = append(current, item)
	bytes, err := json.Marshal(current)
	if err == nil {
		b.Timeline = string(bytes)
	}
}

func isWaitingQueueBooking(b *models.Booking) bool {
	if b == nil {
		return false
	}
	switch b.BookingStatus {
	case "rejected", "cancelled", "not_interested", "no_show", "lease_applied", "completed", "terminated":
		return false
	}
	return b.BookingStatus == "waiting_queue" || b.QueueNumber > 0
}

func toBookingResponse(b *models.Booking) responses.BookingResponse {
	normalizedStatus := b.BookingStatus
	if normalizedStatus == "waiting_queue" || normalizedStatus == "pending_slot" {
		normalizedStatus = "pending_approval"
	}
	isQueue := isWaitingQueueBooking(b)
	queuePos := 0
	if isQueue {
		queuePos = b.QueueNumber
		if queuePos <= 0 {
			queuePos = 1
		}
	}
	holdingStall := !isQueue &&
		normalizedStatus != "rejected" &&
		normalizedStatus != "cancelled" &&
		normalizedStatus != "not_interested" &&
		normalizedStatus != "no_show" &&
		normalizedStatus != "terminated"

	rejectionReason := b.RejectionReason
	cancelReason := ""
	notInterestedReason := ""
	switch normalizedStatus {
	case "rejected":
		if rejectionReason == "" {
			rejectionReason = b.Note
		}
	case "cancelled":
		cancelReason = b.RejectionReason
		if cancelReason == "" {
			cancelReason = b.Note
		}
		if rejectionReason == "" {
			rejectionReason = cancelReason
		}
	case "not_interested":
		notInterestedReason = b.RejectionReason
		if notInterestedReason == "" {
			notInterestedReason = b.Note
		}
	}

	timelineItems := parseTimeline(b)
	appNumber := ""
	for _, item := range timelineItems {
		if idx := strings.Index(item.Note, "APP-"); idx != -1 {
			rest := item.Note[idx:]
			fields := strings.Fields(rest)
			if len(fields) > 0 {
				appNumber = strings.TrimRight(fields[0], ".,;)")
			}
		}
	}

	return responses.BookingResponse{
		ID:                  b.ID,
		BookingNo:           b.BookingNo,
		BookingNumber:       b.BookingNo,
		StallID:             b.StallID,
		StallIdent:          b.StallIdent,
		StallNumber:         b.StallIdent,
		MarketID:            b.MarketID,
		MarketName:          b.MarketName,
		ProjectName:         b.ProjectName,
		ApplicantName:       b.ApplicantName,
		TenantName:          b.ApplicantName,
		TenantUserID:        b.CreatedBy,
		ApplicantPhone:      b.ApplicantPhone,
		TenantPhone:         b.ApplicantPhone,
		ApplicantEmail:      b.ApplicantEmail,
		TenantEmail:         b.ApplicantEmail,
		TenantIdCard:        b.ApplicantIdCard,
		BusinessType:        b.BusinessType,
		IntendedBusiness:    b.BusinessType,
		VisitDate:           b.VisitDate,
		VisitTime:           b.VisitTime,
		VisitTimeSlot:       b.VisitTime,
		MeetingPoint:        b.MeetingPoint,
		EscortOfficer:       b.EscortOfficer,
		OfficerNotes:        b.OfficerNotes,
		RejectionReason:     rejectionReason,
		CancelReason:        cancelReason,
		NotInterestedReason: notInterestedReason,
		Note:                b.Note,
		Status:              normalizedStatus,
		ApplicationNumber:   appNumber,
		QueueNumber:         queuePos,
		QueuePosition:       queuePos,
		HoldingStall:        holdingStall,
		AppointmentGroupID:  b.AppointmentGroupID,
		Timeline:            timelineItems,
		CreatedAt:           b.CreatedAt,
	}
}

func canManageBookings(role string) bool {
	return role == "admin" || role == "staff"
}

func (u *useCase) GetBookings(filter requests.BookingFilter, actorID int, actorRole string) ([]responses.BookingResponse, error) {
	if actorID <= 0 {
		return nil, responses.NewAppErr(http.StatusUnauthorized, "กรุณาเข้าสู่ระบบก่อนดูรายการจอง")
	}

	var ownerID *int
	if !canManageBookings(actorRole) {
		ownerID = &actorID
	}

	bookings, err := u.repo.FindAll(filter, ownerID)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := make([]responses.BookingResponse, len(bookings))
	for i, b := range bookings {
		res[i] = toBookingResponse(&b)
	}
	return res, nil
}

func (u *useCase) GetBookingByID(id int, actorID int, actorRole string) (*responses.BookingResponse, error) {
	if actorID <= 0 {
		return nil, responses.NewAppErr(http.StatusUnauthorized, "กรุณาเข้าสู่ระบบก่อนดูรายละเอียดการจอง")
	}

	booking, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลการจอง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	if !canManageBookings(actorRole) && (booking.CreatedBy == nil || *booking.CreatedBy != actorID) {
		return nil, responses.NewAppErr(http.StatusForbidden, "คุณไม่มีสิทธิ์ดูรายละเอียดการจองนี้")
	}
	res := toBookingResponse(booking)
	return &res, nil
}

func (u *useCase) CreateBooking(userID int, req requests.CreateBookingRequest) (*responses.BookingResponse, error) {
	if userID <= 0 {
		return nil, responses.NewAppErr(http.StatusUnauthorized, "กรุณาเข้าสู่ระบบก่อนจองแผง")
	}
	if existing, err := u.repo.FindActiveDuplicate(req.StallIdent, userID, req.ApplicantName, req.ApplicantPhone); err == nil && existing != nil {
		return nil, responses.NewAppErr(http.StatusConflict, fmt.Sprintf("คุณได้ทำการจองแผง %s ไว้แล้ว (รหัส %s) ไม่สามารถจองซ้ำได้", req.StallIdent, existing.BookingNo))
	}

	hasActiveHolder, err := u.repo.HasActiveHolder(req.StallIdent)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	isQueue := req.IsQueue || hasActiveHolder
	visitDate := strings.TrimSpace(req.VisitDate)
	visitTime := strings.TrimSpace(req.VisitTime)
	if visitDate == "" || visitTime == "" {
		return nil, responses.NewAppErr(http.StatusUnprocessableEntity, "กรุณาเลือกวันและเวลานัดหมายเข้าชมแผง")
	}

	queueNum := 0
	if isQueue {
		queueCount, _ := u.repo.CountActiveQueue(req.StallIdent)
		queueNum = int(queueCount) + 1
	}

	bookingNo := fmt.Sprintf("BK-%s-%06d", time.Now().Format("20060102"), time.Now().UnixMicro()%1000000)

	email := strings.TrimSpace(req.ApplicantEmail)
	if email == "" {
		email = strings.TrimSpace(req.TenantEmail)
	}
	idCard := strings.TrimSpace(req.ApplicantIdCard)
	if idCard == "" {
		idCard = strings.TrimSpace(req.TenantIdCard)
	}

	var parsedStallID *int
	switch v := req.StallID.(type) {
	case float64:
		idVal := int(v)
		parsedStallID = &idVal
	case int:
		idVal := v
		parsedStallID = &idVal
	}

	booking := models.Booking{
		BookingNo:          bookingNo,
		StallID:            parsedStallID,
		StallIdent:         req.StallIdent,
		MarketID:           req.MarketID,
		MarketName:         req.MarketName,
		ProjectName:        req.ProjectName,
		ApplicantName:      req.ApplicantName,
		ApplicantPhone:     req.ApplicantPhone,
		ApplicantEmail:     email,
		ApplicantIdCard:    idCard,
		BusinessType:       req.BusinessType,
		VisitDate:          visitDate,
		VisitTime:          visitTime,
		Note:               req.Note,
		BookingStatus:      "pending_approval",
		QueueNumber:        queueNum,
		AppointmentGroupID: req.AppointmentGroupID,
	}
	if userID > 0 {
		booking.CreatedBy = &userID
		booking.UpdatedBy = &userID
	}

	initTimeline := []responses.TimelineItem{
		{
			Action: func() string {
				if isQueue {
					return "ลงทะเบียนคิวสำรองและนัดหมายเข้าชม"
				}
				return "ลงทะเบียนจองแผงและนัดหมายเข้าชม"
			}(),
			ActorRole: "tenant",
			ActorName: func() string {
				if req.ApplicantName != "" {
					return req.ApplicantName
				}
				return "ผู้เช่า"
			}(),
			Timestamp: time.Now().Format("2006-01-02T15:04:05Z07:00"),
			Note: func() string {
				if isQueue {
					return fmt.Sprintf("ลงทะเบียนคิวสำรองอันดับที่ %d (เลือกนัดหมายเข้าชมวันที่ %s รอบเวลา %s)", queueNum, visitDate, visitTime)
				}
				return fmt.Sprintf("เลือกนัดหมายเข้าชมวันที่ %s รอบเวลา %s", visitDate, visitTime)
			}(),
		},
	}
	if tBytes, err := json.Marshal(initTimeline); err == nil {
		booking.Timeline = string(tBytes)
	}

	if err := u.repo.Create(&booking); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toBookingResponse(&booking)
	return &res, nil
}

func (u *useCase) UpdateStatus(id int, userID int, req requests.UpdateBookingStatusRequest) (*responses.BookingResponse, error) {
	booking, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลการจอง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	if (req.Status == "interested" || req.Status == "visited") && isWaitingQueueBooking(booking) {
		return nil, responses.NewAppErr(http.StatusBadRequest, "ยังไม่สามารถกดยืนยันการเช่าได้ เนื่องจากผู้จองคิวหลักยังไม่สละสิทธิ์")
	}

	wasQueue := isWaitingQueueBooking(booking)
	booking.BookingStatus = req.Status
	booking.UpdatedBy = &userID
	if strings.TrimSpace(req.MeetingPoint) != "" {
		booking.MeetingPoint = strings.TrimSpace(req.MeetingPoint)
	}
	if strings.TrimSpace(req.EscortOfficer) != "" {
		booking.EscortOfficer = strings.TrimSpace(req.EscortOfficer)
	}
	if strings.TrimSpace(req.OfficerNotes) != "" {
		booking.OfficerNotes = strings.TrimSpace(req.OfficerNotes)
	}

	actionName := "อัปเดตสถานะการจอง"
	actorRole := "officer"
	actorName := "เจ้าหน้าที่ตลาด"

	switch req.Status {
	case "approved":
		if booking.QueueNumber > 0 {
			actionName = fmt.Sprintf("เจ้าหน้าที่อนุมัติการนัดหมาย (คิวสำรองที่ %d)", booking.QueueNumber)
		} else {
			actionName = "เจ้าหน้าที่อนุมัติการนัดหมาย"
		}
	case "visited", "interested":
		actionName = "ยืนยันการเช่าเรียบร้อย (เปิดให้ผู้เช่ายื่นคำร้อง)"
	case "rejected":
		actionName = "ปฏิเสธการนัดหมาย"
	case "cancelled":
		if req.ByOfficer || canManageBookings(req.ActorRole) {
			if wasQueue {
				actionName = "เจ้าหน้าที่ยกเลิกการต่อคิวสำรอง"
			} else {
				actionName = "เจ้าหน้าที่ยกเลิกการนัดหมาย"
			}
			actorRole = "officer"
			actorName = "เจ้าหน้าที่ตลาด"
		} else {
			if wasQueue {
				actionName = "ผู้เช่าสละสิทธิ์คิวสำรอง"
			} else {
				actionName = "ยกเลิกการนัดหมาย"
			}
			actorRole = "tenant"
			actorName = booking.ApplicantName
		}
	case "not_interested":
		actionName = "ผู้เช่าสละสิทธิ์ไม่ยื่นคำร้องขอเช่า"
		if !req.ByOfficer && !canManageBookings(req.ActorRole) {
			actorRole = "tenant"
			actorName = booking.ApplicantName
		}
	case "no_show":
		actionName = "บันทึกไม่มาตามนัดหมาย"
	case "lease_applied":
		actionName = "ยื่นคำร้องขอเช่าแผงค้า"
		actorRole = "tenant"
		actorName = booking.ApplicantName
	case "completed":
		actionName = "อนุมัติสัญญาเช่าแผงค้าสำเร็จ"
		actorName = "ผู้อำนวยการสำนักตลาด"
	}

	note := strings.TrimSpace(req.Reason)
	if note == "" {
		note = strings.TrimSpace(req.RejectionReason)
	}
	if note == "" {
		note = strings.TrimSpace(req.Note)
	}
	if note == "" {
		note = strings.TrimSpace(req.OfficerNotes)
	}
	if req.Status == "rejected" || req.Status == "cancelled" || req.Status == "not_interested" || req.Status == "no_show" {
		if strings.TrimSpace(req.RejectionReason) != "" && strings.TrimSpace(req.OfficerNotes) != "" && req.RejectionReason != req.OfficerNotes {
			booking.RejectionReason = fmt.Sprintf("%s (%s)", strings.TrimSpace(req.RejectionReason), strings.TrimSpace(req.OfficerNotes))
		} else if note != "" {
			booking.RejectionReason = note
		}
		if booking.RejectionReason != "" {
			booking.Note = booking.RejectionReason
		}
	}

	appendTimeline(booking, responses.TimelineItem{
		Action:    actionName,
		ActorRole: actorRole,
		ActorName: actorName,
		Timestamp: time.Now().Format("2006-01-02T15:04:05Z07:00"),
		Note:      note,
	})

	if err := u.repo.Update(booking); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toBookingResponse(booking)
	return &res, nil
}

func (u *useCase) UpdateVisit(id int, actorID int, actorRole string, visitDate string, visitTime string) (*responses.BookingResponse, error) {
	booking, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลการจอง")
		}
		return nil, responses.NewInternalServerError()
	}
	if !canManageBookings(actorRole) && (booking.CreatedBy == nil || *booking.CreatedBy != actorID) {
		return nil, responses.NewAppErr(http.StatusForbidden, "คุณไม่มีสิทธิ์เปลี่ยนวันนัดหมายของรายการนี้")
	}
	if visitDate == "" || visitTime == "" {
		return nil, responses.NewAppErr(http.StatusUnprocessableEntity, "กรุณาระบุวันและเวลานัดหมาย")
	}

	booking.VisitDate = visitDate
	booking.VisitTime = visitTime
	booking.BookingStatus = "pending_approval"
	booking.UpdatedBy = &actorID

	appendTimeline(booking, responses.TimelineItem{
		Action:    "เลือกวัน-เวลานัดหมายเข้าชมแผง",
		ActorRole: actorRole,
		ActorName: booking.ApplicantName,
		Timestamp: time.Now().Format("2006-01-02T15:04:05Z07:00"),
		Note:      fmt.Sprintf("เปลี่ยนรอบนัดหมายเป็นวันที่ %s รอบเวลา %s", visitDate, visitTime),
	})
	if err := u.repo.Update(booking); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toBookingResponse(booking)
	return &res, nil
}

func (u *useCase) ClearAll(actorRole string) error {
	if err := u.repo.ClearAll(); err != nil {
		logs.Error(err)
		return responses.NewInternalServerError()
	}
	return nil
}
