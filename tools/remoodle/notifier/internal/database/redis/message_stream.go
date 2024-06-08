package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type MessageStream struct {
	client *Client
}

func NewMessageStream(client *Client) *MessageStream {
	return &MessageStream{client: client}
}

func (ms *MessageStream) Get(ctx context.Context, stream string, group string, consumer string, count int, block time.Duration) ([]redis.XMessage, error) {
	streams, err := ms.client.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    group,
		Consumer: consumer,
		Streams:  []string{stream, ">"},
		Count:    int64(count),
		Block:    block,
	}).Result()

	if err != nil {
		return nil, err
	}

	if len(streams) == 0 {
		return []redis.XMessage{}, nil
	}

	return streams[0].Messages, nil
}

func (ms *MessageStream) Ack(ctx context.Context, stream, group, messageID string) error {
	return ms.client.XAck(ctx, stream, group, messageID).Err()
}
