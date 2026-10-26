package usecases

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
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
	monthlyRate := a.MonthlyRate
	if monthlyRate <= 0 {
		monthlyRate = 3600
	}
	periodMonths := a.LeaseTermMonths
	if periodMonths <= 0 {
		periodMonths = 12
	}
	startDate := a.RequestedStartDate
	if startDate == "" {
		startDate = a.CreatedAt.AddDate(0, 0, 7).Format("2006-01-02")
	}
	return responses.ApplicationResponse{
		ID:                    a.ID,
		ApplicationNo:         a.ApplicationNo,
		ApplicationNumber:     a.ApplicationNo,
		StallID:               a.StallID,
		MarketID:              a.MarketID,
		StallIdent:            a.StallIdent,
		StallNumber:           a.StallIdent,
		ApplicantName:         a.ApplicantName,
		TenantName:            a.ApplicantName,
		ApplicantPhone:        a.ApplicantPhone,
		TenantPhone:           a.ApplicantPhone,
		ApplicantIDCard:       a.ApplicantIDCard,
		ApplicantEmail:        a.ApplicantEmail,
		ApplicantAddress:      a.ApplicantAddress,
		ShopName:              a.ShopName,
		ProductCategory:       a.ProductCategory,
		ProductType:           a.ProductCategory,
		RequestedStartDate:    startDate,
		LeaseTermMonths:       periodMonths,
		RequestedPeriodMonths: periodMonths,
		MonthlyRate:           monthlyRate,
		StallMonthlyRate:      monthlyRate,
		Status:                a.ApplicationState,
		OfficerComment:        a.OfficerComment,
		MarketDirectorComment: a.MarketDirectorComment,
		BureauDirectorComment: a.BureauDirectorComment,
		ReviewedAt:            a.ReviewedAt,
		ReviewNote:            a.ReviewNote,
		CreatedAt:             a.CreatedAt,
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
	stallIdent := strings.TrimSpace(req.StallIdent)
	if stallIdent == "" {
		stallIdent = strings.TrimSpace(req.StallNumber)
	}
	if stallIdent == "" {
		return nil, responses.NewAppErr(http.StatusUnprocessableEntity, "กรุณาระบุรหัสแผงค้า")
	}
	applicantName := strings.TrimSpace(req.ApplicantName)
	if applicantName == "" {
		applicantName = strings.TrimSpace(req.TenantName)
	}
	applicantPhone := strings.TrimSpace(req.ApplicantPhone)
	if applicantPhone == "" {
		applicantPhone = strings.TrimSpace(req.TenantPhone)
	}
	if applicantName == "" || applicantPhone == "" {
		return nil, responses.NewAppErr(http.StatusUnprocessableEntity, "กรุณาระบุชื่อและเบอร์โทรศัพท์ผู้ยื่นคำร้อง")
	}
	idCard := strings.TrimSpace(req.ApplicantIDCard)
	if idCard == "" {
		idCard = strings.TrimSpace(req.IDCard)
	}
	address := strings.TrimSpace(req.ApplicantAddress)
	if address == "" {
		address = strings.TrimSpace(req.Address)
	}
	productCategory := strings.TrimSpace(req.ProductCategory)
	if productCategory == "" {
		productCategory = strings.TrimSpace(req.ProductType)
	}
	if productCategory == "" {
		productCategory = "สินค้าทั่วไป"
	}
	shopName := strings.TrimSpace(req.ShopName)
	if shopName == "" {
		shopName = applicantName
	}
	leaseTerm := req.LeaseTermMonths
	if leaseTerm <= 0 {
		leaseTerm = req.RequestedPeriodMonths
	}
	if leaseTerm <= 0 {
		leaseTerm = 12
	}
	monthlyRate := req.MonthlyRate
	if monthlyRate <= 0 {
		monthlyRate = req.Fee
	}
	if monthlyRate <= 0 {
		monthlyRate = 3600
	}
	startDate := strings.TrimSpace(req.RequestedStartDate)
	if startDate == "" {
		startDate = time.Now().AddDate(0, 0, 7).Format("2006-01-02")
	}

	var parsedStallID *int
	switch v := req.StallID.(type) {
	case float64:
		idVal := int(v)
		parsedStallID = &idVal
	case int:
		idVal := v
		parsedStallID = &idVal
	}

	appNo := fmt.Sprintf("APP-%s-%06d", time.Now().Format("20060102"), time.Now().UnixMicro()%1000000)

	app := models.Application{
		ApplicationNo:      appNo,
		StallID:            parsedStallID,
		StallIdent:         stallIdent,
		ApplicantName:      applicantName,
		ApplicantPhone:     applicantPhone,
		ApplicantIDCard:    idCard,
		ApplicantEmail:     strings.TrimSpace(req.ApplicantEmail),
		ApplicantAddress:   address,
		ShopName:           shopName,
		ProductCategory:    productCategory,
		RequestedStartDate: startDate,
		LeaseTermMonths:    leaseTerm,
		MonthlyRate:        monthlyRate,
		ApplicationState:   "pending_officer",
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
	if req.Reason != "" {
		app.ReviewNote = req.Reason
	}
	if req.OfficerComment != "" {
		app.OfficerComment = req.OfficerComment
	}
	if req.MarketDirectorComment != "" {
		app.MarketDirectorComment = req.MarketDirectorComment
	}
	if req.BureauDirectorComment != "" {
		app.BureauDirectorComment = req.BureauDirectorComment
	}
	app.ReviewedAt = &now
	app.UpdatedBy = &userID

	if err := u.repo.Update(app); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	if app.StallIdent != "" {
		if req.Status == "approved" {
			_ = u.repo.UpdateStallStatus(app.StallIdent, "occupied")
		} else if req.Status == "rejected" {
			_ = u.repo.UpdateStallStatus(app.StallIdent, "available")
		}
	}

	res := toApplicationResponse(app)
	return &res, nil
}

func (u *useCase) Action(id int, userID int, req requests.ApplicationActionRequest) (*responses.ApplicationResponse, error) {
	app, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลคำร้อง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	comment := strings.TrimSpace(req.Comment)
	if comment == "" {
		comment = strings.TrimSpace(req.Reason)
	}

	updateReq := requests.UpdateApplicationStatusRequest{
		Reason: comment,
	}

	if strings.ToLower(req.Action) == "reject" {
		updateReq.Status = "rejected"
		updateReq.OfficerComment = comment
	} else if req.Status != "" {
		updateReq.Status = req.Status
	} else if comment != "" {
		// Step-by-step approval workflow matching ApplicationMain.vue (Officer -> Market Director -> Bureau Director -> Approved)
		switch app.ApplicationState {
		case "pending_officer":
			updateReq.Status = "pending_market_director"
			updateReq.OfficerComment = comment
		case "pending_market_director":
			updateReq.Status = "pending_bureau_director"
			updateReq.MarketDirectorComment = comment
		case "pending_bureau_director":
			updateReq.Status = "approved"
			updateReq.BureauDirectorComment = comment
		default:
			updateReq.Status = "approved"
		}
	} else {
		updateReq.Status = "approved"
	}

	return u.UpdateStatus(id, userID, updateReq)
}
