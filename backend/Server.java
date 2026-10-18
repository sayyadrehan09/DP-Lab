import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Server {
    private static final int DEFAULT_PORT = 8080;
    private static NotificationService notificationService;
    private static MovieDatabase database;
    private static File frontendDir;

    // Supabase Cloud Configuration
    public static final String SUPABASE_URL = "https://mhxkftnldxziqhydyfbf.supabase.co";
    public static final String SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjM5NDIsImV4cCI6MjEwNzE5OTk0Mn0.3PSHd6qK3WuhN69gXZhcC_yTmHwmFf5sEwyVTdMe714";
    public static final String SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYyMzk0MiwiZXhwIjoyMTA3MTk5OTQyfQ.Ip5R7TTG_JgRQ32dtxwK0JnQvFUcaqrlvYVH9THynhc";
    public static final String SUPABASE_JWT_SECRET = "vAWhjRnsisKYjoBpOezWIKpJ42fjaLfyTD6GxYfxlj+t/DwRkisc2AETxm8CUMoDW2Bc/o7aK4l/Huc7+WfRxg==";
    public static final String SUPABASE_BUCKET = "invoices";

    public static void main(String[] args) throws IOException {
        FileManager.initializeFiles();

        database = MovieDatabase.getInstance();
        database.loadMovies();

        notificationService = new NotificationService();

        // Register known users from file as initial observers
        List<String[]> existingUsers = FileManager.getAllUsers();
        for (String[] u : existingUsers) {
            notificationService.addObserver(new UserObserver(u[0]));
        }

        // Add an initial notification if history is empty
        if (notificationService.getHistory().isEmpty()) {
            notificationService.notifyObservers("Movie & OTT Recommendation System backend started successfully.");
        }

        // Determine frontend directory
        frontendDir = resolveFrontendDir();

        int port = DEFAULT_PORT;
        HttpServer server = null;
        for (int p = DEFAULT_PORT; p <= DEFAULT_PORT + 10; p++) {
            try {
                server = HttpServer.create(new InetSocketAddress(p), 0);
                port = p;
                break;
            } catch (IOException e) {
                // Port occupied, try next
            }
        }

        if (server == null) {
            System.err.println("Failed to bind to any port between 8080 and 8090");
            System.exit(1);
        }

        // API Endpoints
        server.createContext("/api/movies", new MoviesHandler());
        server.createContext("/api/top-movies", new TopMoviesHandler());
        server.createContext("/api/recommend", new RecommendHandler());
        server.createContext("/api/sort", new SortHandler());
        server.createContext("/api/watchlist", new WatchlistHandler());
        server.createContext("/api/watchlist/export", new WatchlistExportHandler());
        server.createContext("/api/watchlist/undo", new WatchlistUndoHandler());
        server.createContext("/api/login", new LoginHandler());
        server.createContext("/api/auth/supabase-signup", new SupabaseSignupHandler());
        server.createContext("/api/auth/supabase-config", new SupabaseConfigHandler());
        server.createContext("/api/supabase/invoices", new SupabaseInvoicesHandler());
        server.createContext("/api/notifications", new NotificationsHandler());
        server.createContext("/api/notify", new BroadcastHandler());
        server.createContext("/api/design-patterns", new PatternsHandler());

        // Static File Serving (Root)
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        server.start();

        System.out.println("============================================================");
        System.out.println("   MOVIE & OTT RECOMMENDATION SYSTEM - BACKEND SERVER");
        System.out.println("============================================================");
        System.out.println(" [✓] Singleton MovieDatabase initialized with " + database.getMovies().size() + " movies.");
        System.out.println(" [✓] NotificationService initialized with " + notificationService.getObservers().size() + " observers.");
        System.out.println(" [✓] Chain of Responsibility ready: Genre -> Language -> Rating -> Platform.");
        System.out.println(" [✓] Proxy Pattern security active: Admin/User role enforcement.");
        System.out.println(" [✓] Factory Pattern ready: MovieFactory.");
        System.out.println("------------------------------------------------------------");
        System.out.println(" Server URL:       http://localhost:" + port);
        System.out.println(" API Base:         http://localhost:" + port + "/api/movies");
        System.out.println(" Frontend Dir:     " + (frontendDir != null ? frontendDir.getAbsolutePath() : "Not found"));
        System.out.println("============================================================");
    }

    private static File resolveFrontendDir() {
        File dir = new File("frontend");
        if (dir.exists() && dir.isDirectory()) return dir;
        dir = new File(".." + File.separator + "frontend");
        if (dir.exists() && dir.isDirectory()) return dir;
        return new File("frontend");
    }

    // CORS & Response Helpers
    private static void sendResponse(HttpExchange exchange, int statusCode, String response, String contentType) throws IOException {
        addCorsHeaders(exchange);
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", contentType + "; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        sendResponse(exchange, statusCode, json, "application/json");
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS, PUT");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role, X-User-Name");
    }

    private static boolean handlePreflight(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            addCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[1024];
            int len;
            while ((len = is.read(buf)) != -1) {
                bos.write(buf, 0, len);
            }
            return bos.toString(StandardCharsets.UTF_8.name());
        }
    }

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            String k = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String v = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            map.put(k, v);
        }
        return map;
    }

    private static String getJsonString(String json, String key, String defaultVal) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return defaultVal;
    }

    private static int getJsonInt(String json, String key, int defaultVal) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    private static double getJsonDouble(String json, String key, double defaultVal) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            try {
                return Double.parseDouble(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    private static String getUserRole(HttpExchange exchange, String body) {
        String header = exchange.getRequestHeaders().getFirst("X-User-Role");
        if (header != null && !header.trim().isEmpty()) {
            return header.trim();
        }
        if (body != null) {
            String role = getJsonString(body, "role", "");
            if (!role.isEmpty()) return role;
        }
        Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
        if (params.containsKey("role")) return params.get("role");
        return "USER";
    }

    // Handlers
    static class MoviesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            String method = exchange.getRequestMethod();
            if ("GET".equalsIgnoreCase(method)) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                String search = params.getOrDefault("search", "").toLowerCase().trim();
                String genre = params.getOrDefault("genre", "Any");
                String platform = params.getOrDefault("platform", "Any");

                List<Movie> all = database.getMovies();
                List<Movie> filtered = new ArrayList<>();

                for (Movie m : all) {
                    boolean matchesSearch = search.isEmpty() ||
                            m.getTitle().toLowerCase().contains(search) ||
                            m.getGenre().toLowerCase().contains(search) ||
                            m.getLanguage().toLowerCase().contains(search);
                    boolean matchesGenre = genre.equalsIgnoreCase("Any") || m.getGenre().equalsIgnoreCase(genre);
                    boolean matchesPlatform = platform.equalsIgnoreCase("Any") || m.getPlatform().equalsIgnoreCase(platform);

                    if (matchesSearch && matchesGenre && matchesPlatform) {
                        filtered.add(m);
                    }
                }

                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < filtered.size(); i++) {
                    json.append(filtered.get(i).toJson());
                    if (i < filtered.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());

            } else if ("POST".equalsIgnoreCase(method)) {
                // Add Movie via Proxy Pattern
                String body = readBody(exchange);
                String role = getUserRole(exchange, body);

                MovieServiceProxy proxy = new MovieServiceProxy(role);

                int id = getJsonInt(body, "id", database.getNextAvailableId());
                if (id <= 0) id = database.getNextAvailableId();
                String title = getJsonString(body, "title", "").trim();
                String genre = getJsonString(body, "genre", "Action").trim();
                String language = getJsonString(body, "language", "English").trim();
                double rating = getJsonDouble(body, "rating", 7.0);
                int year = getJsonInt(body, "year", Calendar.getInstance().get(Calendar.YEAR));
                String platform = getJsonString(body, "platform", "Netflix").trim();

                if (title.isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Title is required\"}");
                    return;
                }

                // Check proxy security
                if (!proxy.isAdmin()) {
                    proxy.addMovie(null); // Triggers console log
                    sendJsonResponse(exchange, 403, "{\"success\":false,\"message\":\"" + proxy.getLastStatusMessage() + "\"}");
                    return;
                }

                // Factory Pattern
                Movie movie = MovieFactory.createMovie(id, title, genre, language, rating, year, platform);
                proxy.addMovie(movie);

                // Observer Pattern
                notificationService.notifyObservers("New movie added: " + title + " (" + genre + " | " + platform + ")");

                sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Movie created successfully!\",\"movie\":" + movie.toJson() + "}");

            } else if ("DELETE".equalsIgnoreCase(method)) {
                // Remove Movie via Proxy Pattern
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                String role = getUserRole(exchange, null);
                MovieServiceProxy proxy = new MovieServiceProxy(role);

                int id = -1;
                if (params.containsKey("id")) {
                    try {
                        id = Integer.parseInt(params.get("id"));
                    } catch (NumberFormatException ignored) {}
                }

                if (id <= 0) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Valid movie ID required\"}");
                    return;
                }

                if (!proxy.isAdmin()) {
                    proxy.removeMovie(id);
                    sendJsonResponse(exchange, 403, "{\"success\":false,\"message\":\"" + proxy.getLastStatusMessage() + "\"}");
                    return;
                }

                Movie movie = database.findMovieById(id);
                String title = (movie != null) ? movie.getTitle() : "ID " + id;
                proxy.removeMovie(id);
                notificationService.notifyObservers("Movie removed: " + title);

                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"" + proxy.getLastStatusMessage() + "\"}");
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    static class TopMoviesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            List<Movie> topMovies = new ArrayList<>();
            for (Movie movie : database.getMovies()) {
                if (movie.getRating() >= 9.0) {
                    topMovies.add(movie);
                }
            }

            topMovies.sort((m1, m2) -> Double.compare(m2.getRating(), m1.getRating()));

            int limit = Math.min(10, topMovies.size());
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < limit; i++) {
                json.append(topMovies.get(i).toJson());
                if (i < limit - 1) json.append(",");
            }
            json.append("]");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    static class RecommendHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange);
            String genre = getJsonString(body, "genre", "Any");
            String language = getJsonString(body, "language", "Any");
            double rating = getJsonDouble(body, "rating", 0.0);
            String platform = getJsonString(body, "platform", "Any");

            // Execute Chain of Responsibility with trace breakdown
            RecommendationChain chain = new RecommendationChain();
            List<ChainTraceStep> trace = new ArrayList<>();
            List<Movie> results = chain.recommendWithTrace(database.getMovies(), genre, language, rating, platform, trace);

            StringBuilder json = new StringBuilder("{");
            json.append("\"count\":").append(results.size()).append(",");

            json.append("\"trace\":[");
            for (int i = 0; i < trace.size(); i++) {
                json.append(trace.get(i).toJson());
                if (i < trace.size() - 1) json.append(",");
            }
            json.append("],");

            json.append("\"movies\":[");
            for (int i = 0; i < results.size(); i++) {
                json.append(results.get(i).toJson());
                if (i < results.size() - 1) json.append(",");
            }
            json.append("]}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    static class WatchlistHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            String method = exchange.getRequestMethod();

            if ("GET".equalsIgnoreCase(method)) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                String user = params.getOrDefault("user", params.getOrDefault("username", "")).trim();

                if (user.isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"User parameter required\"}");
                    return;
                }

                List<Movie> watchlist = FileManager.loadUserWatchlistMovies(user);
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < watchlist.size(); i++) {
                    json.append(watchlist.get(i).toJson());
                    if (i < watchlist.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());

            } else if ("POST".equalsIgnoreCase(method)) {
                String body = readBody(exchange);
                String user = getJsonString(body, "user", getJsonString(body, "username", "")).trim();
                int movieId = getJsonInt(body, "movieId", -1);

                if (user.isEmpty() || movieId <= 0) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"user and movieId required\"}");
                    return;
                }

                Movie movie = database.findMovieById(movieId);
                if (movie == null) {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Movie not found\"}");
                    return;
                }

                // Memento Pattern: Save state snapshot before mutating watchlist
                List<Integer> currentIdsBeforeAdd = FileManager.getUserWatchlistIds(user);
                WatchlistCaretaker.saveSnapshot(user, currentIdsBeforeAdd, "Before adding '" + movie.getTitle() + "'");

                FileManager.saveWatchlist(user, movie);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"canUndo\":true,\"message\":\"" + movie.getTitle() + " added to your watchlist.\"}");

            } else if ("DELETE".equalsIgnoreCase(method)) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                String user = params.getOrDefault("user", params.getOrDefault("username", "")).trim();
                int movieId = -1;
                try {
                    movieId = Integer.parseInt(params.getOrDefault("movieId", "-1"));
                } catch (NumberFormatException ignored) {}

                if (user.isEmpty() || movieId <= 0) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"user and movieId required\"}");
                    return;
                }

                // Memento Pattern: Save state snapshot before removing
                List<Integer> currentIdsBeforeRemove = FileManager.getUserWatchlistIds(user);
                Movie movieToRemove = database.findMovieById(movieId);
                String title = (movieToRemove != null) ? movieToRemove.getTitle() : ("ID #" + movieId);
                WatchlistCaretaker.saveSnapshot(user, currentIdsBeforeRemove, "Before removing '" + title + "'");

                boolean removed = FileManager.removeFromWatchlist(user, movieId);
                if (removed) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"canUndo\":true,\"message\":\"Movie removed from your watchlist.\"}");
                } else {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Movie not found in watchlist.\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    /**
     * Handler for Strategy Pattern: Dynamic Catalog Sorting
     */
    static class SortHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String by = params.getOrDefault("by", "rating").trim();

            CatalogSorterContext sorter = new CatalogSorterContext(CatalogSorterContext.getStrategyByName(by));
            List<Movie> sorted = sorter.executeSort(database.getMovies());

            StringBuilder json = new StringBuilder("{");
            json.append("\"strategy\":\"").append(sorter.getStrategy().getStrategyName().replace("\"", "\\\"")).append("\",");
            json.append("\"description\":\"").append(sorter.getStrategy().getDescription().replace("\"", "\\\"")).append("\",");
            json.append("\"movies\":[");
            for (int i = 0; i < sorted.size(); i++) {
                json.append(sorted.get(i).toJson());
                if (i < sorted.size() - 1) json.append(",");
            }
            json.append("]}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    /**
     * Handler for Template Method Pattern: Watchlist Export Engine
     */
    static class WatchlistExportHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String user = params.getOrDefault("user", params.getOrDefault("username", "")).trim();
            String format = params.getOrDefault("format", "markdown").trim();

            if (user.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"user parameter required\"}");
                return;
            }

            List<Movie> watchlist = FileManager.loadUserWatchlistMovies(user);
            WatchlistReportTemplate generator = WatchlistReportTemplate.getGenerator(format);
            String report = generator.generateReport(user, watchlist);

            String escapedContent = report.replace("\\", "\\\\")
                                          .replace("\"", "\\\"")
                                          .replace("\r", "")
                                          .replace("\n", "\\n");

            String json = "{\"success\":true,\"user\":\"" + user.replace("\"", "\\\"") + "\",\"format\":\"" + generator.getFormatName() + "\",\"content\":\"" + escapedContent + "\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    /**
     * Handler for Memento Pattern: Watchlist Undo Rollback
     */
    static class WatchlistUndoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange);
            String user = getJsonString(body, "user", getJsonString(body, "username", "")).trim();

            if (user.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"user is required\"}");
                return;
            }

            if (!WatchlistCaretaker.canUndo(user)) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"No previous watchlist states available to undo.\"}");
                return;
            }

            WatchlistMemento previousState = WatchlistCaretaker.undo(user);
            if (previousState == null) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Could not restore state.\"}");
                return;
            }

            FileManager.restoreUserWatchlist(user, previousState.getSavedState());
            List<Movie> restored = FileManager.loadUserWatchlistMovies(user);

            StringBuilder json = new StringBuilder("{");
            json.append("\"success\":true,");
            json.append("\"message\":\"Watchlist state rolled back via Memento Pattern (" + previousState.getDescription().replace("\"", "\\\"") + " at " + previousState.getTimestamp() + ")\",");
            json.append("\"canUndo\":").append(WatchlistCaretaker.canUndo(user)).append(",");
            json.append("\"watchlist\":[");
            for (int i = 0; i < restored.size(); i++) {
                json.append(restored.get(i).toJson());
                if (i < restored.size() - 1) json.append(",");
            }
            json.append("]}");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange);
            String action = getJsonString(body, "action", "login").trim().toLowerCase();
            String name = getJsonString(body, "name", "").trim();
            String email = getJsonString(body, "email", "").trim();
            String password = getJsonString(body, "password", "").trim();
            String provider = getJsonString(body, "provider", "local").trim().toLowerCase();

            String identifier = !email.isEmpty() ? email : name;

            if (identifier.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Email or Username is required\"}");
                return;
            }

            // ADMIN CREDENTIALS SPECIFIED BY USER:
            // admin email: admin@gmail.com and pass: admin123
            boolean isAdminAttempt = "admin@gmail.com".equalsIgnoreCase(email) ||
                                     "admin@gmail.com".equalsIgnoreCase(name) ||
                                     "admin".equalsIgnoreCase(name);

            if (isAdminAttempt) {
                if ("admin123".equals(password)) {
                    String role = "ADMIN";
                    String displayName = "Admin";
                    notificationService.addObserver(new UserObserver(displayName));
                    notificationService.notifyObservers("Admin logged in to the portal with full catalog permissions.");
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"name\":\"Admin\",\"role\":\"ADMIN\",\"email\":\"admin@gmail.com\",\"provider\":\"local\",\"message\":\"Welcome Admin! Full portal and movie management permissions unlocked.\"}");
                    return;
                } else {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"message\":\"Invalid Admin password! Admin password must be admin123\"}");
                    return;
                }
            }

            // Standard User Role: strictly USER (can only add movies to their watchlist)
            String role = "USER";

            if ("register".equals(action)) {
                if (FileManager.userExists(identifier)) {
                    sendJsonResponse(exchange, 409, "{\"success\":false,\"message\":\"An account with this username or email already exists. Please Sign In.\"}");
                    return;
                }
                String displayName = !name.isEmpty() ? name : (!email.isEmpty() ? email.split("@")[0] : identifier);
                FileManager.saveUser(displayName, role, password, email);
                notificationService.addObserver(new UserObserver(displayName));
                notificationService.notifyObservers("New user " + displayName + " registered (" + role + ")");
                sendJsonResponse(exchange, 200, "{\"success\":true,\"name\":\"" + displayName.replace("\"", "\\\"") + "\",\"role\":\"" + role + "\",\"email\":\"" + email.replace("\"", "\\\"") + "\",\"message\":\"Account created successfully! Welcome to TiMN.\"}");
                return;
            } else { // "login"
                if (!FileManager.userExists(identifier)) {
                    // Create account on first login
                    String displayName = !name.isEmpty() ? name : (!email.isEmpty() ? email.split("@")[0] : identifier);
                    FileManager.saveUser(displayName, role, password, email);
                    notificationService.addObserver(new UserObserver(displayName));
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"name\":\"" + displayName.replace("\"", "\\\"") + "\",\"role\":\"" + role + "\",\"email\":\"" + email.replace("\"", "\\\"") + "\",\"message\":\"Logged in successfully!\"}");
                    return;
                }

                if (!password.isEmpty() && !FileManager.verifyPassword(identifier, password)) {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"message\":\"Invalid password. Please check your credentials and try again.\"}");
                    return;
                }

                String displayName = FileManager.getUserDisplayName(identifier);
                String userRole = FileManager.getUserRole(identifier);
                if (!"ADMIN".equals(userRole)) {
                    userRole = "USER";
                }

                notificationService.addObserver(new UserObserver(displayName));
                sendJsonResponse(exchange, 200, "{\"success\":true,\"name\":\"" + displayName.replace("\"", "\\\"") + "\",\"role\":\"" + userRole + "\",\"email\":\"" + email.replace("\"", "\\\"") + "\",\"message\":\"Logged in successfully!\"}");
                return;
            }
        }
    }

    static class SupabaseSignupHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange);
            String email = getJsonString(body, "email", "").trim();
            String password = getJsonString(body, "password", "").trim();
            String name = getJsonString(body, "name", "").trim();
            String role = getJsonString(body, "role", "USER").trim().toUpperCase();

            if (email.isEmpty() || password.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Email and Password are required\"}");
                return;
            }

            if (name.isEmpty()) {
                name = email.split("@")[0];
            }

            try {
                // Call Supabase Admin API with service role key to auto-confirm user
                String payload = "{" +
                        "\"email\":\"" + email + "\"," +
                        "\"password\":\"" + password + "\"," +
                        "\"email_confirm\":true," +
                        "\"user_metadata\":{" +
                        "\"full_name\":\"" + name.replace("\"", "\\\"") + "\"," +
                        "\"role\":\"" + role + "\"" +
                        "}" +
                        "}";

                HttpClient client = HttpClient.newHttpClient();
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(SUPABASE_URL + "/auth/v1/admin/users"))
                        .header("apikey", SUPABASE_SERVICE_ROLE_KEY)
                        .header("Authorization", "Bearer " + SUPABASE_SERVICE_ROLE_KEY)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload))
                        .build();

                HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());

                if (resp.statusCode() == 200 || resp.statusCode() == 201) {
                    if (!FileManager.userExists(name)) {
                        FileManager.saveUser(name, role);
                    }
                    notificationService.addObserver(new UserObserver(name));
                    notificationService.notifyObservers("New Supabase user " + name + " registered as " + role + "!");
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Account created in Supabase successfully!\",\"name\":\"" + name.replace("\"", "\\\"") + "\",\"role\":\"" + role + "\",\"email\":\"" + email + "\"}");
                } else {
                    String respBody = resp.body();
                    String errorMsg = getJsonString(respBody, "msg", "");
                    if (errorMsg.isEmpty()) errorMsg = getJsonString(respBody, "message", "");
                    if (errorMsg.isEmpty()) errorMsg = "Supabase error (HTTP " + resp.statusCode() + ")";
                    sendJsonResponse(exchange, resp.statusCode(), "{\"success\":false,\"message\":\"" + errorMsg.replace("\"", "\\\"") + "\"}");
                }
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Internal error connecting to Supabase: " + e.getMessage() + "\"}");
            }
        }
    }

    static class SupabaseConfigHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;
            String json = "{" +
                    "\"success\":true," +
                    "\"url\":\"" + SUPABASE_URL + "\"," +
                    "\"anonKey\":\"" + SUPABASE_ANON_KEY + "\"," +
                    "\"bucket\":\"" + SUPABASE_BUCKET + "\"," +
                    "\"status\":\"connected\"" +
                    "}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    static class SupabaseInvoicesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            String method = exchange.getRequestMethod().toUpperCase();
            HttpClient client = HttpClient.newHttpClient();

            if ("GET".equals(method)) {
                try {
                    String payload = "{\"prefix\":\"\",\"limit\":100}";
                    HttpRequest req = HttpRequest.newBuilder()
                            .uri(URI.create(SUPABASE_URL + "/storage/v1/object/list/" + SUPABASE_BUCKET))
                            .header("apikey", SUPABASE_SERVICE_ROLE_KEY)
                            .header("Authorization", "Bearer " + SUPABASE_SERVICE_ROLE_KEY)
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(payload))
                            .build();

                    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
                    sendJsonResponse(exchange, resp.statusCode(), resp.body());
                } catch (Exception e) {
                    sendJsonResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
                }
            } else if ("POST".equals(method)) {
                try {
                    String body = readBody(exchange);
                    String filename = getJsonString(body, "filename", "report_" + System.currentTimeMillis() + ".html").trim();
                    String content = getJsonString(body, "content", "Empty report");
                    String contentType = filename.endsWith(".json") ? "application/json" : (filename.endsWith(".html") ? "text/html" : "text/plain");

                    HttpRequest req = HttpRequest.newBuilder()
                            .uri(URI.create(SUPABASE_URL + "/storage/v1/object/" + SUPABASE_BUCKET + "/" + filename))
                            .header("apikey", SUPABASE_SERVICE_ROLE_KEY)
                            .header("Authorization", "Bearer " + SUPABASE_SERVICE_ROLE_KEY)
                            .header("Content-Type", contentType)
                            .POST(HttpRequest.BodyPublishers.ofString(content, StandardCharsets.UTF_8))
                            .build();

                    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
                    if (resp.statusCode() == 200 || resp.statusCode() == 201) {
                        String publicUrl = SUPABASE_URL + "/storage/v1/object/public/" + SUPABASE_BUCKET + "/" + filename;
                        notificationService.notifyObservers("File '" + filename + "' uploaded to Supabase Storage bucket '" + SUPABASE_BUCKET + "'");
                        sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Uploaded to Supabase bucket '" + SUPABASE_BUCKET + "'!\",\"filename\":\"" + filename + "\",\"url\":\"" + publicUrl + "\"}");
                    } else {
                        sendJsonResponse(exchange, resp.statusCode(), resp.body());
                    }
                } catch (Exception e) {
                    sendJsonResponse(exchange, 500, "{\"error\":\"" + e.getMessage() + "\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    static class NotificationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            List<NotificationRecord> records = notificationService.getHistory();
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < records.size(); i++) {
                json.append(records.get(i).toJson());
                if (i < records.size() - 1) json.append(",");
            }
            json.append("]");

            sendJsonResponse(exchange, 200, json.toString());
        }
    }

    static class BroadcastHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange);
            String role = getUserRole(exchange, body);
            String message = getJsonString(body, "message", "").trim();

            if (!"ADMIN".equalsIgnoreCase(role)) {
                sendJsonResponse(exchange, 403, "{\"success\":false,\"message\":\"Access Denied! Only ADMIN can broadcast notifications.\"}");
                return;
            }

            if (message.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Message is required\"}");
                return;
            }

            notificationService.notifyObservers(message);
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Broadcast sent to all " + notificationService.getObservers().size() + " registered observers!\"}");
        }
    }

    static class PatternsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            List<Observer> observers = notificationService.getObservers();
            StringBuilder observerNames = new StringBuilder("[");
            for (int i = 0; i < observers.size(); i++) {
                observerNames.append("\"").append(observers.get(i).getName().replace("\"", "\\\"")).append("\"");
                if (i < observers.size() - 1) observerNames.append(",");
            }
            observerNames.append("]");

            String json = "{" +
                    "\"singleton\":{" +
                    "\"pattern\":\"Singleton Pattern\"," +
                    "\"class\":\"MovieDatabase\"," +
                    "\"description\":\"Ensures only a single centralized in-memory database instance exists across the entire application.\"," +
                    "\"instanceHash\":\"0x" + Integer.toHexString(System.identityHashCode(database)) + "\"," +
                    "\"totalMovies\":" + database.getMovies().size() +
                    "}," +
                    "\"factory\":{" +
                    "\"pattern\":\"Factory Method Pattern\"," +
                    "\"class\":\"MovieFactory\"," +
                    "\"description\":\"Encapsulates movie object creation and parsing from serialized persistence files.\"," +
                    "\"methods\":[\"createMovie(id, title, genre, language, rating, year, platform)\", \"createMovieFromFile(fileString)\"]" +
                    "}," +
                    "\"observer\":{" +
                    "\"pattern\":\"Observer Pattern\"," +
                    "\"subjectClass\":\"NotificationService\"," +
                    "\"observerClass\":\"UserObserver\"," +
                    "\"description\":\"Decoupled publish-subscribe pattern notifying subscribed users when new movies or announcements are released.\"," +
                    "\"totalSubscribers\":" + observers.size() + "," +
                    "\"subscribers\":" + observerNames + "," +
                    "\"recentNotificationsCount\":" + notificationService.getHistory().size() +
                    "}," +
                    "\"proxy\":{" +
                    "\"pattern\":\"Protection Proxy Pattern\"," +
                    "\"interfaceClass\":\"MovieService\"," +
                    "\"proxyClass\":\"MovieServiceProxy\"," +
                    "\"realSubjectClass\":\"RealMovieService\"," +
                    "\"description\":\"Controls access to sensitive administrative operations (addMovie, removeMovie). Non-admin roles are intercepted and denied before reaching the real service.\"," +
                    "\"adminPermission\":\"Allowed (Full Access)\"," +
                    "\"userPermission\":\"Denied (Read Only)\"" +
                    "}," +
                    "\"chainOfResponsibility\":{" +
                    "\"pattern\":\"Chain of Responsibility Pattern\"," +
                    "\"class\":\"RecommendationChain\"," +
                    "\"description\":\"Passes the movie catalog along a chain of filtering handlers (Genre -> Language -> Rating -> Platform) where each handler decides what to keep.\"," +
                    "\"handlers\":[\"GenreHandler\", \"LanguageHandler\", \"RatingHandler\", \"PlatformHandler\"]" +
                    "}," +
                    "\"strategy\":{" +
                    "\"pattern\":\"Strategy Pattern\"," +
                    "\"contextClass\":\"CatalogSorterContext\"," +
                    "\"strategyInterface\":\"MovieSortStrategy\"," +
                    "\"description\":\"Encapsulates dynamic sorting algorithms into interchangeable strategy classes (Rating, Year, Title, Popularity) selectable at runtime.\"," +
                    "\"strategies\":[\"RatingSortStrategy\", \"YearSortStrategy\", \"TitleSortStrategy\", \"PopularitySortStrategy\"]" +
                    "}," +
                    "\"templateMethod\":{" +
                    "\"pattern\":\"Template Method Pattern\"," +
                    "\"abstractClass\":\"WatchlistReportTemplate\"," +
                    "\"templateMethod\":\"generateReport(username, movies)\"," +
                    "\"description\":\"Defines the skeleton of a watchlist report in a base template class, deferring header, row, and footer formatting to concrete subclasses.\"," +
                    "\"concreteTemplates\":[\"MarkdownWatchlistReport\", \"PlainTextWatchlistReport\", \"JsonWatchlistReport\"]" +
                    "}," +
                    "\"memento\":{" +
                    "\"pattern\":\"Memento Pattern\"," +
                    "\"mementoClass\":\"WatchlistMemento\"," +
                    "\"caretakerClass\":\"WatchlistCaretaker\"," +
                    "\"description\":\"Captures and externalizes internal watchlist state snapshots, enabling clean undo and rollback of additions and deletions without exposing private fields.\"," +
                    "\"totalSnapshotsTaken\":" + WatchlistCaretaker.getTotalSnapshotsTaken() +
                    "}" +
                    "}";

            sendJsonResponse(exchange, 200, json);
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handlePreflight(exchange)) return;

            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Remove leading slash
            if (path.startsWith("/")) path = path.substring(1);

            File file = new File(frontendDir, path);
            if (!file.exists() || file.isDirectory()) {
                // Try fallback to index.html for SPA routing or 404
                file = new File(frontendDir, "index.html");
                if (!file.exists()) {
                    sendResponse(exchange, 404, "404 Not Found - Frontend directory not found.", "text/plain");
                    return;
                }
            }

            String mimeType = getMimeType(file.getName());
            byte[] fileBytes = Files.readAllBytes(file.toPath());

            addCorsHeaders(exchange);
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private String getMimeType(String filename) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".ico")) return "image/x-icon";
            return "application/octet-stream";
        }
    }
}
