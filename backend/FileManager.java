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
            new File(userFile).createNewFile();
            new File(watchlistFile).createNewFile();
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
        initializeFiles();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(userFile, true))) {
            writer.write(name + "|" + role);
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Error saving user: " + e.getMessage());
        }
    }

    public static boolean userExists(String name) {
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 1 && parts[0].equalsIgnoreCase(name.trim())) return true;
            }
        } catch (IOException e) {
            return false;
        }
        return false;
    }

    public static String getUserRole(String name) {
        initializeFiles();
        try (BufferedReader reader = new BufferedReader(new FileReader(userFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 2 && parts[0].equalsIgnoreCase(name.trim())) {
                    return parts[1].trim();
                }
            }
        } catch (IOException e) {
            return "USER";
        }
        return "USER";
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
}
