package responses

import "time"

type StallResponse struct {
	ID                 int       `json:"id"`
	ZoneID             int       `json:"zone_id"`
	Ident              string    `json:"ident"`
	Name               string    `json:"name"`
	Width              float64   `json:"width"`
	Depth              float64   `json:"depth"`
	AreaSqm            float64   `json:"area_sqm"`
	DailyRent          float64   `json:"daily_rent"`
	MonthlyRent        float64   `json:"monthly_rent"`
	Status             string    `json:"status"`
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
	Status              string  `json:"status"`
	ExpiresAt           *string `json:"expires_at,omitempty"`
}
