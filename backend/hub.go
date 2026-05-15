package main

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	send chan []byte

}

type Hub struct {
	clients map[*Client] bool
	register chan *Client
	unregister chan *Client
	broadcast chan []byte
}

func newHub() *Hub {
	return &Hub{
		clients: make(map[*Client]bool),
		register: make(chan *Client),
		unregister: make(chan *Client),
		broadcast: make(chan []byte),
	}
}

func (h *Hub) Run()  {
	for {
		select {
			case  client := <-h.register :
				h.clients[client] = true
			case client := <-h.unregister:
				delete(h.clients, client)
				close(client.send)
			case message := <-h.broadcast:
				for client := range h.clients {
					client.send <- message
				}
		}
	}
}

func (c *Client) readPump(hub *Hub) {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()
	

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	for message := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}
