package requests

type StallFilter struct {
	MarketID int    `form:"market_id"`
	Market   string `form:"market"`
	Slug     string `form:"slug"`
	ZoneID   int    `form:"zone_id"`
	Status   string `form:"status"`
	Search   string `form:"search"`
	Page     string `form:"page"`
	Limit    string `form:"limit"`
}

type CreateStallRequest struct {
	MarketID           int     `json:"market_id"`
	MarketSlug         string  `json:"market_slug"`
	MarketName         string  `json:"market_name"`
	ZoneID             int     `json:"zone_id"`
	ZoneName           string  `json:"zone_name"`
	ProjectName        string  `json:"project_name"`
	Ident              string  `json:"ident" validate:"nonzero"`
	Name               string  `json:"name"`
	Description        string  `json:"description"`
	Category           string  `json:"category"`
	Width              float64 `json:"width" validate:"nonzero"`
	Depth              float64 `json:"depth" validate:"nonzero"`
	DailyRent          float64 `json:"daily_rent"`
	MonthlyRent        float64 `json:"monthly_rent"`
	StallStatus        string  `json:"stall_status"`
	Floor              string  `json:"floor"`
	CoordinatesGeoJSON string  `json:"coordinates_geojson"`
	Published          bool    `json:"published"`
}

type UpdateStallRequest struct {
	MarketID           int     `json:"market_id"`
	MarketSlug         string  `json:"market_slug"`
	MarketName         string  `json:"market_name"`
	ZoneID             int     `json:"zone_id"`
	ZoneName           string  `json:"zone_name"`
	ProjectName        string  `json:"project_name"`
	Ident              string  `json:"ident" validate:"nonzero"`
	Name               string  `json:"name"`
	Description        string  `json:"description"`
	Category           string  `json:"category"`
	Width              float64 `json:"width" validate:"nonzero"`
	Depth              float64 `json:"depth" validate:"nonzero"`
	DailyRent          float64 `json:"daily_rent"`
	MonthlyRent        float64 `json:"monthly_rent"`
	StallStatus        string  `json:"stall_status"`
	Floor              string  `json:"floor"`
	CoordinatesGeoJSON string  `json:"coordinates_geojson"`
	Published          bool    `json:"published"`
}
