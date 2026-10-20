package helpers

import (
	"fmt"

	"gopkg.in/validator.v2"
)

// ConverstError แปลง validator.v2 errors เป็น map[field]message
func ConverstError(err error) map[string]string {
	errs, ok := err.(validator.ErrorMap)
	if !ok {
		return map[string]string{"error": err.Error()}
	}
	output := make(map[string]string, len(errs))
	for field, fieldErrs := range errs {
		output[field] = fmt.Sprintf("%v", fieldErrs)
	}
	return output
}

func ParseValidateError(err error) map[string]string {
	return ConverstError(err)
}
