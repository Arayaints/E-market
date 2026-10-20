package handlers

import (
	"net/http"
	"strconv"

	"emarket-api/constants"
	"emarket-api/helpers"
	"emarket-api/middlewares"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/item/domains"
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

// GetItems godoc
// @Summary รายการ Item แบบ Datatable
// @Tags Items
// @ID item-datatable
// @Security BearerAuth
// @Produce json
// @Param project_id query int false "Project ID"
// @Param search query string false "Search keyword"
// @Param page query int false "Page number"
// @Param limit query int false "Page size"
// @Success 200 {object} responses.Success{data=responses.Pagination}
// @Router /items/datatable [get]
func (h *Handler) GetItems(c *gin.Context) {
	var filter requests.ItemFilter
	_ = c.ShouldBindQuery(&filter)

	res, err := h.useCase.GetItems(filter)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// GetItemByID godoc
// @Summary ดูรายละเอียด Item ตาม ID
// @Tags Items
// @ID get-item-by-id
// @Security BearerAuth
// @Produce json
// @Param id path int true "Item ID"
// @Success 200 {object} responses.Success{data=responses.ItemResponse}
// @Router /items/{id} [get]
func (h *Handler) GetItemByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	res, err := h.useCase.GetItemByID(id)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// CreateItem godoc
// @Summary สร้าง Item ใหม่
// @Tags Items
// @ID create-item
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param body body requests.CreateItemRequest true "ข้อมูล Item"
// @Success 201 {object} responses.Success{data=responses.ItemResponse}
// @Router /items [post]
func (h *Handler) CreateItem(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	var req requests.CreateItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.CreateItem(userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusCreated, responses.SuccessResponse(res, http.StatusCreated))
}

// UpdateItem godoc
// @Summary แก้ไขข้อมูล Item
// @Tags Items
// @ID update-item
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "Item ID"
// @Param body body requests.UpdateItemRequest true "ข้อมูลที่ต้องการแก้ไข"
// @Success 200 {object} responses.Success{data=responses.ItemResponse}
// @Router /items/{id} [put]
func (h *Handler) UpdateItem(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	var req requests.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, err)
		return
	}
	if err := validator.Validate(req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, responses.ValidateResponse(helpers.ConverstError(err)))
		return
	}

	res, err := h.useCase.UpdateItem(id, userID, req)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(res, http.StatusOK))
}

// DeleteItem godoc
// @Summary ลบ Item (Soft Delete)
// @Tags Items
// @ID delete-item
// @Security BearerAuth
// @Produce json
// @Param id path int true "Item ID"
// @Success 200 {object} responses.Success{data=string}
// @Router /items/{id} [delete]
func (h *Handler) DeleteItem(c *gin.Context) {
	userID := middlewares.GetUserID(c)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		respondError(c, responses.NewAppErr(http.StatusBadRequest, "ID ไม่ถูกต้อง"))
		return
	}

	if err := h.useCase.DeleteItem(id, userID); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, responses.SuccessResponse(constants.SUCCESS, http.StatusOK))
}
