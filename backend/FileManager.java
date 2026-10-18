import java.io.*;
import java.util.*;

public class FileManager {
    private static String dataFolder = resolveDataFolder();
    private static String movieFile = dataFolder + File.separator + "movies.txt";
    private static String userFile = dataFolder + File.separator + "users.txt";
    private static String watchlistFile = dataFolder + File.separator + "watchlist.txt";

    private static String resolveDataFolder() {
        File directData = new File("data");
        if (directData.exists() && directData.isDirectory()) {
            return "data";
        }
        File backendData = new File("backend" + File.separator + "data");
        if (backendData.exists() && backendData.isDirectory()) {
            return "backend" + File.separator + "data";
        }
        return "data";
    }

    public static void initializeFiles() {
        dataFolder = resolveDataFolder();
        movieFile = dataFolder + File.separator + "movies.txt";
        userFile = dataFolder + File.separator + "users.txt";
        watchlistFile = dataFolder + File.separator + "watchlist.txt";

        File folder = new File(dataFolder);
        if (!folder.exists()) folder.mkdirs();
        try {
            new File(movieFile).createNewFile();
            File uFile = new File(userFile);
            boolean created = uFile.createNewFile();
            new File(watchlistFile).createNewFile();

            // Seed admin@gmail.com if not exists
            if (!userExists("admin@gmail.com")) {
                saveUser("Admin", "ADMIN", "admin123", "admin@gmail.com");
            }
        } catch (IOException e) {
            System.out.println("Error creating data files: " + e.getMessage());
        }
    }

    public static List<Movie> loadMovies() {
        initializeFiles();
        List<Movie> movies = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(movieFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    try {
                        Movie movie = MovieFactory.createMovieFromFile(line);
                        if (movie != null) movies.add(movie);
                    } catch (Exception ignored) { }
                }
            }
        } catch (IOException e) {
            System.out.println("Error loading movies: " + e.getMessage());
        }
        return movies;
    }

    public static void saveMovies(List<Movie> movies) {
        initializeFiles();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(movieFile))) {
            for (Movie movie : movies) {
                writer.write(movie.toFileString());
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error saving movies: " + e.getMessage());
        }
    }

    public static void saveUser(String name, String role) {
        saveUser(name, role, "", "");
    }

    public static void saveUser(String name, String role, String password, String email) {
        initializeFiles();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(userFile, true))) {
            writer.write(name + "|" + role + "|" + password + "|" + email);
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Error saving user: " + e.getMessage());
        }
    }

    public static boolean userExists(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) return false;
        if ("admin@gmail.com".equalsIgnoreCase(identifier.trim()) || "admin".equalsIgnoreCase(identifier.trim())) return true;
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 1 && parts[0].equalsIgnoreCase(identifier.trim())) return true;
                if (parts.length >= 4 && parts[3].equalsIgnoreCase(identifier.trim())) return true;
            }
        } catch (IOException e) {
            return false;
        }
        return false;
    }

    public static String getUserRole(String identifier) {
        if (identifier == null) return "USER";
        if ("admin@gmail.com".equalsIgnoreCase(identifier.trim()) || "admin".equalsIgnoreCase(identifier.trim())) return "ADMIN";
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 2) {
                    if (parts[0].equalsIgnoreCase(identifier.trim()) || (parts.length >= 4 && parts[3].equalsIgnoreCase(identifier.trim()))) {
                        return parts[1].trim();
                    }
                }
            }
        } catch (IOException e) {
            return "USER";
        }
        return "USER";
    }

    public static boolean verifyPassword(String identifier, String password) {
        if (identifier == null) return false;
        if ("admin@gmail.com".equalsIgnoreCase(identifier.trim()) || "admin".equalsIgnoreCase(identifier.trim())) {
            return "admin123".equals(password);
        }
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                boolean match = (parts.length >= 1 && parts[0].equalsIgnoreCase(identifier.trim())) ||
                                (parts.length >= 4 && parts[3].equalsIgnoreCase(identifier.trim()));
                if (match) {
                    if (parts.length >= 3 && !parts[2].trim().isEmpty()) {
                        return parts[2].trim().equals(password);
                    }
                    return true;
                }
            }
        } catch (IOException e) {
            return false;
        }
        return false;
    }

    public static String getUserDisplayName(String identifier) {
        if (identifier == null) return "User";
        if ("admin@gmail.com".equalsIgnoreCase(identifier.trim()) || "admin".equalsIgnoreCase(identifier.trim())) return "Admin";
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 4 && parts[3].equalsIgnoreCase(identifier.trim())) {
                    return parts[0].trim();
                }
                if (parts.length >= 1 && parts[0].equalsIgnoreCase(identifier.trim())) {
                    return parts[0].trim();
                }
            }
        } catch (IOException ignored) {}
        return identifier;
    }

    public static List<String[]> getAllUsers() {
        initializeFiles();
        List<String[]> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 2) {
                    list.add(new String[]{ parts[0].trim(), parts[1].trim() });
                }
            }
        } catch (IOException ignored) {}
        return list;
    }

    public static void saveWatchlist(String user, Movie movie) {
        initializeFiles();
        if (isMovieInWatchlist(user, movie.getId())) {
            return; // Already in watchlist
        }
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(watchlistFile, true))) {
            writer.write(user + "|" + movie.toFileString());
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Error saving watchlist: " + e.getMessage());
        }
    }

    public static boolean isMovieInWatchlist(String user, int movieId) {
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(watchlistFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user.trim())) {
                    try {
                        if (Integer.parseInt(parts[1]) == movieId) return true;
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (IOException ignored) {}
        return false;
    }

    public static List<String> loadWatchlist(String user) {
        initializeFiles();
        List<String> watchlist = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(watchlistFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user.trim())) watchlist.add(parts[2]);
            }
        } catch (IOException e) {
            System.out.println("Error loading watchlist: " + e.getMessage());
        }
        return watchlist;
    }

    public static List<Movie> loadUserWatchlistMovies(String user) {
        initializeFiles();
        List<Movie> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(watchlistFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user.trim())) {
                    try {
                        Movie m = new Movie(
                                Integer.parseInt(parts[1]),
                                parts[2],
                                parts[3],
                                parts[4],
                                Double.parseDouble(parts[5]),
                                Integer.parseInt(parts[6]),
                                parts[7]
                        );
                        list.add(m);
                    } catch (Exception ignored) {}
                }
            }
        } catch (IOException ignored) {}
        return list;
    }

    public static boolean removeFromWatchlist(String user, int movieId) {
        initializeFiles();
        File src = new File(watchlistFile);
        File temp = new File(dataFolder + File.separator + "watchlist_temp.txt");
        boolean removed = false;
        try (BufferedReader reader = new BufferedReader(new FileReader(src));
             BufferedWriter writer = new BufferedWriter(new FileWriter(temp))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user.trim())) {
                    try {
                        if (Integer.parseInt(parts[1]) == movieId) {
                            removed = true;
                            continue; // Skip this line
                        }
                    } catch (NumberFormatException ignored) {}
                }
                writer.write(line);
                writer.newLine();
            }
        } catch (IOException e) {
            return false;
        }

        if (src.delete()) {
            temp.renameTo(src);
        }
        return removed;
    }

    public static List<Integer> getUserWatchlistIds(String user) {
        initializeFiles();
        List<Integer> ids = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(watchlistFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user.trim())) {
                    try {
                        ids.add(Integer.parseInt(parts[1]));
                    } catch (NumberFormatException ignored) {}
                }
            }
        } catch (IOException ignored) {}
        return ids;
    }

    public static void restoreUserWatchlist(String user, List<Integer> movieIds) {
        initializeFiles();
        File src = new File(watchlistFile);
        File temp = new File(dataFolder + File.separator + "watchlist_restore_temp.txt");
        MovieDatabase db = MovieDatabase.getInstance();
        try (BufferedReader reader = new BufferedReader(new FileReader(src));
             BufferedWriter writer = new BufferedWriter(new FileWriter(temp))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (!parts[0].equalsIgnoreCase(user.trim())) {
                    writer.write(line);
                    writer.newLine();
                }
            }
            for (Integer id : movieIds) {
                Movie m = db.findMovieById(id);
                if (m != null) {
                    writer.write(user + "|" + m.toFileString());
                    writer.newLine();
                }
            }
        } catch (IOException ignored) {}

        if (src.delete()) {
            temp.renameTo(src);
        }
    }
}
