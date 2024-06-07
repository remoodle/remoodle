package telegram

import (
	"log"
	"os"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api"
)

type Service struct {
	bot *tgbotapi.BotAPI
}

func NewService() *Service {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")

	bot, err := tgbotapi.NewBotAPI(token)
	bot.Debug = true

	if err != nil {
		log.Fatalf("Unable to initialize Telegram bot: %v", err)
	}

	return &Service{bot: bot}
}

func (s *Service) SendMessage(chatID int64, message string) error {
	msg := tgbotapi.NewMessage(chatID, message)

	_, err := s.bot.Send(msg)
	return err
}
