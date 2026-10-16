import java.util.*;
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

    public void loadMovies() {
        movies = FileManager.loadMovies();
    }
    public void addMovie(Movie movie) {
        movies.add(movie); FileManager.saveMovies(movies);
    }
    public void removeMovie(int id) {
        movies.removeIf(movie -> movie.getId() == id); FileManager.saveMovies(movies);
    }
    public List<Movie> getMovies() {
        return movies;
    }

    public Movie findMovieByTitle(String title) {
        for (Movie movie : movies) {
            if (movie.getTitle().equalsIgnoreCase(title)) {
                return movie;
            }
        }
        return null;
    }
    public void showAllMovies() {
        System.out.println("\n========== ALL MOVIES ==========\n");
        if (movies.isEmpty()) {
            System.out.println("No movies available.");
            return;
        }
        for (Movie movie : movies){
            movie.showDetails();
        }
    }
}