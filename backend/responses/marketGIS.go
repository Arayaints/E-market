package responses

import (
	"encoding/json"
	"time"
)

type MarketGISResponse struct {
	MarketID   int             `json:"market_id"`
	Projects   json.RawMessage `json:"projects"`
	Facilities json.RawMessage `json:"facilities"`
	Published  bool            `json:"published"`
	UpdatedBy  *int            `json:"updated_by"`
	UpdatedAt  time.Time       `json:"updated_at"`
}
