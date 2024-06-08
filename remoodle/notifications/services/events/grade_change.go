package events

import (
	"context"
	"log"
	"strconv"

	"notifier/pkg/app"
)

type GradeChangeHandler struct {
	app *app.App
}

func NewGradeChangeHandler(srv *app.App) *GradeChangeHandler {
	return &GradeChangeHandler{
		app: srv,
	}
}

func (h *GradeChangeHandler) HandleGradeChanges() {
	ctx := context.Background()
	streamName := "stream::grade-change"
	group := "tg"
	consumer := "worker"

	for {
		messages, err := h.app.Db.MessageStream.Get(ctx, streamName, group, consumer, 10, 0)
		if err != nil {
			log.Printf("Error reading from stream: %v", err)
			continue
		}

		for _, msg := range messages {
			userID, _ := strconv.ParseInt(msg.Values["user_id"].(string), 10, 64)
			newGrade := msg.Values["new_grade"].(string)
			messageText := "Hello, your new grade is: " + newGrade

			if err := h.app.Telegram.SendMessage(userID, messageText); err != nil {
				log.Printf("Failed to send Telegram message: %v", err)
			}

			if err := h.app.Db.MessageStream.Ack(ctx, streamName, group, msg.ID); err != nil {
				log.Printf("Failed to acknowledge message: %v", err)
			}
		}
	}
}
