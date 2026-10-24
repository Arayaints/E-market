package usecases

import (
	"errors"
	"fmt"
	"net/http"
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

func toBookingResponse(b *models.Booking) responses.BookingResponse {
	return responses.BookingResponse{
		ID:                 b.ID,
		BookingNo:          b.BookingNo,
		BookingNumber:      b.BookingNo,
		StallID:            b.StallID,
		StallIdent:         b.StallIdent,
		StallNumber:        b.StallIdent,
		MarketID:           b.MarketID,
		MarketName:         b.MarketName,
		ProjectName:        b.ProjectName,
		ApplicantName:      b.ApplicantName,
		TenantName:         b.ApplicantName,
		TenantUserID:       b.CreatedBy,
		ApplicantPhone:     b.ApplicantPhone,
		TenantPhone:        b.ApplicantPhone,
		ApplicantEmail:     b.ApplicantEmail,
		BusinessType:       b.BusinessType,
		IntendedBusiness:   b.BusinessType,
		VisitDate:          b.VisitDate,
		VisitTime:          b.VisitTime,
		VisitTimeSlot:      b.VisitTime,
		Note:               b.Note,
		Status:             b.BookingStatus,
		QueueNumber:        b.QueueNumber,
		QueuePosition:      b.QueueNumber,
		HoldingStall:       b.BookingStatus != "waiting_queue" && b.BookingStatus != "rejected" && b.BookingStatus != "cancelled" && b.BookingStatus != "not_interested" && b.BookingStatus != "no_show",
		AppointmentGroupID: b.AppointmentGroupID,
		CreatedAt:          b.CreatedAt,
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

	queueCount, _ := u.repo.CountActiveQueue(req.StallIdent)
	queueNum := int(queueCount) + 1
	hasActiveHolder, err := u.repo.HasActiveHolder(req.StallIdent)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	isQueue := req.IsQueue || hasActiveHolder
	if !isQueue && (req.VisitDate == "" || req.VisitTime == "") {
		return nil, responses.NewAppErr(http.StatusUnprocessableEntity, "กรุณาเลือกวันและเวลานัดหมายเข้าชมแผง")
	}

	bookingNo := fmt.Sprintf("BK-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	booking := models.Booking{
		BookingNo:      bookingNo,
		StallIdent:     req.StallIdent,
		MarketID:       req.MarketID,
		MarketName:     req.MarketName,
		ProjectName:    req.ProjectName,
		ApplicantName:  req.ApplicantName,
		ApplicantPhone: req.ApplicantPhone,
		ApplicantEmail: req.ApplicantEmail,
		BusinessType:   req.BusinessType,
		VisitDate:      req.VisitDate,
		VisitTime:      req.VisitTime,
		Note:           req.Note,
		BookingStatus: func() string {
			if isQueue {
				return "waiting_queue"
			}
			return "pending_approval"
		}(),
		QueueNumber:        queueNum,
		AppointmentGroupID: req.AppointmentGroupID,
	}
	if userID > 0 {
		booking.CreatedBy = &userID
		booking.UpdatedBy = &userID
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

	booking.BookingStatus = req.Status
	booking.UpdatedBy = &userID

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
	if err := u.repo.Update(booking); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toBookingResponse(booking)
	return &res, nil
}
