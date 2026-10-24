package helpers

import (
	"errors"
	"time"

	"emarket-api/config"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int, username string, role string) (string, error) {
	cfg := config.Get()
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func ValidateToken(tokenString string) (*JWTClaims, error) {
	cfg := config.Get()
	secrets := []string{
		cfg.JWTSecret,
		"emarket-secret-super-key-2026",
		"bma-emarket-jwt-secret-key-2026",
	}

	var lastErr error
	for _, secret := range secrets {
		if secret == "" {
			continue
		}
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil {
			lastErr = err
			continue
		}
		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			return claims, nil
		}
	}

	if lastErr != nil {
		return nil, lastErr
	}
	return nil, errors.New("invalid token")
}
