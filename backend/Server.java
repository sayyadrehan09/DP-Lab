import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
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
        server.createContext("/api/watchlist", new WatchlistHandler());
        server.createContext("/api/login", new LoginHandler());
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
                String user = params.getOrDefault("user", "").trim();

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
                String user = getJsonString(body, "user", "").trim();
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

                FileManager.saveWatchlist(user, movie);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"" + movie.getTitle() + " added to your watchlist.\"}");

            } else if ("DELETE".equalsIgnoreCase(method)) {
                Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
                String user = params.getOrDefault("user", "").trim();
                int movieId = -1;
                try {
                    movieId = Integer.parseInt(params.getOrDefault("movieId", "-1"));
                } catch (NumberFormatException ignored) {}

                if (user.isEmpty() || movieId <= 0) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"user and movieId required\"}");
                    return;
                }

                boolean removed = FileManager.removeFromWatchlist(user, movieId);
                if (removed) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Movie removed from your watchlist.\"}");
                } else {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Movie not found in watchlist.\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
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
            String name = getJsonString(body, "name", "").trim();
            String requestedRole = getJsonString(body, "role", "USER").trim().toUpperCase();

            if (name.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Name is required\"}");
                return;
            }

            String actualRole = requestedRole;
            if (FileManager.userExists(name)) {
                actualRole = FileManager.getUserRole(name);
            } else {
                FileManager.saveUser(name, actualRole);
            }

            // Register in Observer Pattern
            notificationService.addObserver(new UserObserver(name));

            sendJsonResponse(exchange, 200, "{\"success\":true,\"name\":\"" + name.replace("\"", "\\\"") + "\",\"role\":\"" + actualRole + "\"}");
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
