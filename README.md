# 🎬 Movie & OTT Recommendation System (CinePattern)

[![Java](https://img.shields.io/badge/Language-Java%208%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Architecture](https://img.shields.io/badge/Architecture-GoF%20Design%20Patterns-blue?style=for-the-badge)](https://en.wikipedia.org/wiki/Design_Patterns)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-purple?style=for-the-badge)](frontend/)
[![Storage](https://img.shields.io/badge/Persistence-Flat%20File%20(I%2FO)-success?style=for-the-badge)](backend/data/)
[![Academic](https://img.shields.io/badge/Academic-5th%20Sem%20Lab%20Assessment-lightgrey?style=for-the-badge)](https://github.com/sayyadrehan09/DP-Lab)

A full-stack, enterprise-grade **Movie & OTT Recommendation System** featuring a Java backend and a modern cinematic web interface. Built for the **Design Patterns Laboratory Assessment**, this system demonstrates how standard **Gang of Four (GoF)** design patterns decouple business logic, enforce role-based access control, manage data flow, and implement flexible filtering pipelines.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Directory & Folder Structure](#-directory--folder-structure)
- [Design Patterns Implemented](#-design-patterns-implemented)
  - [1. Singleton Pattern](#1-singleton-pattern)
  - [2. Factory Method Pattern](#2-factory-method-pattern)
  - [3. Protection Proxy Pattern](#3-protection-proxy-pattern)
  - [4. Observer Pattern](#4-observer-pattern)
  - [5. Chain of Responsibility Pattern](#5-chain-of-responsibility-pattern)
- [Design Patterns Summary Table](#-design-patterns-summary-table)
- [Features & Role-Based Capabilities](#-features--role-based-capabilities)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Data Storage Schema](#-data-storage-schema)
- [How to Run](#-how-to-run)
  - [Option A: One-Click Quick Launch (Recommended)](#option-a-one-click-quick-launch-recommended)
  - [Option B: Command Line (Java REST Server + Web UI)](#option-b-command-line-java-rest-server--web-ui)
  - [Option C: Original Terminal CLI](#option-c-original-terminal-cli)
- [Author](#-author)

---

## 📖 Overview

The **Movie & OTT Recommendation System** provides personalized movie discovery across major streaming services (Netflix, Prime Video, Disney+). Users can filter titles across multiple dimensions (genre, language, minimum rating, and streaming platform), curate personal watchlists, and view top-ranked films.

Administrators have elevated privileges to expand the catalog, delete obsolete titles, and broadcast real-time notifications to connected subscribers.

---

## 📁 Directory & Folder Structure

```plaintext
DP-Lab/
├── backend/                        # Java Core Engine & REST API
│   ├── data/                       # Text-file persistence storage
│   │   ├── movies.txt              # Pipe-delimited movie catalog dataset
│   │   ├── users.txt               # Stored usernames and assigned roles
│   │   └── watchlist.txt           # User-specific saved movie watchlists
│   ├── FileManager.java            # File I/O persistence handler (load/save/sync)
│   ├── Main.java                   # Console UI and terminal CLI controller
│   ├── Movie.java                  # Domain entity representing a movie
│   ├── MovieDatabase.java          # [Singleton Pattern] In-memory repository manager
│   ├── MovieFactory.java           # [Factory Method Pattern] Instantiation & parsing utility
│   ├── ObserverPattern.java        # [Observer Pattern] Subject & subscriber notification system
│   ├── ProxyPattern.java           # [Protection Proxy Pattern] Role-based access control
│   ├── RecommendationChain.java    # [Chain of Resp.] Filtering pipeline
│   ├── Server.java                 # Built-in HTTP REST API & Static File Server
│   └── run-backend.bat             # Backend launch script
│
├── frontend/                       # Modern Cinematic Web Interface
│   ├── index.html                  # Responsive SPA with 6 views
│   ├── style.css                   # Premium Dark OTT theme (Netflix / Prime Video style)
│   └── app.js                      # API client, live trace & pattern visualizer
│
├── .gitignore                      # Git ignore rules for Java & Node
├── README.md                       # Comprehensive documentation
└── start.bat                       # One-click launcher (Compiles, boots server & opens browser)
```

---

## 🛠 Design Patterns Implemented

The application cleanly implements **5 classic GoF Design Patterns** across Creational, Structural, and Behavioral categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GOF DESIGN PATTERNS                             │
├─────────────────┬──────────────────────┬───────────────────────────────┤
│   Creational    │      Structural      │          Behavioral           │
├─────────────────┼──────────────────────┼───────────────────────────────┤
│ • Singleton     │ • Protection Proxy   │ • Observer Pattern            │
│ • Factory Method│                      │ • Chain of Responsibility     │
└─────────────────┴──────────────────────┴───────────────────────────────┘
```

### 1. Singleton Pattern
* **File:** [`backend/MovieDatabase.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/MovieDatabase.java)
* **Type:** Creational
* **Role:** Guarantees that only one global instance of the movie database exists in memory throughout the application lifecycle.
* **Implementation:**
  - Private constructor prevents direct instantiation (`new MovieDatabase()`).
  - Static accessor `getInstance()` provides a synchronized, single access point.
  - Manages the in-memory cache of movies and coordinates with `FileManager`.

```java
public class MovieDatabase {
    private static MovieDatabase instance;
    private List<Movie> movies;

    private MovieDatabase() {
        movies = new ArrayList<>();
    }

    public static synchronized MovieDatabase getInstance() {
        if (instance == null) {
            instance = new MovieDatabase();
        }
        return instance;
    }
}
```

---

### 2. Factory Method Pattern
* **File:** [`backend/MovieFactory.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/MovieFactory.java)
* **Type:** Creational
* **Role:** Encapsulates the instantiation logic for `Movie` objects and decouples raw file string parsing from the domain model.
* **Implementation:**
  - `createMovie(...)`: Instantiates a `Movie` from validated user/web input.
  - `createMovieFromFile(String data)`: Parses delimited pipe-separated text (`id|title|genre|...`) from `backend/data/movies.txt` into strongly-typed `Movie` domain objects.

```java
public class MovieFactory {
    public static Movie createMovie(int id, String title, String genre, String language, double rating, int year, String platform) {
        return new Movie(id, title, genre, language, rating, year, platform);
    }

    public static Movie createMovieFromFile(String data) {
        String[] parts = data.split("\\|", -1);
        if (parts.length != 7) return null;
        return new Movie(Integer.parseInt(parts[0]), parts[1], parts[2], parts[3], Double.parseDouble(parts[4]), Integer.parseInt(parts[5]), parts[6]);
    }
}
```

---

### 3. Protection Proxy Pattern
* **File:** [`backend/ProxyPattern.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/ProxyPattern.java)
* **Type:** Structural
* **Role:** Restricts access to sensitive catalog operations based on the active session role (`USER` vs `ADMIN`).
* **Implementation:**
  - **Subject Interface:** `MovieService` defines `addMovie()`, `removeMovie()`, and `viewMovies()`.
  - **Real Subject:** `RealMovieService` communicates with `MovieDatabase` to execute operations.
  - **Proxy:** `MovieServiceProxy` intercepts calls. It permits read actions to all users, but blocks write/delete attempts by non-administrators with `403 Forbidden` / `Access Denied! Only ADMIN can add/remove movies.`.

```
                  ┌──────────────────────┐
                  │    <<interface>>     │
                  │     MovieService     │
                  └──────────┬───────────┘
                             ▲
              ┌──────────────┴──────────────┐
              │                             │
    ┌──────────────────┐          ┌──────────────────────┐
    │ RealMovieService │          │  MovieServiceProxy   │
    ├──────────────────┤          ├──────────────────────┤
    │ + addMovie()     │◄─────────┤ - role: String       │
    │ + removeMovie()  │ delegates│ + addMovie() [Check] │
    │ + viewMovies()   │ if ADMIN │ + removeMovie()      │
    └──────────────────┘          └──────────────────────┘
```

---

### 4. Observer Pattern
* **File:** [`backend/ObserverPattern.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/ObserverPattern.java)
* **Type:** Behavioral
* **Role:** Establishes a one-to-many publish-subscribe communication channel between system events and registered users.
* **Implementation:**
  - **Subject Interface:** `Subject` (`addObserver()`, `removeObserver()`, `notifyObservers()`).
  - **Concrete Subject:** `NotificationService` maintains active subscribers and notification history.
  - **Observer Interface:** `Observer` (`update(String message)`).
  - **Concrete Observer:** `UserObserver` logs notifications to user terminals and pushes real-time updates to the web interface.

```
       ┌────────────────────────┐                   ┌────────────────────────┐
       │     <<interface>>      │                   │     <<interface>>      │
       │        Subject         │                   │        Observer        │
       └───────────┬────────────┘                   └───────────┬────────────┘
                   ▲                                            ▲
                   │                                            │
       ┌───────────┴────────────┐                   ┌───────────┴────────────┐
       │  NotificationService   │◇─────────────────>│      UserObserver      │
       ├────────────────────────┤   notifies all    ├────────────────────────┤
       │ + notifyObservers()    │                   │ + update(message)      │
       └────────────────────────┘                   └────────────────────────┘
```

---

### 5. Chain of Responsibility Pattern
* **File:** [`backend/RecommendationChain.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/RecommendationChain.java)
* **Type:** Behavioral
* **Role:** Chains multiple sequential filters together to process movie recommendations dynamically without hard-coding complex multi-branch conditional logic.
* **Implementation:**
  - **Handler Base:** `RecommendationHandler` holds a reference to `next` and defines the abstract `filter()` contract.
  - **Concrete Handlers:**
    1. `GenreHandler` (Matches genre or passes through if `"Any"`)
    2. `LanguageHandler` (Matches language or passes through if `"Any"`)
    3. `RatingHandler` (Filters movies meeting or exceeding minimum rating threshold)
    4. `PlatformHandler` (Matches OTT streaming provider or passes through if `"Any"`)
  - **Chain Coordinator:** `RecommendationChain` wires `Genre -> Language -> Rating -> Platform` and returns the final filtered list, including a step-by-step candidate trace for the web visualizer.

```
  List<Movie> ──> [ GenreHandler ] ──> [ LanguageHandler ] ──> [ RatingHandler ] ──> [ PlatformHandler ] ──> Result
```

---

## 📊 Design Patterns Summary Table

| Pattern | Category | Source File | Core Classes / Interfaces | Purpose in System |
| :--- | :--- | :--- | :--- | :--- |
| **Singleton** | Creational | [`backend/MovieDatabase.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/MovieDatabase.java) | `MovieDatabase` | Centralized, synchronized movie data management in memory. |
| **Factory Method** | Creational | [`backend/MovieFactory.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/MovieFactory.java) | `MovieFactory` | Encapsulates movie object creation and file record parsing. |
| **Proxy** | Structural | [`backend/ProxyPattern.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/ProxyPattern.java) | `MovieService`, `RealMovieService`, `MovieServiceProxy` | Protection proxy enforcing role-based access control (Admin vs User). |
| **Observer** | Behavioral | [`backend/ObserverPattern.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/ObserverPattern.java) | `Subject`, `Observer`, `NotificationService`, `UserObserver` | Notifies users when movies are added or broadcasts are triggered. |
| **Chain of Responsibility** | Behavioral | [`backend/RecommendationChain.java`](file:///f:/00.%20College/5th%20Semester/9%20Design%20Pattern/Lab%20Assesment/DP-Lab/backend/RecommendationChain.java) | `RecommendationHandler`, `GenreHandler`, `LanguageHandler`, `RatingHandler`, `PlatformHandler` | Sequential multi-criteria recommendation filtering pipeline. |

---

## 🎯 Features & Role-Based Capabilities

### 👤 Regular User Features
1. **Interactive Movie Catalog:** Browse, search, and filter in-memory titles in real time.
2. **View Top 5 Movies:** Displays the top-ranked masterpieces with ratings $\ge 9.0$.
3. **Chain of Responsibility Recommender:** Custom criteria pipeline with live node-by-node pass count animation.
4. **Personal Watchlist:** Bookmark movies to user's persistent watchlist with add/remove support.
5. **Real-time Notifications:** Bell notification drawer fed by the Observer Pattern.

### 🛡️ Admin Privileges
Includes all user features plus:
1. **Add Movie:** Adds new titles via `MovieFactory` and validated by `MovieServiceProxy`, broadcasting alert to observers.
2. **Remove Movie:** Deletes movies by ID from the catalog via `MovieServiceProxy`.
3. **Broadcast System Notification:** Triggers broadcast messages to all active user observers.

---

## 🌐 REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/movies` | Fetch all movies or filter by `?search=`, `?genre=`, `?platform=` |
| `GET` | `/api/top-movies` | Fetch top-rated movies (Rating $\ge$ 9.0) sorted descending |
| `POST` | `/api/recommend` | Runs the 4-stage Chain of Responsibility pipeline with live stage trace |
| `GET` | `/api/watchlist?user={name}` | Retrieves saved watchlist for a user |
| `POST` | `/api/watchlist` | Adds a movie to user's watchlist |
| `DELETE` | `/api/watchlist?user={name}&movieId={id}` | Removes a movie from user's watchlist |
| `POST` | `/api/movies` | Adds a movie via `MovieFactory` (protected by `MovieServiceProxy`) |
| `DELETE` | `/api/movies?id={id}` | Removes a movie (protected by `MovieServiceProxy`) |
| `POST` | `/api/login` | Log in as USER or ADMIN and register as an Observer |
| `GET` | `/api/notifications` | Get Observer pattern notification feed |
| `POST` | `/api/notify` | Broadcast message to all observers (Admin only) |
| `GET` | `/api/design-patterns` | Live metrics & status of all 5 patterns in the JVM |

---

## 💾 Data Storage Schema

The application persists data inside `backend/data/` using pipe-separated values (`|`):

### 1. `movies.txt`
```
ID|Title|Genre|Language|Rating|Year|Platform
```
*Example:*
```plaintext
1|The Shawshank Redemption|Drama|English|9.3|1994|Netflix
3|The Dark Knight|Action|English|9.1|2008|Netflix
9|3 Idiots|Comedy|Hindi|8.4|2009|Prime Video
```

### 2. `users.txt`
```
Username|Role
```
*Example:*
```plaintext
Aryan|USER
Karan|ADMIN
```

### 3. `watchlist.txt`
```
Username|ID|Title|Genre|Language|Rating|Year|Platform
```
*Example:*
```plaintext
Aryan|10|Joker|Drama|English|8.4|2019|Prime Video
```

---

## 🚀 How to Run

### Option A: One-Click Quick Launch (Recommended)
Double-click `start.bat` in the root folder.
This will:
1. Compile all Java backend sources.
2. Launch the HTTP REST API server on `http://localhost:8080`.
3. Automatically launch your default web browser to the interface.

---

### Option B: Command Line (Java REST Server + Web UI)
1. Open PowerShell or Command Prompt in the repository folder:
   ```powershell
   cd backend
   javac -d . *.java
   java Server
   ```
2. Open `http://localhost:8080` in your browser.

---

### Option C: Original Terminal CLI
If you or an evaluator want to run the terminal-based interactive menu:
```powershell
cd backend
javac -d . *.java
java Main
```

---

## 👤 Author

Developed by **[Rehan Sayyad](https://github.com/sayyadrehan09)** for the **Design Patterns (DP) Laboratory Assessment**.
