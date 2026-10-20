package requests

type StallFilter struct {
	ZoneID int    `form:"zone_id"`
	Status string `form:"status"`
	Search string `form:"search"`
	Page   string `form:"page"`
	Limit  string `form:"limit"`
}

type CreateStallRequest struct {
	ZoneID             int     `json:"zone_id"`
	Ident              string  `json:"ident" validate:"nonzero"`
	Name               string  `json:"name"`
	Width              float64 `json:"width" validate:"nonzero"`
	Depth              float64 `json:"depth" validate:"nonzero"`
	DailyRent          float64 `json:"daily_rent"`
	MonthlyRent        float64 `json:"monthly_rent"`
	Floor              string  `json:"floor"`
	CoordinatesGeoJSON string  `json:"coordinates_geojson"`
}
