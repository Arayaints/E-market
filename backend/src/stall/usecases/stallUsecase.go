package usecases

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/stall/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func toStallResponse(s *models.Stall) responses.StallResponse {
	return responses.StallResponse{
		ID:                 s.ID,
		MarketID:           s.MarketID,
		MarketSlug:         s.MarketSlug,
		MarketName:         s.MarketName,
		ZoneID:             s.ZoneID,
		ZoneName:           s.ZoneName,
		ProjectName:        s.ProjectName,
		Ident:              s.Ident,
		StallIdent:         s.Ident,
		StallNumber:        s.Ident,
		Name:               s.Name,
		Description:        s.Description,
		Category:           s.Category,
		Width:              s.Width,
		Depth:              s.Depth,
		AreaSqm:            s.AreaSqm,
		DailyRent:          s.DailyRent,
		MonthlyRent:        s.MonthlyRent,
		Status:             s.StallStatus,
		StallStatus:        s.StallStatus,
		Floor:              s.Floor,
		CoordinatesGeoJSON: s.CoordinatesGeoJSON,
		Published:          s.Published,
		CreatedAt:          s.CreatedAt,
		UpdatedAt:          s.UpdatedAt,
	}
}

func maskPDPAName(name string) string {
	clean := strings.TrimSpace(name)
	for _, prefix := range []string{"นางสาว", "น.ส.", "นาย", "นาง", "คุณ"} {
		if strings.HasPrefix(clean, prefix) {
			clean = strings.TrimSpace(strings.TrimPrefix(clean, prefix))
			break
		}
	}
	parts := strings.Fields(clean)
	if len(parts) == 0 {
		return "คุณ ***"
	}
	firstName := parts[0]
	if len(parts) > 1 {
		lastRunes := []rune(parts[1])
		if len(lastRunes) > 0 {
			return fmt.Sprintf("คุณ%s %s.***", firstName, string(lastRunes[0]))
		}
	}
	firstRunes := []rune(firstName)
	if len(firstRunes) > 3 {
		return fmt.Sprintf("คุณ%s***", string(firstRunes[:3]))
	}
	return fmt.Sprintf("คุณ%s***", firstName)
}

func maskPDPAphone(phone string) string {
	cleaned := strings.ReplaceAll(strings.ReplaceAll(phone, "-", ""), " ", "")
	if len(cleaned) == 10 {
		return fmt.Sprintf("%s-XXX-%s", cleaned[:3], cleaned[6:])
	}
	if len(cleaned) >= 6 {
		return cleaned[:3] + "-XXX-" + cleaned[len(cleaned)-2:]
	}
	return "08X-XXX-XXXX"
}

func (u *useCase) GetStalls(filter requests.StallFilter) ([]responses.StallResponse, error) {
	stalls, err := u.repo.FindAll(filter)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := make([]responses.StallResponse, len(stalls))
	for i, s := range stalls {
		res[i] = toStallResponse(&s)
	}
	return res, nil
}

func (u *useCase) GetStallByID(id int) (*responses.StallResponse, error) {
	stall, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลแผงค้า")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toStallResponse(stall)
	return &res, nil
}

func (u *useCase) GetWaitingQueue(ident string) (*responses.WaitingQueueResponse, error) {
	stallStatus := "available"
	stallIdent := ident

	stall, err := u.repo.ByIdent(ident)
	if err == nil && stall != nil {
		stallStatus = stall.StallStatus
		stallIdent = stall.Ident
	}

	queueCount, err := u.repo.CountQueue(ident)
	if err != nil {
		queueCount = 0
	}

	var maskedName = "-"
	var maskedPhone = "-"
	var activeHolderStatus = ""
	var expiresAtStr *string

	activeBooking, err := u.repo.GetActiveBooking(ident)
	if err == nil && activeBooking != nil {
		maskedName = maskPDPAName(activeBooking.ApplicantName)
		maskedPhone = maskPDPAphone(activeBooking.ApplicantPhone)
		activeHolderStatus = activeBooking.BookingStatus
		if activeBooking.ExpiresAt != nil {
			tStr := activeBooking.ExpiresAt.Format("2006-01-02T15:04:05Z07:00")
			expiresAtStr = &tStr
		}
		if stallStatus == "available" {
			stallStatus = "reserved"
		}
	}

	res := responses.WaitingQueueResponse{
		StallIdent:          stallIdent,
		QueueCount:          int(queueCount),
		CurrentPosition:     int(queueCount) + 1,
		MaskedCurrentBooker: maskedName,
		MaskedBookerPhone:   maskedPhone,
		ActiveHolderStatus:  activeHolderStatus,
		Status:              stallStatus,
		ExpiresAt:           expiresAtStr,
	}
	return &res, nil
}

func (u *useCase) CreateStall(userID int, req requests.CreateStallRequest) (*responses.StallResponse, error) {
	area := req.Width * req.Depth
	initialStatus := req.StallStatus
	if initialStatus == "" {
		initialStatus = "available"
	}
	stall := models.Stall{
		MarketID:           req.MarketID,
		MarketSlug:         req.MarketSlug,
		MarketName:         req.MarketName,
		ZoneID:             req.ZoneID,
		ZoneName:           req.ZoneName,
		ProjectName:        req.ProjectName,
		Ident:              req.Ident,
		Name:               req.Name,
		Description:        req.Description,
		Category:           req.Category,
		Width:              req.Width,
		Depth:              req.Depth,
		AreaSqm:            area,
		DailyRent:          req.DailyRent,
		MonthlyRent:        req.MonthlyRent,
		Floor:              req.Floor,
		CoordinatesGeoJSON: req.CoordinatesGeoJSON,
		Published:          req.Published,
		StallStatus:        initialStatus,
		CreatedBy:          &userID,
		UpdatedBy:          &userID,
	}

	if err := u.repo.Create(&stall); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toStallResponse(&stall)
	return &res, nil
}

func (u *useCase) UpdateStall(id int, userID int, req requests.UpdateStallRequest) (*responses.StallResponse, error) {
	stall, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลแผงค้า")
		}
		return nil, responses.NewInternalServerError()
	}
	stall.MarketID, stall.MarketSlug, stall.MarketName = req.MarketID, req.MarketSlug, req.MarketName
	stall.ZoneID, stall.ZoneName, stall.ProjectName = req.ZoneID, req.ZoneName, req.ProjectName
	stall.Ident, stall.Name, stall.Description, stall.Category = req.Ident, req.Name, req.Description, req.Category
	stall.Width, stall.Depth, stall.AreaSqm = req.Width, req.Depth, req.Width*req.Depth
	stall.DailyRent, stall.MonthlyRent = req.DailyRent, req.MonthlyRent
	stall.Floor, stall.CoordinatesGeoJSON, stall.Published = req.Floor, req.CoordinatesGeoJSON, req.Published
	if req.StallStatus != "" {
		stall.StallStatus = req.StallStatus
	}
	stall.UpdatedBy = &userID
	if err := u.repo.Update(stall, userID, "แก้ไขข้อมูล ราคา ขนาด หรือตำแหน่งแผง"); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toStallResponse(stall)
	return &res, nil
}

func (u *useCase) GetStallHistory(id int) ([]models.StallAuditLog, error) {
	items, err := u.repo.FindHistory(id)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return items, nil
}
