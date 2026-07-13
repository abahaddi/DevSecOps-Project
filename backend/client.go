package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (hub *Hub) wsHandler(w http.ResponseWriter, r *http.Request){
	wsconn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}

	client := &Client{conn: wsconn, send: make(chan []byte, 256)}
	hub.register <- client

	go client.writePump()

	client.readPump(hub)
	
}