import java.util.*;

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

    public void loadMovies() {
        movies = FileManager.loadMovies();
    }

    public void addMovie(Movie movie) {
        movies.add(movie);
        FileManager.saveMovies(movies);
    }

    public void removeMovie(int id) {
        movies.removeIf(movie -> movie.getId() == id);
        FileManager.saveMovies(movies);
    }

    public List<Movie> getMovies() {
        return movies;
    }

    public Movie findMovieByTitle(String title) {
        if (title == null) return null;
        for (Movie movie : movies) {
            if (movie.getTitle().equalsIgnoreCase(title.trim())) {
                return movie;
            }
        }
        return null;
    }

    public Movie findMovieById(int id) {
        for (Movie movie : movies) {
            if (movie.getId() == id) {
                return movie;
            }
        }
        return null;
    }

    public int getNextAvailableId() {
        int max = 0;
        for (Movie m : movies) {
            if (m.getId() > max) max = m.getId();
        }
        return max + 1;
    }

    public void showAllMovies() {
        System.out.println("\n========== ALL MOVIES ==========\n");
        if (movies.isEmpty()) {
            System.out.println("No movies available.");
            return;
        }
        for (Movie movie : movies) {
            movie.showDetails();
        }
    }
}