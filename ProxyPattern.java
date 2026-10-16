interface MovieService {
    void addMovie(Movie movie);
    void removeMovie(int id);
    void viewMovies();
}

class RealMovieService implements MovieService {
    private MovieDatabase database = MovieDatabase.getInstance();
    public void addMovie(Movie movie) { database.addMovie(movie); System.out.println("\nMovie added successfully."); }
    public void removeMovie(int id) { database.removeMovie(id); System.out.println("\nMovie removed successfully."); }
    public void viewMovies() { database.showAllMovies(); }
}

class MovieServiceProxy implements MovieService {
    private RealMovieService realService = new RealMovieService();
    private String role;
    public MovieServiceProxy(String role) { this.role = role; }
    public void addMovie(Movie movie) {
        if (role.equalsIgnoreCase("ADMIN")) realService.addMovie(movie);
        else System.out.println("\nAccess Denied! Only ADMIN can add movies.");
    }
    public void removeMovie(int id) {
        if (role.equalsIgnoreCase("ADMIN")) realService.removeMovie(id);
        else System.out.println("\nAccess Denied! Only ADMIN can remove movies.");
    }
    public void viewMovies() { realService.viewMovies(); }
}
