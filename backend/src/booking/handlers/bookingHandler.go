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

func (h *Handler) transition(c *gin.Context, status string, officerOnly bool) {
	role := middlewares.GetUserRole(c)
	if officerOnly && role != "admin" && role != "staff" {
		respondError(c, responses.NewAppErr(http.StatusForbidden, "เฉพาะเจ้าหน้าที่เท่านั้นที่ดำเนินการนี้ได้"))
		return
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	if !officerOnly && role != "admin" && role != "staff" {
		if _, err := h.useCase.GetBookingByID(id, middlewares.GetUserID(c), role); err != nil {
			respondError(c, err)
			return
		}
	}
	var body struct {
		Reason          string `json:"reason"`
		RejectionReason string `json:"rejection_reason"`
		OfficerNotes    string `json:"officer_notes"`
	}
	_ = c.ShouldBindJSON(&body)
	reason := body.Reason
	if reason == "" {
		reason = body.RejectionReason
	}
	if reason == "" {
		reason = body.OfficerNotes
	}
	res, err := h.useCase.UpdateStatus(id, middlewares.GetUserID(c), requests.UpdateBookingStatusRequest{
		Status: status,
		Reason: reason,
	})
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

func (h *Handler) Approve(c *gin.Context) {
	h.transition(c, "approved", true)
}

func (h *Handler) Reject(c *gin.Context) {
	h.transition(c, "rejected", true)
}

func (h *Handler) MarkVisited(c *gin.Context) {
	h.transition(c, "interested", true)
}

func (h *Handler) NoShow(c *gin.Context) {
	h.transition(c, "no_show", true)
}

func (h *Handler) Cancel(c *gin.Context) {
	h.transition(c, "cancelled", false)
}

func (h *Handler) Decide(c *gin.Context) {
	var body struct {
		Decision string `json:"decision"`
		Reason   string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&body)
	targetStatus := "not_interested"
	if body.Decision == "interested" {
		targetStatus = "interested"
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	role := middlewares.GetUserRole(c)
	if role != "admin" && role != "staff" {
		if _, err := h.useCase.GetBookingByID(id, middlewares.GetUserID(c), role); err != nil {
			respondError(c, err)
			return
		}
	}
	res, err := h.useCase.UpdateStatus(id, middlewares.GetUserID(c), requests.UpdateBookingStatusRequest{
		Status: targetStatus,
		Reason: body.Reason,
	})
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

func (h *Handler) OfficerRecordProxy(c *gin.Context) {
	role := middlewares.GetUserRole(c)
	if role != "admin" && role != "staff" {
		respondError(c, responses.NewAppErr(http.StatusForbidden, "เฉพาะเจ้าหน้าที่เท่านั้นที่ดำเนินการนี้ได้"))
		return
	}
	var body struct {
		Decision string `json:"decision"`
		Reason   string `json:"reason"`
		Notes    string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)
	targetStatus := "not_interested"
	if body.Decision == "interested" {
		targetStatus = "interested"
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	res, err := h.useCase.UpdateStatus(id, middlewares.GetUserID(c), requests.UpdateBookingStatusRequest{
		Status: targetStatus,
		Reason: body.Reason,
	})
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

func (h *Handler) GetVisitCapacity(c *gin.Context) {
	items, err := h.useCase.GetBookings(requests.BookingFilter{}, 1, "admin")
	if err != nil {
		respondError(c, err)
		return
	}
	marketKey := c.Query("market_id")
	type capacityEntry struct {
		MarketID      any    `json:"market_id"`
		MarketName    string `json:"market_name"`
		VisitDate     string `json:"visit_date"`
		VisitTimeSlot string `json:"visit_time_slot"`
		BookedCount   int    `json:"booked_count"`
	}
	counts := map[string]*capacityEntry{}
	for _, b := range items {
		if b.Status != "pending" && b.Status != "pending_approval" && b.Status != "approved" {
			continue
		}
		if b.VisitDate == "" || b.VisitTime == "" {
			continue
		}
		if marketKey != "" && b.MarketID != nil && strconv.Itoa(*b.MarketID) != marketKey {
			continue
		}
		key := b.VisitDate + "__" + b.VisitTime
		entry, exists := counts[key]
		if !exists {
			entry = &capacityEntry{
				MarketID:      b.MarketID,
				MarketName:    b.MarketName,
				VisitDate:     b.VisitDate,
				VisitTimeSlot: b.VisitTime,
				BookedCount:   0,
			}
			counts[key] = entry
		}
		entry.BookedCount++
	}
	result := make([]capacityEntry, 0, len(counts))
	for _, entry := range counts {
		result = append(result, *entry)
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(result, http.StatusOK))
}

func (h *Handler) SelectSlot(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	var body struct {
		VisitDate     string `json:"visit_date"`
		VisitTimeSlot string `json:"visit_time_slot"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		respondError(c, err)
		return
	}
	res, err := h.useCase.UpdateVisit(id, middlewares.GetUserID(c), middlewares.GetUserRole(c), body.VisitDate, body.VisitTimeSlot)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

func (h *Handler) ClearAll(c *gin.Context) {
	if err := h.useCase.ClearAll(middlewares.GetUserRole(c)); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(gin.H{"cleared": true}, http.StatusOK))
}
