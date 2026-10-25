package responses

import "time"

type StallResponse struct {
	ID                 int       `json:"id"`
	MarketID           int       `json:"market_id"`
	MarketSlug         string    `json:"market_slug,omitempty"`
	MarketName         string    `json:"market_name,omitempty"`
	ZoneID             int       `json:"zone_id"`
	ZoneName           string    `json:"zone_name,omitempty"`
	ProjectName        string    `json:"project_name,omitempty"`
	Ident              string    `json:"ident"`
	StallIdent         string    `json:"stall_ident"`
	StallNumber        string    `json:"stall_number"`
	Name               string    `json:"name"`
	Width              float64   `json:"width"`
	Depth              float64   `json:"depth"`
	AreaSqm            float64   `json:"area_sqm"`
	DailyRent          float64   `json:"daily_rent"`
	MonthlyRent        float64   `json:"monthly_rent"`
	Status             string    `json:"status"`
	StallStatus        string    `json:"stall_status"`
	Floor              string    `json:"floor"`
	CoordinatesGeoJSON string    `json:"coordinates_geojson,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type WaitingQueueResponse struct {
	StallIdent          string  `json:"stall_ident"`
	QueueCount          int     `json:"queue_count"`
	CurrentPosition     int     `json:"current_position"`
	MaskedCurrentBooker string  `json:"masked_current_booker"`
	MaskedBookerPhone   string  `json:"masked_booker_phone"`
	ActiveHolderStatus  string  `json:"active_holder_status,omitempty"`
	Status              string  `json:"status"`
	ExpiresAt           *string `json:"expires_at,omitempty"`
}
