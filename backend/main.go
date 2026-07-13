package main

import (
	"fmt"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "OK")
}


func main() {
	hub := newHub()
	go hub.Run()
	
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/ws", hub.wsHandler)
	http.ListenAndServe(":8080", nil)
}