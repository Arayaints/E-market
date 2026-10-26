package requests

import "encoding/json"

type UpdateMarketGISRequest struct {
	Projects   json.RawMessage `json:"projects"`
	Facilities json.RawMessage `json:"facilities"`
	Published  bool            `json:"published"`
}
