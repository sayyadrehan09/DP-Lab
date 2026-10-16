import java.io.*;
import java.util.*;

public class FileManager {
    private static final String DATA_FOLDER = "data";
    private static final String MOVIE_FILE = "data/movies.txt";
    private static final String USER_FILE = "data/users.txt";
    private static final String WATCHLIST_FILE = "data/watchlist.txt";

    public static void initializeFiles() {
        File folder = new File(DATA_FOLDER);
        if (!folder.exists()) folder.mkdir();
        try {
            new File(MOVIE_FILE).createNewFile();
            new File(USER_FILE).createNewFile();
            new File(WATCHLIST_FILE).createNewFile();
        } catch (IOException e) {
            System.out.println("Error creating data files.");
        }
    }

    public static List<Movie> loadMovies() {
        List<Movie> movies = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(MOVIE_FILE))) {
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
            System.out.println("Error loading movies.");
        }
        return movies;
    }

    public static void saveMovies(List<Movie> movies) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(MOVIE_FILE))) {
            for (Movie movie : movies) {
                writer.write(movie.toFileString());
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error saving movies.");
        }
    }

    public static void saveUser(String name, String role) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(USER_FILE, true))) {
            writer.write(name + "|" + role);
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Error saving user.");
        }
    }

    public static boolean userExists(String name) {
        try (BufferedReader reader = new BufferedReader(new FileReader(USER_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 1 && parts[0].equalsIgnoreCase(name)) return true;
            }
        } catch (IOException e) {
            return false;
        }
        return false;
    }

    public static void saveWatchlist(String user, Movie movie) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(WATCHLIST_FILE, true))) {
            writer.write(user + "|" + movie.toFileString());
            writer.newLine();
        } catch (IOException e) {
            System.out.println("Error saving watchlist.");
        }
    }

    public static List<String> loadWatchlist(String user) {
        List<String> watchlist = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(WATCHLIST_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", -1);
                if (parts.length >= 8 && parts[0].equalsIgnoreCase(user)) watchlist.add(parts[2]);
            }
        } catch (IOException e) {
            System.out.println("Error loading watchlist.");
        }
        return watchlist;
    }
}
