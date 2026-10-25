package usecases

import (
	"errors"
	"net/http"

	"emarket-api/helpers"
	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/auth/domains"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type useCase struct {
	repo domains.Repository
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func toUserResponse(u *models.User) responses.UserResponse {
	return responses.UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		FullName:  u.FullName,
		Role:      u.Role,
		Email:     u.Email,
		Phone:     u.Phone,
		Status:    u.Status,
		CreatedAt: u.CreatedAt,
	}
}

func (u *useCase) Login(req requests.LoginRequest) (*responses.LoginResponse, error) {
	user, err := u.repo.FindByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusUnauthorized, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil && user.Password != req.Password {
		return nil, responses.NewAppErr(http.StatusUnauthorized, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง")
	}

	token, err := helpers.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}

	refreshToken, err := helpers.GenerateRefreshToken(user.ID, user.Username, user.Role)
	if err != nil {
		refreshToken = token
	}

	res := responses.LoginResponse{
		AccessToken:  token,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		Role:         user.Role,
		User:         toUserResponse(user),
	}
	return &res, nil
}

func (u *useCase) GetProfile(userID int) (*responses.UserResponse, error) {
	user, err := u.repo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลผู้ใช้งาน")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	res := toUserResponse(user)
	return &res, nil
}
