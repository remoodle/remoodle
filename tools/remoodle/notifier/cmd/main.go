package main

import (
	"context"
	"log"
	"notifier/pkg/app"
	"notifier/services/api"
	"notifier/services/events"

	"os"
	"os/signal"
	"syscall"
)

func main() {
	app := app.NewApp()

	gradeChangeHandler := events.NewGradeChangeHandler(app)
	go gradeChangeHandler.HandleGradeChanges()

	server := api.NewServer(app)

	go server.Start()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	if err := server.Shutdown(context.Background()); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server gracefully shutdown.")
}
