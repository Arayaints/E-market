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
			{Username: "admin", Password: hashPassword("admin1234"), FullName: "ผู้ดูแลระบบตลาด (Admin)", Role: "admin", Email: "admin@emarket.bma.go.th", Phone: "02-123-4567", Status: "A"},
			{Username: "staff", Password: hashPassword("staff1234"), FullName: "เจ้าหน้าที่จัดสรรแผง (Staff)", Role: "staff", Email: "staff@emarket.bma.go.th", Phone: "02-123-4568", Status: "A"},
			{Username: "tenant", Password: hashPassword("tenant1234"), FullName: "คุณสมศักดิ์ ค้าขายดี (ผู้เช่า)", Role: "tenant", Email: "somsak@vendor.bma.go.th", Phone: "081-999-8877", Status: "A"},
		}
		if err := db.Create(&users).Error; err != nil {
			return err
		}
		log.Println("Seeded users successfully")
	}

	return nil
}
