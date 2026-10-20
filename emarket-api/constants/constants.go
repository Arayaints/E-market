package constants

const (
	SUCCESS               string = "ดำเนินการสำเร็จ"
	DATA_NOT_FOUND        string = "ไม่พบข้อมูลที่ต้องการ"
	INTERNAL_SERVER_ERROR string = "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง"
	UNAUTHORIZED          string = "ไม่มีสิทธิ์เข้าถึงข้อมูล"
	INVALID_CREDENTIALS   string = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
	VALIDATE_ERROR        string = "validate error"

	STATUS_ACTIVE         string = "A"
	STATUS_INACTIVE       string = "I"
	STATUS_DELETED        string = "D"

	ROLE_ADMIN            string = "admin"
	ROLE_STAFF            string = "staff"
	ROLE_TENANT           string = "tenant"

	STALL_AVAILABLE       string = "available"
	STALL_RESERVED        string = "reserved"
	STALL_OCCUPIED        string = "occupied"
	STALL_MAINTENANCE     string = "maintenance"
)
