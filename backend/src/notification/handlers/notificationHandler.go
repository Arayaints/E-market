package handlers

import (
	"net/http"
	"strconv"

	"emarket-api/middlewares"
	"emarket-api/models"
	"emarket-api/responses"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) scopedQuery(c *gin.Context) *gorm.DB {
	role := middlewares.GetUserRole(c)
	query := h.db.Model(&models.Notification{})
	if role == "tenant" {
		return query.Where("recipient_role = ? AND recipient_user_id = ?", "tenant", middlewares.GetUserID(c))
	}
	return query.Where("recipient_role = ?", "officer")
}

func (h *Handler) GetNotifications(c *gin.Context) {
	var items []models.Notification
	if err := h.scopedQuery(c).Order("id DESC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, responses.FailRespone(responses.NewInternalServerError()))
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(items, http.StatusOK))
}

func (h *Handler) MarkRead(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.FailRespone(responses.NewAppErr(http.StatusBadRequest, "ID การแจ้งเตือนไม่ถูกต้อง")))
		return
	}
	result := h.scopedQuery(c).Where("id = ?", id).Update("is_read", true)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, responses.FailRespone(responses.NewInternalServerError()))
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, responses.FailRespone(responses.NewAppErr(http.StatusNotFound, "ไม่พบการแจ้งเตือน")))
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(gin.H{"id": id, "is_read": true}, http.StatusOK))
}

func (h *Handler) MarkAllRead(c *gin.Context) {
	if err := h.scopedQuery(c).Where("is_read = ?", false).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, responses.FailRespone(responses.NewInternalServerError()))
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(gin.H{"is_read": true}, http.StatusOK))
}
