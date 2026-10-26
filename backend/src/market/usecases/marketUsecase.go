package usecases

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"emarket-api/logs"
	"emarket-api/models"
	"emarket-api/requests"
	"emarket-api/responses"
	"emarket-api/src/market/domains"
	"gorm.io/gorm"
)

func resolveMarketJSONPath(slug string) string {
	if slug == "" {
		slug = "chatuchak"
	}
	candidates := []string{
		filepath.Join("..", "frontend", "public", "data", "markets", slug+".json"),
		filepath.Join("frontend", "public", "data", "markets", slug+".json"),
	}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return candidates[0]
}

// syncMarketJSONFile merges incoming projects with the base JSON file in
// frontend/public/data/markets/<slug>.json and writes the unified file back to disk
// so all existing and newly drawn zones/stalls live in the same JSON file.
func syncMarketJSONFile(slug string, incomingProjectsRaw json.RawMessage) json.RawMessage {
	jsonPath := resolveMarketJSONPath(slug)
	rawBytes, err := os.ReadFile(jsonPath)
	if err != nil {
		return incomingProjectsRaw
	}

	var marketDoc map[string]interface{}
	if err := json.Unmarshal(rawBytes, &marketDoc); err != nil {
		return incomingProjectsRaw
	}

	var incomingProjects []map[string]interface{}
	if err := json.Unmarshal(incomingProjectsRaw, &incomingProjects); err != nil {
		return incomingProjectsRaw
	}

	var baseProjects []map[string]interface{}
	if bpRaw, ok := marketDoc["projects"]; ok {
		if bpBytes, err := json.Marshal(bpRaw); err == nil {
			_ = json.Unmarshal(bpBytes, &baseProjects)
		}
	}

	baseIDs := make(map[string]bool)
	for _, bp := range baseProjects {
		if id, ok := bp["id"].(string); ok && !strings.HasPrefix(id, "zone-") {
			baseIDs[id] = true
		}
	}

	incomingHasBase := false
	for _, ip := range incomingProjects {
		if id, ok := ip["id"].(string); ok && baseIDs[id] {
			incomingHasBase = true
			break
		}
	}

	mergedProjects := incomingProjects
	if !incomingHasBase && len(baseProjects) > 0 {
		existingNonZone := make([]map[string]interface{}, 0, len(baseProjects))
		for _, bp := range baseProjects {
			if id, ok := bp["id"].(string); ok && !strings.HasPrefix(id, "zone-") {
				existingNonZone = append(existingNonZone, bp)
			}
		}
		mergedProjects = append(existingNonZone, incomingProjects...)
	}

	marketDoc["projects"] = mergedProjects
	if outBytes, err := json.MarshalIndent(marketDoc, "", "  "); err == nil {
		_ = os.WriteFile(jsonPath, outBytes, 0644)
	}
	if mergedBytes, err := json.Marshal(mergedProjects); err == nil {
		return json.RawMessage(mergedBytes)
	}
	return incomingProjectsRaw
}

type useCase struct {
	repo domains.Repository
}

func gisResponse(config *models.MarketGISConfig) *responses.MarketGISResponse {
	projects, facilities := json.RawMessage(config.ProjectsJSON), json.RawMessage(config.FacilitiesJSON)
	if !json.Valid(projects) {
		projects = json.RawMessage("[]")
	}
	if !json.Valid(facilities) {
		facilities = json.RawMessage("[]")
	}
	return &responses.MarketGISResponse{MarketID: config.MarketID, Projects: projects, Facilities: facilities, Published: config.Published, UpdatedBy: config.UpdatedBy, UpdatedAt: config.UpdatedAt}
}

func NewUseCase(repo domains.Repository) domains.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetMarkets(search string) ([]models.Market, error) {
	markets, err := u.repo.FindAll(search)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return markets, nil
}

func (u *useCase) GetMarketsForUser(search string, userID int, role string) ([]models.Market, error) {
	if role == "admin" {
		return u.GetMarkets(search)
	}
	if role != "staff" {
		return nil, responses.NewAppErr(http.StatusForbidden, "ไม่มีสิทธิ์เข้าถึงข้อมูลตลาดสำหรับเจ้าหน้าที่")
	}
	markets, err := u.repo.FindByStaffUserID(search, userID)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return markets, nil
}

func (u *useCase) GetMarketByIDOrSlug(idOrSlug string) (*models.Market, error) {
	market, err := u.repo.FindByIDOrSlug(idOrSlug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลตลาด")
		}
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return market, nil
}

func (u *useCase) GetMarketZones(marketID int) ([]models.Zone, error) {
	zones, err := u.repo.FindZonesByMarketID(marketID)
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return zones, nil
}

func (u *useCase) GetGISConfig(idOrSlug string, includeDraft bool) (*responses.MarketGISResponse, error) {
	market, err := u.repo.FindByIDOrSlug(idOrSlug)
	if err != nil {
		return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลตลาด")
	}
	config, err := u.repo.FindGISConfig(market.ID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &responses.MarketGISResponse{MarketID: market.ID, Projects: json.RawMessage("[]"), Facilities: json.RawMessage("[]")}, nil
	}
	if err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	if !includeDraft && !config.Published {
		return &responses.MarketGISResponse{MarketID: market.ID, Projects: json.RawMessage("[]"), Facilities: json.RawMessage("[]")}, nil
	}
	return gisResponse(config), nil
}

func (u *useCase) SaveGISConfig(idOrSlug string, userID int, req requests.UpdateMarketGISRequest) (*responses.MarketGISResponse, error) {
	if !json.Valid(req.Projects) || !json.Valid(req.Facilities) {
		return nil, responses.NewAppErr(http.StatusBadRequest, "ข้อมูล GIS ไม่ถูกต้อง")
	}
	market, err := u.repo.FindByIDOrSlug(idOrSlug)
	if err != nil {
		return nil, responses.NewAppErr(http.StatusNotFound, "ไม่พบข้อมูลตลาด")
	}
	mergedProjects := syncMarketJSONFile(market.Slug, req.Projects)
	config := &models.MarketGISConfig{MarketID: market.ID, ProjectsJSON: string(mergedProjects), FacilitiesJSON: string(req.Facilities), Published: req.Published, CreatedBy: &userID, UpdatedBy: &userID}
	if err := u.repo.SaveGISConfig(config); err != nil {
		logs.Error(err)
		return nil, responses.NewInternalServerError()
	}
	return gisResponse(config), nil
}
