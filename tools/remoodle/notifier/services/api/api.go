package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"notifier/pkg/app"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

type Server struct {
	Port int
	Http *http.Server
}

func NewServer(app *app.App) *Server {
	port, _ := strconv.Atoi(os.Getenv("SERVER_PORT"))

	server := &Server{
		Port: port,
	}

	server.Http = &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      server.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}

func (s *Server) Start() {
	log.Printf("HTTP server starting on port %d", s.Port)
	if err := s.Http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("HTTP server failed to start: %v", err)
	}
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.Http.Shutdown(ctx)
}
