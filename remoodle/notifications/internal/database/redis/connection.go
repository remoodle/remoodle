package redis

import (
	"os"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	*redis.Client
}

func NewClient() *Client {
	uri := os.Getenv("REDIS_URI")

	opt, err := redis.ParseURL(uri)

	if err != nil {
		panic(err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     opt.Addr,
		Password: opt.Password,
		DB:       opt.DB,
	})

	return &Client{rdb}
}
