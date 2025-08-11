package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"strings"
	"time"
	"database/sql"

	"github.com/bregydoc/gtranslate"
	"github.com/rs/cors"
	"github.com/golang-jwt/jwt"
	_ "modernc.org/sqlite"
)

type TranslateRequest struct {
	Text string `json:"text"`
	To   string `json:"to"`
}

type TranslateResponse struct {
	TranslatedText string `json:"translatedText,omitempty"`
	Status         bool   `json:"status"`
	Message        string `json:"message"`
}

// Add new types for user limits
type User struct {
	Username        string `json:"username"`
	Token          string `json:"token,omitempty"`
	MonthlyLimit   int    `json:"monthly_limit"`
	IsUnlimited    bool   `json:"is_unlimited"`
}

// Add new types
type AuthRequest struct {
    Username      string `json:"username"`
    MonthlyLimit int    `json:"monthly_limit"`
    IsUnlimited  bool   `json:"is_unlimited"`
    MaxMachines  int    `json:"max_machines"`  // New field
}
var (
	jwtSecret = []byte("your-secret-key")
	db        *sql.DB
)
type MachineRegistrationRequest struct {
    Username string `json:"username"`
    IP       string `json:"ip"`
    Name     string `json:"name"`
}

// Update initDB function to add machines table
func initDB() {
	var err error
	db, err = sql.Open("sqlite", "translations.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create users table
	// Update users table in initDB
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
	    username TEXT PRIMARY KEY,
	    monthly_limit INTEGER,
	    is_unlimited BOOLEAN,
	    max_machines INTEGER DEFAULT 1
	);`

	_, err = db.Exec(createUsersTable)
	if err != nil {
		log.Fatal(err)
	}

	// Update translation_logs table
	createLogsTable := `
	CREATE TABLE IF NOT EXISTS translation_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		translated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createLogsTable)
	if err != nil {
		log.Fatal(err)
	}

	// Create machines table
	createMachinesTable := `
	CREATE TABLE IF NOT EXISTS machines (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT,
		ip TEXT,
		name TEXT,
		registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(username, ip)
	);`

	_, err = db.Exec(createMachinesTable)
	if err != nil {
		log.Fatal(err)
	}
}

// Add these functions after the initDB function and before the AuthHandler

func generateToken(username string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "username": username,
        "exp":     time.Now().Add(time.Hour * 24).Unix(),
    })
    return token.SignedString(jwtSecret)
}

func validateToken(tokenString string) (string, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil {
        return "", err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims["username"].(string), nil
    }
    return "", fmt.Errorf("invalid token")
}

// Add function to check translation limit
func checkTranslationLimit(username string) error {
	var isUnlimited bool
	var monthlyLimit int
	err := db.QueryRow("SELECT is_unlimited, monthly_limit FROM users WHERE username = ?", username).Scan(&isUnlimited, &monthlyLimit)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	if isUnlimited {
		return nil
	}

	// Count translations for current month
	var count int
	err = db.QueryRow(`
		SELECT COUNT(*) FROM translation_logs 
		WHERE username = ? 
		AND strftime('%Y-%m', translated_at) = strftime('%Y-%m', 'now')`,
		username).Scan(&count)
	if err != nil {
		return err
	}

	if count >= monthlyLimit {
		return fmt.Errorf("monthly translation limit reached (%d/%d)", count, monthlyLimit)
	}

	return nil
}

// Update AuthHandler
func AuthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var authReq AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&authReq); err != nil {
		sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Store user limits in database
	_, err := db.Exec("INSERT OR REPLACE INTO users (username, monthly_limit, is_unlimited) VALUES (?, ?, ?)",
		authReq.Username, authReq.MonthlyLimit, authReq.IsUnlimited)
	if err != nil {
		sendErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	token, err := generateToken(authReq.Username)
	if err != nil {
		sendErrorResponse(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	sendJSONResponse(w, User{
		Username:     authReq.Username,
		Token:       token,
		MonthlyLimit: authReq.MonthlyLimit,
		IsUnlimited: authReq.IsUnlimited,
	}, http.StatusOK)
}

// Update TranslateHandler
// Direct translation without authentication or machine verification
func TranslateHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var request TranslateRequest
    err := json.NewDecoder(r.Body).Decode(&request)
    if err != nil {
        sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    translated, err := gtranslate.TranslateWithParams(request.Text, gtranslate.TranslationParams{
        From: "auto",
        To:   request.To,
    })
    if err != nil {
        sendErrorResponse(w, "Translation failed", http.StatusInternalServerError)
        return
    }

    response := TranslateResponse{
        TranslatedText: translated,
        Status:         true,
        Message:        "",
    }

    sendJSONResponse(w, response, http.StatusOK)
}

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	response := TranslateResponse{
		Status:  false,
		Message: message,
	}
	sendJSONResponse(w, response, statusCode)
}

func sendJSONResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		log.Printf("Failed to encode JSON response: %v", err)
	}
}

// Add this new type for usage statistics
// Update UsageResponse type
type UsageResponse struct {
    Username        string           `json:"username"`
    MonthlyLimit    int             `json:"monthly_limit"`
    IsUnlimited     bool            `json:"is_unlimited"`
    CurrentUsage    int             `json:"current_usage"`
    RemainingUses   int             `json:"remaining_uses,omitempty"`
    MaxMachines     int             `json:"max_machines"`
    CurrentMachines int             `json:"current_machines"`
    Machines        []MachineInfo   `json:"machines"`
}

type MachineInfo struct {
    Name          string    `json:"name"`
    IP            string    `json:"ip"`
    RegisteredAt  time.Time `json:"registered_at"`
}

// Update UsageHandler
func UsageHandler(w http.ResponseWriter, r *http.Request) {
    // Extract and validate token
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
        sendErrorResponse(w, "Missing or invalid authorization header", http.StatusUnauthorized)
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    username, err := validateToken(tokenString)
    if err != nil {
        sendErrorResponse(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    // Get user limits and machine limit
    var isUnlimited bool
    var monthlyLimit, maxMachines int
    err = db.QueryRow("SELECT is_unlimited, monthly_limit, max_machines FROM users WHERE username = ?", 
        username).Scan(&isUnlimited, &monthlyLimit, &maxMachines)
    if err != nil {
        sendErrorResponse(w, "User not found", http.StatusNotFound)
        return
    }

    // Get current month's usage
    var currentUsage int
    err = db.QueryRow(`
        SELECT COUNT(*) FROM translation_logs 
        WHERE username = ? 
        AND strftime('%Y-%m', translated_at) = strftime('%Y-%m', 'now')`,
        username).Scan(&currentUsage)
    if err != nil {
        sendErrorResponse(w, "Failed to get usage data", http.StatusInternalServerError)
        return
    }

    // Get registered machines
    rows, err := db.Query(`
        SELECT name, ip, registered_at 
        FROM machines 
        WHERE username = ?
        ORDER BY registered_at DESC`, username)
    if err != nil {
        sendErrorResponse(w, "Failed to get machines data", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var machines []MachineInfo
    for rows.Next() {
        var machine MachineInfo
        err := rows.Scan(&machine.Name, &machine.IP, &machine.RegisteredAt)
        if err != nil {
            log.Printf("Error scanning machine row: %v", err)
            continue
        }
        machines = append(machines, machine)
    }

    response := UsageResponse{
        Username:        username,
        MonthlyLimit:    monthlyLimit,
        IsUnlimited:     isUnlimited,
        CurrentUsage:    currentUsage,
        MaxMachines:     maxMachines,
        CurrentMachines: len(machines),
        Machines:        machines,
    }

    if !isUnlimited {
        response.RemainingUses = monthlyLimit - currentUsage
    }

    sendJSONResponse(w, response, http.StatusOK)
}



// Add new function to check if machine is registered
func checkMachineRegistration(username, ip string) error {
    var count int
    err := db.QueryRow("SELECT COUNT(*) FROM machines WHERE username = ? AND ip = ?", 
        username, ip).Scan(&count)
    if err != nil {
        return err
    }
    if count == 0 {
        return fmt.Errorf("machine not registered")
    }
    return nil
}

// Add new handler for machine registration
func RegisterMachineHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Validate token
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
        sendErrorResponse(w, "Missing or invalid authorization header", http.StatusUnauthorized)
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    username, err := validateToken(tokenString)
    if err != nil {
        sendErrorResponse(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    var req MachineRegistrationRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Check if user has reached machine limit
    var maxMachines, currentMachines int
    err = db.QueryRow("SELECT monthly_limit FROM users WHERE username = ?", username).Scan(&maxMachines)
    if err != nil {
        sendErrorResponse(w, "User not found", http.StatusNotFound)
        return
    }

    err = db.QueryRow("SELECT COUNT(*) FROM machines WHERE username = ?", username).Scan(&currentMachines)
    if err != nil {
        sendErrorResponse(w, "Failed to check machines", http.StatusInternalServerError)
        return
    }

    if currentMachines >= maxMachines {
        sendErrorResponse(w, fmt.Sprintf("Machine limit reached (%d/%d)", currentMachines, maxMachines), http.StatusForbidden)
        return
    }

    // Register the machine
    _, err = db.Exec("INSERT INTO machines (username, ip, name) VALUES (?, ?, ?)",
        username, req.IP, req.Name)
    if err != nil {
        sendErrorResponse(w, "Failed to register machine", http.StatusInternalServerError)
        return
    }

    sendJSONResponse(w, map[string]string{"message": "Machine registered successfully"}, http.StatusOK)
}

// Add new type for delete machine request
type DeleteMachineRequest struct {
    IP string `json:"ip"`
}

// Add new handler for machine deletion
func DeleteMachineHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodDelete {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Validate token
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
        sendErrorResponse(w, "Missing or invalid authorization header", http.StatusUnauthorized)
        return
    }

    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    username, err := validateToken(tokenString)
    if err != nil {
        sendErrorResponse(w, "Invalid token", http.StatusUnauthorized)
        return
    }

    var req DeleteMachineRequest
    decodeErr := json.NewDecoder(r.Body).Decode(&req)
    if decodeErr != nil {
        sendErrorResponse(w, "Invalid request payload", http.StatusBadRequest)
        return
    }

    // Delete the machine
    result, err := db.Exec("DELETE FROM machines WHERE username = ? AND ip = ?",
        username, req.IP)
    if err != nil {
        sendErrorResponse(w, "Failed to delete machine", http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        sendErrorResponse(w, "Failed to get result", http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        sendErrorResponse(w, "Machine not found", http.StatusNotFound)
        return
    }

    sendJSONResponse(w, map[string]string{"message": "Machine deleted successfully"}, http.StatusOK)
}

// Update main function to add the new route
func main() {
    initDB()
    defer db.Close()

    mux := http.NewServeMux()
    mux.HandleFunc("/auth", AuthHandler)
    mux.HandleFunc("/translate", TranslateHandler)
    mux.HandleFunc("/usage", UsageHandler)
    mux.HandleFunc("/register-machine", RegisterMachineHandler)
    mux.HandleFunc("/delete-machine", DeleteMachineHandler)

    // Update CORS configuration
    corsOptions := cors.New(cors.Options{
        AllowedOrigins: []string{"*"},
        AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Authorization", "Content-Type"},
    })

    handler := corsOptions.Handler(mux)

    fmt.Println("Starting server on http://0.0.0.0:8810")
    log.Fatal(http.ListenAndServe("0.0.0.0:8810", handler))
}


