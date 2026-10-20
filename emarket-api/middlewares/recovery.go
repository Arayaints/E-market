package middlewares

import (
	"fmt"
	"net/http"

	"emarket-api/logs"
	"emarket-api/responses"
	"github.com/gin-gonic/gin"
)

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				err := fmt.Errorf("panic recovered: %v", r)
				logs.Error(err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, responses.FailRespone(responses.NewInternalServerError()))
			}
		}()
		c.Next()
	}
}
