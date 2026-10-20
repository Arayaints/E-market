package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppMode    string
	Port       string
	DBDriver   string
	DBUrl      string
	JWTSecret  string
	Env        string
}

var cfg *Config

func Init() {
	_ = godotenv.Load(".env")
	if os.Getenv("PORT") == "" {
		_ = godotenv.Load("env_dev")
	}

	appMode := os.Getenv("APP_MODE")
	if appMode == "" {
		appMode = "all"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbDriver := os.Getenv("DB_DRIVER")
	if dbDriver == "" {
		dbDriver = "sqlite"
	}

	dbUrl := os.Getenv("DB_URL")
	if dbUrl == "" {
		dbUrl = "./emarket.db"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "emarket-secret-super-key-2026"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "dev"
	}

	cfg = &Config{
		AppMode:   appMode,
		Port:      port,
		DBDriver:  dbDriver,
		DBUrl:     dbUrl,
		JWTSecret: jwtSecret,
		Env:       env,
	}
}

func Get() *Config {
	if cfg == nil {
		Init()
	}
	return cfg
}
