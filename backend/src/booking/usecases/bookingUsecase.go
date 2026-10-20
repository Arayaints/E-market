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
		ID:             b.ID,
		BookingNo:      b.BookingNo,
		StallID:        b.StallID,
		StallIdent:     b.StallIdent,
		ApplicantName:  b.ApplicantName,
		ApplicantPhone: b.ApplicantPhone,
		ApplicantEmail: b.ApplicantEmail,
		BusinessType:   b.BusinessType,
		VisitDate:      b.VisitDate,
		VisitTime:      b.VisitTime,
		Note:           b.Note,
		Status:         b.BookingStatus,
		QueueNumber:    b.QueueNumber,
		CreatedAt:      b.CreatedAt,
	}
}

func (u *useCase) GetBookings(filter requests.BookingFilter) ([]responses.BookingResponse, error) {
	bookings, err := u.repo.FindAll(filter)
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

func (u *useCase) GetBookingByID(id int) (*responses.BookingResponse, error) {
	booking, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลการจอง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toBookingResponse(booking)
	return &res, nil
}

func (u *useCase) CreateBooking(userID int, req requests.CreateBookingRequest) (*responses.BookingResponse, error) {
	queueCount, _ := u.repo.CountActiveQueue(req.StallIdent)
	queueNum := int(queueCount) + 1

	bookingNo := fmt.Sprintf("BK-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	booking := models.Booking{
		BookingNo:      bookingNo,
		StallIdent:     req.StallIdent,
		ApplicantName:  req.ApplicantName,
		ApplicantPhone: req.ApplicantPhone,
		ApplicantEmail: req.ApplicantEmail,
		BusinessType:   req.BusinessType,
		VisitDate:      req.VisitDate,
		VisitTime:      req.VisitTime,
		Note:           req.Note,
		BookingStatus:  "pending",
		QueueNumber:    queueNum,
	}
	if userID > 0 {
		booking.CreatedBy = &userID
		booking.UpdatedBy = &userID
	}

	if err := u.repo.Create(&booking); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	// Update stall status to reserved
	_ = u.repo.UpdateStallStatus(req.StallIdent, "reserved")

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
