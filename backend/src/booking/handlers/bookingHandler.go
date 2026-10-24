package handlers

import (
	"net/http"
	"strconv"

	"emarket-api/helpers"
	"emarket-api/middlewares"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/booking/domains"
	"github.com/gin-gonic/gin"
	"gopkg.in/validator.v2"
)

type Handler struct {
	useCase domains.UseCase
}

func NewHandler(uc domains.UseCase) *Handler {
	return &Handler{useCase: uc}
}

func respondError(c *gin.Context, err error) {
	if appErr, ok := err.(*responses.AppErr); ok {
		if len(appErr.Fields) > 0 {
			c.JSON(appErr.StatusCode, responses.ValidateResponse(appErr.Fields))
			return
		}
		c.JSON(appErr.StatusCode, responses.FailRespone(appErr))
		return
	}
	c.JSON(http.StatusBadRequest, responses.FailRespone(err))
}

// GetBookings godoc
// @Summary ดึงรายการการจองทั้งหมด
// @Tags Bookings
// @ID get-bookings
// @Produce json
// @Param stall_ident query string false "Stall ident"
// @Param status query string false "Status"
// @Param search query string false "Search keyword"
// @Success 200 {object} responses.Success{data=[]responses.BookingResponse}
// @Router /bookings [get]
func (h *Handler) GetBookings(c *gin.Context) {
	var filter requests.BookingFilter
	_ = c.ShouldBindQuery(&filter)

	res, err := h.useCase.GetBookings(filter, middlewares.GetUserID(c), middlewares.GetUserRole(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetBookingByID godoc
// @Summary ดูรายละเอียดการจองตาม ID
// @Tags Bookings
// @ID get-booking-by-id
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} responses.Success{data=responses.BookingResponse}
// @Router /bookings/{id} [get]
func (h *Handler) GetBookingByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	res, err := h.useCase.GetBookingByID(id, middlewares.GetUserID(c), middlewares.GetUserRole(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// CreateBooking godoc
// @Summary สร้างคำขอจองแผงค้าใหม่ (ผู้เช่า / บุคคลทั่วไป)
// @Tags Bookings
// @ID create-booking
// @Accept json
// @Produce json
// @Param body body requests.CreateBookingRequest true "ข้อมูลการจอง"
// @Success 201 {object} responses.Success{data=responses.BookingResponse}
// @Router /bookings [post]
func (h *Handler) CreateBooking(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	if middlewares.GetUserRole(c) != "tenant" {
		respondError(c, responses.NewAppErr(http.StatusForbidden, "เฉพาะบัญชีผู้เช่าเท่านั้นที่สร้างรายการจองได้"))
		return
	}
	var req requests.CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.CreateBooking(userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, responses.SuccessResponse(res, http.StatusCreated))
}

// UpdateBookingStatus godoc
// @Summary อัปเดตสถานะการจอง (อนุมัติ / ปฏิเสธ)
// @Tags Bookings
// @ID update-booking-status
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Param body body requests.UpdateBookingStatusRequest true "ข้อมูลสถานะ"
// @Success 200 {object} responses.Success{data=responses.BookingResponse}
// @Router /bookings/{id}/status [patch]
func (h *Handler) UpdateBookingStatus(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	var req requests.UpdateBookingStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.UpdateStatus(id, userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}
