package seeds

import (
	"log"

	"emarket-api/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) error {
	hashPassword := func(pwd string) string {
		h, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
		return string(h)
	}

	var count int64
	db.Model(&models.User{}).Count(&count)
	if count == 0 {
		users := []models.User{
			{Username: "admin", Password: hashPassword("admin1234"), FullName: "ผู้ดูแลระบบตลาด กทม. (Admin)", Role: "admin", Email: "admin@emarket.bma.go.th", Phone: "02-123-4567", Status: "A"},
			{Username: "staff", Password: hashPassword("staff1234"), FullName: "เจ้าหน้าที่ตลาด (Staff)", Role: "staff", Email: "staff@emarket.bma.go.th", Phone: "02-123-4568", Status: "A"},
			{Username: "tenant", Password: hashPassword("tenant1234"), FullName: "สมชาย ใจดี", Role: "tenant", Email: "tenant@emarket.bma.go.th", Phone: "081-234-5678", Status: "A"},
			{Username: "tenant2", Password: hashPassword("tenant21234"), FullName: "นภาพร รัตนศิลป์", Role: "tenant", Email: "tenant2@emarket.bma.go.th", Phone: "089-111-2233", Status: "A"},
		}
		if err := db.Create(&users).Error; err != nil {
			return err
		}
		log.Println("Seeded users successfully")
	}

	return nil
}
