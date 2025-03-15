package main

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/valkey-io/valkey-go"
)

// Score represents a player's score data
type Score struct {
	Score      int `json:"score"`
	Multiplier int `json:"multiplier"`
}

// SubscriberUpdateData represents the data structure sent from the backend
type SubscriberUpdateData struct {
	Sequence   int    `json:"sequence"`
	PlayerID   int    `json:"playerId"`
	Action     string `json:"action"`
	Score      Score  `json:"score"`
	TotalScore int    `json:"totalScore"`
}

var (
	addr                = flag.String("addr", ":8080", "http service address")
	valkeyAddr          = flag.String("valkey", "localhost:6379", "valkey address")
	valkeyPassword      = flag.String("valkey-password", "", "valkey password")
	valkeyChannelPrefix = flag.String("channel-prefix", "game:", "valkey pubsub channel prefix")
)

// Client represents a connected WebSocket client
type Client struct {
	Conn *websocket.Conn
	Ctx  context.Context
}

// GameSubscription manages subscriptions for a specific game
type GameSubscription struct {
	GameID     string
	Clients    map[*Client]bool
	ClientsMux sync.Mutex
	Cancel     context.CancelFunc
}

// GameHub manages all game subscriptions
type GameHub struct {
	Games        map[string]*GameSubscription
	GamesMux     sync.RWMutex
	ValkeyClient valkey.Client
	Ctx          context.Context
}

// NewGameHub creates a new game hub
func NewGameHub(ctx context.Context, valkeyClient valkey.Client) *GameHub {
	return &GameHub{
		Games:        make(map[string]*GameSubscription),
		ValkeyClient: valkeyClient,
		Ctx:          ctx,
	}
}

// GetOrCreateGame gets or creates a game subscription
func (h *GameHub) GetOrCreateGame(gameID string) *GameSubscription {
	h.GamesMux.RLock()
	game, exists := h.Games[gameID]
	h.GamesMux.RUnlock()

	if exists {
		return game
	}

	// Create new game subscription
	h.GamesMux.Lock()
	defer h.GamesMux.Unlock()

	// Double-check to avoid race condition
	if game, exists = h.Games[gameID]; exists {
		return game
	}

	// Create context for this game subscription
	gameCtx, gameCancel := context.WithCancel(h.Ctx)

	game = &GameSubscription{
		GameID:  gameID,
		Clients: make(map[*Client]bool),
		Cancel:  gameCancel,
	}

	h.Games[gameID] = game

	// Start subscription to Valkey for this game
	go h.subscribeToGame(gameCtx, game)

	log.Printf("Created new game subscription for game: %s", gameID)
	return game
}

// RemoveClient removes a client from a game subscription
func (h *GameHub) RemoveClient(gameID string, client *Client) {
	h.GamesMux.RLock()
	game, exists := h.Games[gameID]
	h.GamesMux.RUnlock()

	if !exists {
		return
	}

	game.ClientsMux.Lock()
	delete(game.Clients, client)
	clientCount := len(game.Clients)
	game.ClientsMux.Unlock()

	log.Printf("Client disconnected from game %s. Remaining clients: %d", gameID, clientCount)

	// If no clients left for this game, clean up the subscription
	if clientCount == 0 {
		h.GamesMux.Lock()
		defer h.GamesMux.Unlock()

		// Double-check in case new clients have connected
		game.ClientsMux.Lock()
		currentCount := len(game.Clients)
		game.ClientsMux.Unlock()

		if currentCount == 0 {
			// Cancel the subscription context
			game.Cancel()
			delete(h.Games, gameID)
			log.Printf("Removed game subscription for game: %s", gameID)
		}
	}
}

// subscribeToGame subscribes to Valkey for a specific game
func (h *GameHub) subscribeToGame(ctx context.Context, game *GameSubscription) {
	channelName := *valkeyChannelPrefix + game.GameID

	// Create a dedicated client for this subscription
	dedicated, cancel := h.ValkeyClient.Dedicate()
	defer cancel()

	// Set up PubSub hooks
	wait := dedicated.SetPubSubHooks(valkey.PubSubHooks{
		OnMessage: func(msg valkey.PubSubMessage) {
			// Skip messages not for our channel
			if msg.Channel != channelName {
				return
			}

			// Validate JSON
			var updateData SubscriberUpdateData
			if err := json.Unmarshal([]byte(msg.Message), &updateData); err != nil {
				log.Printf("Invalid JSON received for game %s: %v", game.GameID, err)
				return
			}

			payload := json.RawMessage(msg.Message)

			// Broadcast to all clients for this game
			game.ClientsMux.Lock()
			clients := make([]*Client, 0, len(game.Clients))
			for client := range game.Clients {
				clients = append(clients, client)
			}
			game.ClientsMux.Unlock()

			for _, client := range clients {
				// Use a separate goroutine for each write to avoid blocking
				go func(c *Client, p json.RawMessage) {
					ctx, cancel := context.WithTimeout(c.Ctx, 5*time.Second)
					defer cancel()

					if err := wsjson.Write(ctx, c.Conn, p); err != nil {
						log.Printf("WebSocket write error: %v", err)
						// The client will be cleaned up on the next read error
					}
				}(client, payload)
			}

			if len(clients) > 0 {
				log.Printf("Broadcasting message to %d clients for game %s", len(clients), game.GameID)
			}
		},
	})

	// Subscribe to the channel
	dedicated.Do(ctx, dedicated.B().Subscribe().Channel(channelName).Build())

	log.Printf("Subscribed to Valkey channel: %s", channelName)

	// Wait for disconnection or context cancellation
	select {
	case err := <-wait:
		if err != nil {
			log.Printf("Subscription ended for game %s: %v", game.GameID, err)
		}
	case <-ctx.Done():
		log.Printf("Subscription context cancelled for game %s", game.GameID)
	}
}

func main() {
	flag.Parse()
	log.SetFlags(0)

	// Set up Valkey client
	valkeyClient, err := valkey.NewClient(valkey.ClientOption{
		InitAddress: []string{*valkeyAddr},
		Password:    *valkeyPassword,
	})
	if err != nil {
		log.Fatalf("Failed to create Valkey client: %v", err)
	}
	defer valkeyClient.Close()

	// Test Valkey connection
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	_, err = valkeyClient.Do(ctx, valkeyClient.B().Ping().Build()).ToString()
	if err != nil {
		log.Fatalf("Failed to connect to Valkey: %v", err)
	}
	log.Println("Connected to Valkey")

	// Create game hub
	gameHub := NewGameHub(ctx, valkeyClient)

	// Set up HTTP server
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(w, r, gameHub)
	})

	server := &http.Server{
		Addr:    *addr,
		Handler: mux,
	}

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()

		// Cancel all contexts to stop subscriptions
		cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("Server shutdown failed: %v", err)
		}

		log.Println("Server and Valkey connections closed")
		os.Exit(0)
	}()

	// Start HTTP server
	log.Printf("Server starting on %s", *addr)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("HTTP server error: %v", err)
	}
}

// handleWebSocket handles WebSocket connections
func handleWebSocket(w http.ResponseWriter, r *http.Request, hub *GameHub) {
	// Extract game ID from query parameters
	gameID := r.URL.Query().Get("gameId")
	if gameID == "" {
		http.Error(w, "Missing gameId parameter", http.StatusBadRequest)
		log.Println("WebSocket connection attempt without gameId")
		return
	}

	// Accept the WebSocket connection
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true, // For development only, set proper origin check in production
		CompressionMode:    websocket.CompressionDisabled,
	})
	if err != nil {
		log.Printf("WebSocket accept error: %v", err)
		return
	}

	// Create a context for this client that we can cancel when needed
	clientCtx, clientCancel := context.WithCancel(r.Context())
	client := &Client{
		Conn: c,
		Ctx:  clientCtx,
	}

	// Get or create game subscription
	game := hub.GetOrCreateGame(gameID)

	// Add client to game
	game.ClientsMux.Lock()
	game.Clients[client] = true
	clientCount := len(game.Clients)
	game.ClientsMux.Unlock()

	log.Printf("New WebSocket client connected to game %s. Total clients for this game: %d", gameID, clientCount)

	// Keep reading to detect disconnection
	for {
		_, _, err := c.Read(clientCtx)
		if err != nil {
			// Client disconnected or error occurred
			clientCancel()
			hub.RemoveClient(gameID, client)
			c.Close(websocket.StatusNormalClosure, "")
			break
		}
	}
}
