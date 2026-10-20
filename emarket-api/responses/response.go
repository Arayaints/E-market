package responses

import (
	"net/http"

	"emarket-api/constants"
)

type Success struct {
	Status bool `json:"status"`
	Code   int  `json:"code"`
	Data   any  `json:"data"`
}

type Fail struct {
	Status bool      `json:"status"`
	Code   int       `json:"code"`
	Error  FailError `json:"error"`
}

type FailError struct {
	Message string `json:"message"`
	Field   any    `json:"field"`
}

type Pagination struct {
	CurrentPage  int64 `json:"current_page"`
	NextPage     int64 `json:"next_page"`
	PreviousPage int64 `json:"previous_page"`
	SizePerPage  int64 `json:"size_per_page"`
	TotalPages   int64 `json:"total_pages"`
	TotalItems   int64 `json:"total_items"`
	Items        any   `json:"items"`
}

type AppErr struct {
	StatusCode int
	Message    string
	Fields     map[string]string
}

func (e *AppErr) Error() string {
	return e.Message
}

func NewAppErr(statusCode int, message string) *AppErr {
	return &AppErr{
		StatusCode: statusCode,
		Message:    message,
		Fields:     map[string]string{},
	}
}

func NewValidateErr(fields map[string]string) *AppErr {
	return &AppErr{
		StatusCode: http.StatusUnprocessableEntity,
		Message:    constants.VALIDATE_ERROR,
		Fields:     fields,
	}
}

func NewInternalServerError() *AppErr {
	return &AppErr{
		StatusCode: http.StatusInternalServerError,
		Message:    constants.INTERNAL_SERVER_ERROR,
		Fields:     map[string]string{},
	}
}

func SuccessResponse(data any, code int) Success {
	return Success{
		Status: true,
		Code:   code,
		Data:   data,
	}
}

func FailRespone(err error) Fail {
	statusCode := http.StatusBadRequest
	message := err.Error()

	if appErr, ok := err.(*AppErr); ok {
		statusCode = appErr.StatusCode
		message = appErr.Message
	}

	return Fail{
		Status: false,
		Code:   statusCode,
		Error: FailError{
			Message: message,
			Field:   map[string]string{},
		},
	}
}

func ValidateResponse(fields map[string]string) Fail {
	return Fail{
		Status: false,
		Code:   http.StatusUnprocessableEntity,
		Error: FailError{
			Message: constants.VALIDATE_ERROR,
			Field:   fields,
		},
	}
}
