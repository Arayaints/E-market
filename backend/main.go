package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"emarket-api/config"
	"emarket-api/databases"
	"emarket-api/databases/seeds"
	"emarket-api/logs"
	"emarket-api/routes"
)

// @title e-Market Management System API
// @version 1.0
// @description Backend REST API สำหรับระบบบริหารจัดการตลาดและแผงเช่า (Go / Gin Clean Architecture)
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	config.Init()
	cfg := config.Get()

	logs.InitLogger()
	defer logs.Close()

	// Initialize Database
	var err error
	if cfg.DBDriver == "postgres" {
		_, err = databases.InitPostgreSQL(cfg.DBUrl)
	} else {
		_, err = databases.InitSQLite(cfg.DBUrl)
	}
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	// Auto Migration & Seed Data
	if err := databases.AutoMigrate(databases.DB); err != nil {
		log.Printf("Auto migration warning: %v", err)
	}
	if err := seeds.SeedAll(databases.DB); err != nil {
		log.Printf("Seeding warning: %v", err)
	}

	// Setup Router
	router := routes.SetupRouter()

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Graceful Shutdown Channel
	go func() {
		log.Printf("🚀 e-Market API Server started on port %s (env: %s, mode: %s)\n", cfg.Port, cfg.Env, cfg.AppMode)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server startup failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down e-Market API Server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("e-Market API Server exited successfully")
}
