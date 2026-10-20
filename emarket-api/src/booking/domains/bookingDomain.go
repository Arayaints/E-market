package domains

import (
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
)

type UseCase interface {
	GetBookings(filter requests.BookingFilter) ([]responses.BookingResponse, error)
	GetBookingByID(id int) (*responses.BookingResponse, error)
	CreateBooking(userID int, req requests.CreateBookingRequest) (*responses.BookingResponse, error)
	UpdateStatus(id int, userID int, req requests.UpdateBookingStatusRequest) (*responses.BookingResponse, error)
}

type Repository interface {
	FindAll(filter requests.BookingFilter) ([]models.Booking, error)
	FindByID(id int) (*models.Booking, error)
	Create(booking *models.Booking) error
	Update(booking *models.Booking) error
	CountActiveQueue(stallIdent string) (int64, error)
	UpdateStallStatus(stallIdent string, status string) error
}
