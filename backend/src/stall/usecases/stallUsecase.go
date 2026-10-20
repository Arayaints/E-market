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
		ZoneID:             s.ZoneID,
		Ident:              s.Ident,
		Name:               s.Name,
		Width:              s.Width,
		Depth:              s.Depth,
		AreaSqm:            s.AreaSqm,
		DailyRent:          s.DailyRent,
		MonthlyRent:        s.MonthlyRent,
		Status:             s.StallStatus,
		Floor:              s.Floor,
		CoordinatesGeoJSON: s.CoordinatesGeoJSON,
		CreatedAt:          s.CreatedAt,
		UpdatedAt:          s.UpdatedAt,
	}
}

func maskPDPAName(name string) string {
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "คุณ ***"
	}
	maskedParts := make([]string, len(parts))
	for i, part := range parts {
		runes := []rune(part)
		if len(runes) <= 2 {
			maskedParts[i] = string(runes[0]) + "***"
		} else {
			maskedParts[i] = string(runes[:2]) + "***"
		}
	}
	return "คุณ " + strings.Join(maskedParts, " ")
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
	stall, err := u.repo.ByIdent(ident)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลแผงค้า")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	queueCount, err := u.repo.CountQueue(ident)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	var maskedName = "-"
	var maskedPhone = "-"
	var expiresAtStr *string

	activeBooking, err := u.repo.GetActiveBooking(ident)
	if err == nil && activeBooking != nil {
		maskedName = maskPDPAName(activeBooking.ApplicantName)
		maskedPhone = maskPDPAphone(activeBooking.ApplicantPhone)
		if activeBooking.ExpiresAt != nil {
			tStr := activeBooking.ExpiresAt.Format("2006-01-02T15:04:05Z07:00")
			expiresAtStr = &tStr
		}
	}

	res := responses.WaitingQueueResponse{
		StallIdent:          stall.Ident,
		QueueCount:          int(queueCount),
		CurrentPosition:     int(queueCount) + 1,
		MaskedCurrentBooker: maskedName,
		MaskedBookerPhone:   maskedPhone,
		Status:              stall.StallStatus,
		ExpiresAt:           expiresAtStr,
	}
	return &res, nil
}

func (u *useCase) CreateStall(userID int, req requests.CreateStallRequest) (*responses.StallResponse, error) {
	area := req.Width * req.Depth
	stall := models.Stall{
		ZoneID:             req.ZoneID,
		Ident:              req.Ident,
		Name:               req.Name,
		Width:              req.Width,
		Depth:              req.Depth,
		AreaSqm:            area,
		DailyRent:          req.DailyRent,
		MonthlyRent:        req.MonthlyRent,
		Floor:              req.Floor,
		CoordinatesGeoJSON: req.CoordinatesGeoJSON,
		StallStatus:        "available",
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
