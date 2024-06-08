package database

import (
	"notifier/internal/database/redis"
)

type DBHandler struct {
	RedisClient   *redis.Client
	MessageStream *redis.MessageStream
}

func NewDBHandler() *DBHandler {
	return &DBHandler{}
}

func (db *DBHandler) Initialize() error {
	db.RedisClient = redis.NewClient()
	db.MessageStream = redis.NewMessageStream(db.RedisClient)

	return nil
}
