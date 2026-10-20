package handlers

import (
	"net/http"

	"emarket-api/helpers"
	"emarket-api/middlewares"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/auth/domains"
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

// Login godoc
// @Summary เข้าสู่ระบบ (Login)
// @Tags Auth
// @ID auth-login
// @Accept json
// @Produce json
// @Param body body requests.LoginRequest true "ข้อมูลเข้าสู่ระบบ"
// @Success 200 {object} responses.Success{data=responses.LoginResponse}
// @Router /auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req requests.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.Login(req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetProfile godoc
// @Summary ดูข้อมูลโปรไฟล์ส่วนตัว
// @Tags Auth
// @ID auth-me
// @Security BearerAuth
// @Produce json
// @Success 200 {object} responses.Success{data=responses.UserResponse}
// @Router /auth/me [get]
func (h *Handler) GetProfile(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	res, err := h.useCase.GetProfile(userID)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}
