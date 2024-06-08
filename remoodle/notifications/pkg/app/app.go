package app

import (
	"log"

	"notifier/internal/database"
	"notifier/internal/telegram"

	_ "github.com/joho/godotenv/autoload"
)

type App struct {
	Db       *database.DBHandler
	Telegram *telegram.Service
}

func NewApp() *App {
	db := database.NewDBHandler()

	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database handler: %v", err)
	}

	app := &App{
		Db:       db,
		Telegram: telegram.NewService(),
	}

	return app
}
