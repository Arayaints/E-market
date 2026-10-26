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
	Description        string    `json:"description"`
	Category           string    `json:"category"`
	Width              float64   `json:"width"`
	Depth              float64   `json:"depth"`
	AreaSqm            float64   `json:"area_sqm"`
	DailyRent          float64   `json:"daily_rent"`
	MonthlyRent        float64   `json:"monthly_rent"`
	Status             string     `json:"status"`
	StallStatus        string     `json:"stall_status"`
	WaitlistCount      int        `json:"waitlist_count"`
	OfferedToTenantID  int        `json:"offered_to_tenant_id,omitempty"`
	OfferedExpiresAt   *time.Time `json:"offered_expires_at,omitempty"`
	Floor              string     `json:"floor"`
	CoordinatesGeoJSON string     `json:"coordinates_geojson,omitempty"`
	Published          bool       `json:"published"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type WaitingQueueItem struct {
	ID               int        `json:"id"`
	Position         int        `json:"position"`
	QueueNumber      int        `json:"queue_number"`
	QueuePosition    int        `json:"queue_position"`
	TenantID         int        `json:"tenant_id"`
	TenantName       string     `json:"tenant_name"`
	MaskedName       string     `json:"masked_name"`
	TenantPhone      string     `json:"tenant_phone"`
	MaskedPhone      string     `json:"masked_phone"`
	Status           string     `json:"status"`
	OfferedAt        *time.Time `json:"offered_at,omitempty"`
	ExpiresAt        *time.Time `json:"expires_at,omitempty"`
	RemainingSeconds int64      `json:"remaining_seconds"`
	CreatedAt        time.Time  `json:"created_at"`
}

type WaitingQueueResponse struct {
	StallIdent          string             `json:"stall_ident"`
	QueueCount          int                `json:"queue_count"`
	CurrentPosition     int                `json:"current_position"`
	MaskedCurrentBooker string             `json:"masked_current_booker"`
	CurrentBookerName   string             `json:"current_booker_name,omitempty"`
	MaskedBookerPhone   string             `json:"masked_booker_phone"`
	CurrentBookerPhone  string             `json:"current_booker_phone,omitempty"`
	ActiveHolderStatus  string             `json:"active_holder_status,omitempty"`
	Status              string             `json:"status"`
	OfferedAt           *string            `json:"offered_at,omitempty"`
	ExpiresAt           *string            `json:"expires_at,omitempty"`
	RemainingSeconds    int64              `json:"remaining_seconds"`
	Queues              []WaitingQueueItem `json:"queues"`
}
