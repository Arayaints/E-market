package logs

import (
	"log"

	"go.uber.org/zap"
)

var Logger *zap.Logger

func InitLogger() {
	var err error
	Logger, err = zap.NewProduction()
	if err != nil {
		log.Printf("Failed to init zap logger: %v", err)
	}
}

func Info(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Info(msg, fields...)
	} else {
		log.Println("[INFO]", msg)
	}
}

func Error(err error, fields ...zap.Field) {
	if Logger != nil && err != nil {
		Logger.Error(err.Error(), fields...)
	} else if err != nil {
		log.Println("[ERROR]", err)
	}
}

func Close() {
	if Logger != nil {
		_ = Logger.Sync()
	}
}
