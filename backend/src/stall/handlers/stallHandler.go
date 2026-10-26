package handlers

import (
	"net/http"
	"strconv"

	"emarket-api/helpers"
	"emarket-api/middlewares"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/stall/domains"
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

// GetStalls godoc
// @Summary ดึงรายการแผงค้าทั้งหมด
// @Tags Stalls
// @ID get-stalls
// @Produce json
// @Param zone_id query int false "Zone ID"
// @Param status query string false "Status (available, reserved, occupied)"
// @Param search query string false "Search keyword"
// @Success 200 {object} responses.Success{data=[]responses.StallResponse}
// @Router /stalls [get]
func (h *Handler) GetStalls(c *gin.Context) {
	var filter requests.StallFilter
	_ = c.ShouldBindQuery(&filter)

	res, err := h.useCase.GetStalls(filter)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetStallByID godoc
// @Summary ดูข้อมูลแผงค้าตาม ID
// @Tags Stalls
// @ID get-stall-by-id
// @Produce json
// @Param id path int true "Stall ID"
// @Success 200 {object} responses.Success{data=responses.StallResponse}
// @Router /stalls/{id} [get]
func (h *Handler) GetStallByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	res, err := h.useCase.GetStallByID(id)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetWaitingQueue godoc
// @Summary ตรวจสอบคิวจองแผง (Waiting Queue) พร้อม PDPA Masking
// @Tags Bookings
// @ID get-waiting-queue
// @Produce json
// @Param ident path string true "Stall Ident (เช่น A-01)"
// @Success 200 {object} responses.WaitingQueueResponse
// @Router /bookings/waiting-queue/{ident} [get]
func (h *Handler) GetWaitingQueue(c *gin.Context) {
	ident := c.Param("ident")
	res, err := h.useCase.GetWaitingQueue(ident)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

// CreateStall godoc
// @Summary สร้างแผงค้าใหม่ (Admin / Staff)
// @Tags Stalls
// @ID create-stall
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body requests.CreateStallRequest true "ข้อมูลแผงค้า"
// @Success 201 {object} responses.Success{data=responses.StallResponse}
// @Router /stalls [post]
func (h *Handler) CreateStall(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	var req requests.CreateStallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.CreateStall(userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, responses.SuccessResponse(res, http.StatusCreated))
}

func (h *Handler) UpdateStall(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	var req requests.UpdateStallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}
	res, err := h.useCase.UpdateStall(id, middlewares.GetUserID(c), req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

func (h *Handler) GetStallHistory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}
	res, err := h.useCase.GetStallHistory(id)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}
