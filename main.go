package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"sort"
)

type GameData struct {
	Name            string  `json:"name"`
	Rank            int     `json:"rank"`
	Score           int     `json:"score"`
	Time            string  `json:"time"`
	PositionPercent float64 `json:"positionPercent"`
}

var gameData []GameData

func main() {
	http.HandleFunc("/", handler)           //tetris page
	http.HandleFunc("/scores", dataHandler) //from this page you can see the information of each play (name, score, and time) in JSON format
	http.HandleFunc("/scoreboard", scores)  //this page is displayed for the player

	fileServer := http.FileServer(http.Dir("./static/"))
	http.Handle("/static/", http.StripPrefix("/static", fileServer))
	fmt.Printf("Starting server at port 8080\nOpen http://localhost:8080\nUse Ctrl+C to close the port\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
func handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprint(w, "Error 404, page not found")
		return
	}
	tmpl := template.Must(template.ParseFiles("static/index.html"))
	tmpl.Execute(w, nil)
}

func dataHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		addGameData(w, r)
	} else if r.Method == "GET" {
		getAllGameData(w, r)
	} else {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprint(w, "Error 405, method not allowed")
		return
	}
}

func addGameData(w http.ResponseWriter, r *http.Request) {
	var data GameData
	//decoding JSON data into the data variable
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	//appending the data object to a gameData
	gameData = append(gameData, data)
	w.WriteHeader(http.StatusCreated)
}

func getAllGameData(w http.ResponseWriter, r *http.Request) {
	//sort the gameData in descending order based on scores
	sort.Slice(gameData, func(i, j int) bool {
		return gameData[i].Score > gameData[j].Score
	})
	for i := 0; i < len(gameData); i++ {
		gameData[i].Rank = i + 1
		gameData[i].PositionPercent = float64(i+1) / float64(len(gameData)) * 100
	}
	//encoding the gameData into JSON and writes it to the http.ResponseWriter
	json.NewEncoder(w).Encode(gameData)
}

func scores(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("static/scoreboard.html"))

	// Execute the template with the gameData
	err := tmpl.Execute(w, gameData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
