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
	"emarket-api/src/contract/domains"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func toContractResponse(c *models.Contract) responses.ContractResponse {
	return responses.ContractResponse{
		ID:              c.ID,
		ContractNumber:  c.ContractNumber,
		ApplicationID:   c.ApplicationID,
		StallID:         c.StallID,
		StallIdent:      c.StallIdent,
		TenantName:      c.TenantName,
		TenantPhone:     c.TenantPhone,
		TenantIDCard:    c.TenantIDCard,
		ShopName:        c.ShopName,
		StartDate:       c.StartDate,
		EndDate:         c.EndDate,
		MonthlyRental:   c.MonthlyRental,
		SecurityDeposit: c.SecurityDeposit,
		Status:          c.ContractState,
		CreatedAt:       c.CreatedAt,
	}
}

func (u *useCase) GetContracts(filter requests.ContractFilter) ([]responses.ContractResponse, error) {
	contracts, err := u.repo.FindAll(filter)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	res := make([]responses.ContractResponse, len(contracts))
	for i, c := range contracts {
		res[i] = toContractResponse(&c)
	}
	return res, nil
}

func (u *useCase) GetContractByID(id int) (*responses.ContractResponse, error) {
	contract, err := u.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลสัญญา")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toContractResponse(contract)
	return &res, nil
}

func (u *useCase) CreateContract(userID int, req requests.CreateContractRequest) (*responses.ContractResponse, error) {
	contractNo := fmt.Sprintf("CTR-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	var appID *int
	if req.ApplicationID > 0 {
		appID = &req.ApplicationID
	}

	contract := models.Contract{
		ContractNumber:  contractNo,
		ApplicationID:   appID,
		StallIdent:      req.StallIdent,
		TenantName:      req.TenantName,
		TenantPhone:     req.TenantPhone,
		TenantIDCard:    req.TenantIDCard,
		ShopName:        req.ShopName,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		MonthlyRental:   req.MonthlyRental,
		SecurityDeposit: req.SecurityDeposit,
		ContractState:   "active",
	}
	if userID > 0 {
		contract.CreatedBy = &userID
		contract.UpdatedBy = &userID
	}

	if err := u.repo.Create(&contract); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	// Update stall status to occupied
	_ = u.repo.UpdateStallStatus(req.StallIdent, "occupied")

	res := toContractResponse(&contract)
	return &res, nil
}
