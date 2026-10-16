interface MovieService {
    void addMovie(Movie movie);
    void removeMovie(int id);
    void viewMovies();
}

class RealMovieService implements MovieService {
    private MovieDatabase database = MovieDatabase.getInstance();

    public void addMovie(Movie movie) {
        database.addMovie(movie);
        System.out.println("\n[RealMovieService] Movie added successfully.");
    }

    public void removeMovie(int id) {
        database.removeMovie(id);
        System.out.println("\n[RealMovieService] Movie removed successfully.");
    }

    public void viewMovies() {
        database.showAllMovies();
    }
}

class MovieServiceProxy implements MovieService {
    private RealMovieService realService = new RealMovieService();
    private String role;
    private String lastStatusMessage = "";
    private boolean lastSuccess = false;

    public MovieServiceProxy(String role) {
        this.role = (role == null) ? "USER" : role.trim().toUpperCase();
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public String getLastStatusMessage() {
        return lastStatusMessage;
    }

    public boolean isLastSuccess() {
        return lastSuccess;
    }

    public void addMovie(Movie movie) {
        if (isAdmin()) {
            realService.addMovie(movie);
            lastSuccess = true;
            lastStatusMessage = "Movie added successfully via RealMovieService.";
        } else {
            lastSuccess = false;
            lastStatusMessage = "Access Denied! Proxy Pattern blocked operation: Only ADMIN can add movies.";
            System.out.println("\n" + lastStatusMessage);
        }
    }

    public void removeMovie(int id) {
        if (isAdmin()) {
            realService.removeMovie(id);
            lastSuccess = true;
            lastStatusMessage = "Movie ID " + id + " removed successfully via RealMovieService.";
        } else {
            lastSuccess = false;
            lastStatusMessage = "Access Denied! Proxy Pattern blocked operation: Only ADMIN can remove movies.";
            System.out.println("\n" + lastStatusMessage);
        }
    }

    public void viewMovies() {
        // Both USER and ADMIN are allowed to view
        realService.viewMovies();
    }
}
