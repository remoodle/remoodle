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
	if err != nil {
		log.Fatalf("Unable to initialize Telegram bot: %v", err)
	}
	bot.Debug = true

	return &Service{bot: bot}
}

func (s *Service) SendMessage(chatID int64, message string) error {
	msg := tgbotapi.NewMessage(chatID, message)
	_, err := s.bot.Send(msg)
	return err
}
