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

// RefreshToken godoc
// @Summary ต่ออายุ JWT Token
// @Tags Auth
// @ID auth-refresh-token
// @Accept json
// @Produce json
// @Router /auth/refresh_token [post]
func (h *Handler) RefreshToken(c *gin.Context) {
	var body struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
	_ = c.ShouldBindJSON(&body)

	tokenToValidate := body.AccessToken
	if tokenToValidate == "" {
		tokenToValidate = body.RefreshToken
	}
	if tokenToValidate == "" {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 {
			tokenToValidate = authHeader[7:]
		}
	}

	claims, err := helpers.ValidateToken(tokenToValidate)
	if err != nil || claims == nil {
		c.JSON(http.StatusUnauthorized, responses.FailRespone(responses.NewAppErr(http.StatusUnauthorized, "Refresh token ไม่ถูกต้องหรือหมดอายุ")))
		return
	}
	newToken, tokenErr := helpers.GenerateToken(claims.UserID, claims.Username, claims.Role)
	if tokenErr != nil {
		c.JSON(http.StatusInternalServerError, responses.FailRespone(responses.NewInternalServerError()))
		return
	}

	c.JSON(http.StatusOK, responses.SuccessResponse(gin.H{
		"access_token":  newToken,
		"refresh_token": newToken,
		"token_type":    "bearer",
	}, http.StatusOK))
}
