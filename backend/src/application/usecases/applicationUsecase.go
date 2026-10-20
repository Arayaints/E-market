package usecases

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/application/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func toApplicationResponse(a *models.Application) responses.ApplicationResponse {
	return responses.ApplicationResponse{
		ID:              a.ID,
		ApplicationNo:   a.ApplicationNo,
		StallID:         a.StallID,
		StallIdent:      a.StallIdent,
		ApplicantName:   a.ApplicantName,
		ApplicantPhone:  a.ApplicantPhone,
		ApplicantIDCard: a.ApplicantIDCard,
		ShopName:        a.ShopName,
		ProductCategory: a.ProductCategory,
		LeaseTermMonths: a.LeaseTermMonths,
		MonthlyRate:     a.MonthlyRate,
		Status:          a.ApplicationState,
		ReviewedAt:      a.ReviewedAt,
		ReviewNote:      a.ReviewNote,
		CreatedAt:       a.CreatedAt,
	}
}

func (u *useCase) GetApplications(filter requests.ApplicationFilter) ([]responses.ApplicationResponse, error) {
	apps, err := u.repo.FindAll(filter)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := make([]responses.ApplicationResponse, len(apps))
	for i, a := range apps {
		res[i] = toApplicationResponse(&a)
	}
	return res, nil
}

func (u *useCase) GetApplicationByID(id int) (*responses.ApplicationResponse, error) {
	app, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลคำร้อง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toApplicationResponse(app)
	return &res, nil
}

func (u *useCase) CreateApplication(userID int, req requests.CreateApplicationRequest) (*responses.ApplicationResponse, error) {
	appNo := fmt.Sprintf("APP-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	app := models.Application{
		ApplicationNo:    appNo,
		StallIdent:       req.StallIdent,
		ApplicantName:    req.ApplicantName,
		ApplicantPhone:   req.ApplicantPhone,
		ApplicantIDCard:  req.ApplicantIDCard,
		ShopName:         req.ShopName,
		ProductCategory:  req.ProductCategory,
		LeaseTermMonths:  req.LeaseTermMonths,
		ApplicationState: "submitted",
	}
	if userID > 0 {
		app.CreatedBy = &userID
		app.UpdatedBy = &userID
	}

	if err := u.repo.Create(&app); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toApplicationResponse(&app)
	return &res, nil
}

func (u *useCase) UpdateStatus(id int, userID int, req requests.UpdateApplicationStatusRequest) (*responses.ApplicationResponse, error) {
	app, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลคำร้อง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	now := time.Now()
	app.ApplicationState = req.Status
	app.ReviewNote = req.Reason
	app.ReviewedAt = &now
	app.UpdatedBy = &userID

	if err := u.repo.Update(app); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := toApplicationResponse(app)
	return &res, nil
}
