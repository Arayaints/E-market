package helpers

import (
	"math"
	"strconv"

	"emarket-api/responses"
)

func ParsePageAndLimit(pageStr string, limitStr string) (int64, int64) {
	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil || limit < 1 {
		limit = 10
	}

	return page, limit
}

func Pagination(items any, limit int64, page int64, total int64) responses.Pagination {
	totalPages := int64(math.Ceil(float64(total) / float64(limit)))

	var nextPage int64 = 0
	if page < totalPages {
		nextPage = page + 1
	}

	var prevPage int64 = 0
	if page > 1 {
		prevPage = page - 1
	}

	return responses.Pagination{
		CurrentPage:  page,
		NextPage:     nextPage,
		PreviousPage: prevPage,
		SizePerPage:  limit,
		TotalPages:   totalPages,
		TotalItems:   total,
		Items:        items,
	}
}
