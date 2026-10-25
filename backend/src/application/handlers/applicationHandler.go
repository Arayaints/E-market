package handlers

import (
	"net/http"
	"strconv"

	"emarket-api/helpers"
	"emarket-api/middlewares"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/application/domains"
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

// GetApplications godoc
// @Summary ดึงรายการคำร้องขอเช่าแผงทั้งหมด
// @Tags Applications
// @ID get-applications
// @Produce json
// @Param stall_ident query string false "Stall ident"
// @Param status query string false "Status"
// @Param search query string false "Search keyword"
// @Success 200 {object} responses.Success{data=[]responses.ApplicationResponse}
// @Router /applications [get]
func (h *Handler) GetApplications(c *gin.Context) {
	var filter requests.ApplicationFilter
	_ = c.ShouldBindQuery(&filter)

	res, err := h.useCase.GetApplications(filter)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetApplicationByID godoc
// @Summary ดูรายละเอียดคำร้องตาม ID
// @Tags Applications
// @ID get-application-by-id
// @Produce json
// @Param id path int true "Application ID"
// @Success 200 {object} responses.Success{data=responses.ApplicationResponse}
// @Router /applications/{id} [get]
func (h *Handler) GetApplicationByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	res, err := h.useCase.GetApplicationByID(id)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// CreateApplication godoc
// @Summary ยื่นคำร้องขอเช่าแผงค้า (ผู้เช่า)
// @Tags Applications
// @ID create-application
// @Accept json
// @Produce json
// @Param body body requests.CreateApplicationRequest true "ข้อมูลคำร้อง"
// @Success 201 {object} responses.Success{data=responses.ApplicationResponse}
// @Router /applications [post]
func (h *Handler) CreateApplication(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	var req requests.CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}

	res, err := h.useCase.CreateApplication(userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, responses.SuccessResponse(res, http.StatusCreated))
}

// UpdateApplicationStatus godoc
// @Summary อนุมัติ / ปฏิเสธคำร้องขอเช่าแผง (Admin / Staff)
// @Tags Applications
// @ID update-application-status
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param body body requests.UpdateApplicationStatusRequest true "ข้อมูลสถานะ"
// @Success 200 {object} responses.Success{data=responses.ApplicationResponse}
// @Router /applications/{id}/status [patch]
func (h *Handler) UpdateApplicationStatus(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	var req requests.UpdateApplicationStatusRequest
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

// Action godoc
// @Summary ดำเนินการอนุมัติ/ปฏิเสธคำร้อง (Action endpoint)
// @Tags Applications
// @ID application-action
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param body body requests.ApplicationActionRequest true "การดำเนินการ"
// @Success 200 {object} responses.Success{data=responses.ApplicationResponse}
// @Router /applications/{id}/action [post]
func (h *Handler) Action(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	var req requests.ApplicationActionRequest
	_ = c.ShouldBindJSON(&req)

	res, err := h.useCase.Action(id, userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}
