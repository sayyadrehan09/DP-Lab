# 🎬 Movie & OTT Recommendation System (DP-Lab)

[![Java](https://img.shields.io/badge/Language-Java%208%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Architecture](https://img.shields.io/badge/Architecture-GoF%20Design%20Patterns-blue?style=for-the-badge)](https://en.wikipedia.org/wiki/Design_Patterns)
[![Storage](https://img.shields.io/badge/Persistence-Flat%20File%20(I%2FO)-success?style=for-the-badge)](https://docs.oracle.com/javase/8/docs/api/java/io/package-summary.html)
[![License](https://img.shields.io/badge/Academic-Lab%20Assessment-lightgrey?style=for-the-badge)](https://github.com/sayyadrehan09/DP-Lab)

A modular, object-oriented Java console application simulating an **OTT Streaming & Movie Recommendation Platform**. Built for the **Design Patterns Laboratory Assessment**, this system demonstrates how standard **Gang of Four (GoF)** design patterns decouple business logic, enforce role-based access control, manage data flow, and implement flexible filtering pipelines.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Design Patterns Implemented](#-design-patterns-implemented)
  - [1. Singleton Pattern](#1-singleton-pattern)
  - [2. Factory Method Pattern](#2-factory-method-pattern)
  - [3. Proxy Pattern (Protection Proxy)](#3-proxy-pattern-protection-proxy)
  - [4. Observer Pattern](#4-observer-pattern)
  - [5. Chain of Responsibility Pattern](#5-chain-of-responsibility-pattern)
- [Design Patterns Summary Table](#-design-patterns-summary-table)
- [Architecture & Workflow](#-architecture--workflow)
- [Features & Role-Based Capabilities](#-features--role-based-capabilities)
- [Directory Structure](#-directory-structure)
- [Data Storage Schema](#-data-storage-schema)
- [Prerequisites & Execution](#-prerequisites--execution)
  - [Method 1: IntelliJ IDEA / Eclipse](#method-1-intellij-idea--eclipse)
  - [Method 2: Command Line (javac / java)](#method-2-command-line-javac--java)
- [Interactive Usage Demo](#-interactive-usage-demo)
- [Author](#-author)

---

## 📖 Overview

The **Movie & OTT Recommendation System** provides personalized movie discovery across major streaming services (Netflix, Prime Video, Disney+). Users can filter titles across multiple dimensions (genre, language, minimum rating, and streaming platform), curate personal watchlists, and view top-ranked films.

Administrators have elevated privileges to expand the catalog, delete obsolete titles, and broadcast real-time notifications to connected subscribers.

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
* **File:** [`MovieDatabase.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/MovieDatabase.java)
* **Type:** Creational
* **Role:** Guarantees that only one global instance of the movie database exists in memory throughout the application lifecycle.
* **Implementation:**
  - Private constructor prevents direct instantiation (`new MovieDatabase()`).
  - Static accessor `getInstance()` provides a synchronized, single access point.
  - Manages the in-memory cache of movies and coordinates with [`FileManager`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/FileManager.java).

```java
// Thread-safe / Controlled single instance
public class MovieDatabase {
    private static MovieDatabase instance;
    private List<Movie> movies;

    private MovieDatabase() {
        movies = new ArrayList<>();
    }

    public static MovieDatabase getInstance() {
        if (instance == null) {
            instance = new MovieDatabase();
        }
        return instance;
    }
}
```

---

### 2. Factory Method Pattern
* **File:** [`MovieFactory.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/MovieFactory.java)
* **Type:** Creational
* **Role:** Encapsulates the instantiation logic for `Movie` objects and decouples raw file string parsing from the domain model.
* **Implementation:**
  - `createMovie(...)`: Instantiates a `Movie` from validated user input.
  - `createMovieFromFile(String data)`: Parses delimited pipe-separated text (`id|title|genre|...`) from `data/movies.txt` into strongly-typed `Movie` domain objects.

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

### 3. Proxy Pattern (Protection Proxy)
* **File:** [`ProxyPattern.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/ProxyPattern.java)
* **Type:** Structural
* **Role:** Restricts access to sensitive catalog operations based on the active session role (`USER` vs `ADMIN`).
* **Implementation:**
  - **Subject Interface:** `MovieService` defines `addMovie()`, `removeMovie()`, and `viewMovies()`.
  - **Real Subject:** `RealMovieService` communicates with [`MovieDatabase`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/MovieDatabase.java) to execute operations.
  - **Proxy:** `MovieServiceProxy` intercepts calls. It permits read actions to all users, but blocks write/delete attempts by non-administrators with `Access Denied! Only ADMIN can add/remove movies.`.

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
* **File:** [`ObserverPattern.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/ObserverPattern.java)
* **Type:** Behavioral
* **Role:** Establishes a one-to-many publish-subscribe communication channel between system events and registered users.
* **Implementation:**
  - **Subject Interface:** `Subject` (`addObserver()`, `removeObserver()`, `notifyObservers()`).
  - **Concrete Subject:** `NotificationService` maintains active subscribers.
  - **Observer Interface:** `Observer` (`update(String message)`).
  - **Concrete Observer:** `UserObserver` prints notifications to user terminals when new movies are added or administrative broadcasts are issued.

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
* **File:** [`RecommendationChain.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/RecommendationChain.java)
* **Type:** Behavioral
* **Role:** Chains multiple sequential filters together to process movie recommendations dynamically without hard-coding complex multi-branch conditional logic.
* **Implementation:**
  - **Handler Base:** `RecommendationHandler` holds a reference to `next` and defines the abstract `filter()` contract.
  - **Concrete Handlers:**
    1. `GenreHandler` (Matches genre or passes through if `"Any"`)
    2. `LanguageHandler` (Matches language or passes through if `"Any"`)
    3. `RatingHandler` (Filters movies meeting or exceeding minimum rating threshold)
    4. `PlatformHandler` (Matches OTT streaming provider or passes through if `"Any"`)
  - **Chain Coordinator:** `RecommendationChain` wires `Genre -> Language -> Rating -> Platform` and returns the final filtered list.

```
  List<Movie> ──> [ GenreHandler ] ──> [ LanguageHandler ] ──> [ RatingHandler ] ──> [ PlatformHandler ] ──> Result
```

---

## 📊 Design Patterns Summary Table

| Pattern | Category | Source File | Core Classes / Interfaces | Purpose in System |
| :--- | :--- | :--- | :--- | :--- |
| **Singleton** | Creational | [`MovieDatabase.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/MovieDatabase.java) | `MovieDatabase` | Centralized, synchronized movie data management in memory. |
| **Factory Method** | Creational | [`MovieFactory.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/MovieFactory.java) | `MovieFactory` | Encapsulates movie object creation and file record parsing. |
| **Proxy** | Structural | [`ProxyPattern.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/ProxyPattern.java) | `MovieService`, `RealMovieService`, `MovieServiceProxy` | Protection proxy enforcing role-based access control (Admin vs User). |
| **Observer** | Behavioral | [`ObserverPattern.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/ObserverPattern.java) | `Subject`, `Observer`, `NotificationService`, `UserObserver` | Notifies users when movies are added or broadcasts are triggered. |
| **Chain of Responsibility** | Behavioral | [`RecommendationChain.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/RecommendationChain.java) | `RecommendationHandler`, `GenreHandler`, `LanguageHandler`, `RatingHandler`, `PlatformHandler` | Sequential multi-criteria recommendation filtering pipeline. |

---

## 🎯 Features & Role-Based Capabilities

### 👤 Regular User Features
1. **View Top 5 Movies:** Displays the top-ranked movies with ratings $\ge 9.0$ sorted in descending order.
2. **Personalized Recommendations:** Filters catalog by Genre, Language, Minimum Rating, and OTT Platform.
3. **Add to Watchlist:** Adds movies by title to the persistent user watchlist.
4. **View Watchlist:** Inspects personal bookmarked movies.

### 🛡️ Admin Privileges
Includes all user features plus:
1. **Add Movie:** Adds new titles to the database via `MovieServiceProxy`, updates `data/movies.txt`, and triggers broadcast alerts via `NotificationService`.
2. **Remove Movie:** Deletes movies by ID from the catalog and updates disk storage.
3. **Broadcast System Notification:** Triggers broadcast messages to all active user observers.

---

## 📂 Directory Structure

```plaintext
DP-Lab/
├── data/
│   ├── movies.txt              # Pipe-delimited movie catalog dataset
│   ├── users.txt               # Registered usernames and assigned roles
│   └── watchlist.txt           # User-specific saved movie watchlists
├── FileManager.java            # File I/O persistence handler (load/save/sync)
├── Main.java                   # Console UI, session login, and CLI menu controller
├── Movie.java                  # Domain entity representing a movie
├── MovieDatabase.java          # [Singleton] In-memory repository manager
├── MovieFactory.java           # [Factory Method] Instantiation & parsing utility
├── ObserverPattern.java        # [Observer] Subject & subscriber notification system
├── ProxyPattern.java           # [Proxy] Protection proxy with role-based checks
├── RecommendationChain.java    # [Chain of Resp.] Filtering pipeline
├── Lab Assesment/              # Compiled bytecode artifacts (.class files)
├── Lab Assesment.iml           # IntelliJ IDEA module definition
└── README.md                   # Project documentation
```

---

## 💾 Data Storage Schema

The application persists data inside the `data/` directory using pipe-separated values (`|`):

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

## 🚀 Prerequisites & Execution

### Prerequisites
- **Java Development Kit (JDK 8 or higher)** installed.
- Any IDE (IntelliJ IDEA, Eclipse, VS Code) or terminal with `javac` and `java` in `PATH`.

---

### Method 1: IntelliJ IDEA / Eclipse (Recommended)
1. Open the cloned folder (`DP-Lab`) in **IntelliJ IDEA**.
2. Ensure project SDK is configured:
   - Go to **File -> Project Structure -> Project -> SDK** (Select Java 8+).
3. Open [`Main.java`](file:///c:/Users/Rehan/Downloads/dp-lab/DP-Lab/Main.java).
4. Click the green **Run** ▶ button or press `Shift + F10`.

---

### Method 2: Command Line (javac / java)

1. Open PowerShell or Command Prompt in the repository folder:
   ```powershell
   cd path/to/DP-Lab
   ```

2. Compile all Java source files:
   ```bash
   javac *.java
   ```

3. Run the application:
   ```bash
   java Main
   ```

> **Note:** Ensure you run the application from the directory containing the `data/` folder so relative file paths resolve correctly.

---

## 💻 Interactive Usage Demo

```plaintext
==============================================
       MOVIE & OTT RECOMMENDATION SYSTEM
==============================================

Enter your name: Alex

Select Role:
1. User
2. Admin
Enter choice: 2

============== MENU ==============
1. View Top 5 Movies
2. Get Recommendations
3. Add Movie to Watchlist
4. View Watchlist
5. Add Movie
6. Remove Movie
7. Send Notification
8. Exit
Enter choice: 2

========== MOVIE RECOMMENDATION ==========

Select Genre:
1. Action
2. Comedy
3. Sci-Fi
4. Drama
5. Thriller
6. Any
Enter choice: 1

Select Language:
1. English
2. Hindi
3. Any
Enter choice: 1

Enter minimum rating (0-10): 9.0

Select OTT Platform:
1. Netflix
2. Prime Video
3. Disney+
4. Any
Enter choice: 1

==============================================
           RECOMMENDED MOVIES
==============================================

ID       : 3
Title    : The Dark Knight
Genre    : Action
Language : English
Rating   : 9.1
Year     : 2008
Platform : Netflix
----------------------------------------
Total Recommendations: 1
```

---

## 👤 Author

Developed by **[Rehan Sayyad](https://github.com/sayyadrehan09)** for the **Design Patterns (DP) Laboratory Assessment**.

For issues, contributions, or questions, feel free to open an issue or pull request on the repository.
