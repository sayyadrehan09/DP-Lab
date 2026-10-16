import java.util.*;

public class Main {
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        FileManager.initializeFiles();

        MovieDatabase database = MovieDatabase.getInstance();
        database.loadMovies();

        NotificationService notificationService = new NotificationService();

        System.out.println("==============================================");
        System.out.println("       MOVIE & OTT RECOMMENDATION SYSTEM");
        System.out.println("==============================================");

        System.out.print("\nEnter your name: ");
        String name = scanner.nextLine().trim();

        String role = loginUser(name);

        if (!FileManager.userExists(name)) {
            FileManager.saveUser(name, role);
        }

        notificationService.addObserver(new UserObserver(name));

        MovieService movieService = new MovieServiceProxy(role);

        while (true) {
            showMenu(role);

            int choice = readInt("Enter choice: ");

            if (role.equals("USER")) {
                switch (choice) {
                    case 1:
                        viewTopMovies(database);
                        break;

                    case 2:
                        getRecommendations(database);
                        break;

                    case 3:
                        addToWatchlist(database, name);
                        break;

                    case 4:
                        viewWatchlist(name);
                        break;

                    case 5:
                        System.out.println("\nThank you for using the system.");
                        scanner.close();
                        return;

                    default:
                        System.out.println("\nInvalid choice. Please try again.");
                }
            } else {
                switch (choice) {
                    case 1:
                        viewTopMovies(database);
                        break;

                    case 2:
                        getRecommendations(database);
                        break;

                    case 3:
                        addToWatchlist(database, name);
                        break;

                    case 4:
                        viewWatchlist(name);
                        break;

                    case 5:
                        addMovie(movieService, notificationService);
                        break;

                    case 6:
                        removeMovie(movieService);
                        break;

                    case 7:
                        notificationService.notifyObservers(
                                "New movies and recommendations are available!"
                        );
                        break;

                    case 8:
                        System.out.println("\nThank you for using the system.");
                        scanner.close();
                        return;

                    default:
                        System.out.println("\nInvalid choice. Please try again.");
                }
            }
        }
    }

    static String loginUser(String name) {
        while (true) {
            System.out.println("\nSelect Role:");
            System.out.println("1. User");
            System.out.println("2. Admin");

            String choice = scanner.nextLine().trim();

            if (choice.equals("1")) {
                return "USER";
            } else if (choice.equals("2")) {
                return "ADMIN";
            } else {
                System.out.println(
                        "Invalid choice. Please select role again."
                );
            }
        }
    }

    static void showMenu(String role) {
        System.out.println("\n============== MENU ==============");
        System.out.println("1. View Top 5 Movies");
        System.out.println("2. Get Recommendations");
        System.out.println("3. Add Movie to Watchlist");
        System.out.println("4. View Watchlist");

        if (role.equals("ADMIN")) {
            System.out.println("5. Add Movie");
            System.out.println("6. Remove Movie");
            System.out.println("7. Send Notification");
            System.out.println("8. Exit");
        } else {
            System.out.println("5. Exit");
        }
    }

    static void viewTopMovies(MovieDatabase database) {
        List<Movie> topMovies = new ArrayList<>();

        for (Movie movie : database.getMovies()) {
            if (movie.getRating() >= 9.0) {
                topMovies.add(movie);
            }
        }

        topMovies.sort((movie1, movie2) ->
                Double.compare(movie2.getRating(), movie1.getRating())
        );

        System.out.println("\n==============================================");
        System.out.println("               TOP 5 MOVIES");
        System.out.println("             Rating 9.0+ Movies");
        System.out.println("==============================================");

        if (topMovies.isEmpty()) {
            System.out.println(
                    "\nNo movies with rating 9.0 or above."
            );
            return;
        }

        int limit = Math.min(5, topMovies.size());

        for (int i = 0; i < limit; i++) {
            System.out.println("\nRank: " + (i + 1));
            topMovies.get(i).showDetails();
        }

        System.out.println(
                "\nTotal Top Movies Shown: " + limit
        );
    }

    static void getRecommendations(MovieDatabase database) {
        System.out.println("\n========== MOVIE RECOMMENDATION ==========");

        String genre = selectGenre();
        String language = selectLanguage();
        double rating = selectRating();
        String platform = selectPlatform();

        RecommendationChain chain = new RecommendationChain();

        List<Movie> recommendations = chain.recommend(
                database.getMovies(),
                genre,
                language,
                rating,
                platform
        );

        System.out.println("\n==============================================");
        System.out.println("           RECOMMENDED MOVIES");
        System.out.println("==============================================");

        if (recommendations.isEmpty()) {
            System.out.println(
                    "\nNo movies found matching your preferences."
            );
        } else {
            for (Movie movie : recommendations) {
                System.out.println();
                movie.showDetails();
            }

            System.out.println(
                    "Total Recommendations: " + recommendations.size()
            );
        }
    }

    static String selectGenre() {
        while (true) {
            System.out.println("\nSelect Genre:");
            System.out.println("1. Action");
            System.out.println("2. Comedy");
            System.out.println("3. Sci-Fi");
            System.out.println("4. Drama");
            System.out.println("5. Thriller");
            System.out.println("6. Any");

            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1:
                    return "Action";
                case 2:
                    return "Comedy";
                case 3:
                    return "Sci-Fi";
                case 4:
                    return "Drama";
                case 5:
                    return "Thriller";
                case 6:
                    return "Any";
                default:
                    System.out.println(
                            "Invalid choice. Please select genre again."
                    );
            }
        }
    }

    static String selectLanguage() {
        while (true) {
            System.out.println("\nSelect Language:");
            System.out.println("1. English");
            System.out.println("2. Hindi");
            System.out.println("3. Any");

            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1:
                    return "English";
                case 2:
                    return "Hindi";
                case 3:
                    return "Any";
                default:
                    System.out.println(
                            "Invalid choice. Please select language again."
                    );
            }
        }
    }

    static double selectRating() {
        while (true) {
            double rating = readDouble(
                    "\nEnter minimum rating (0-10): "
            );

            if (rating >= 0 && rating <= 10) {
                return rating;
            }

            System.out.println(
                    "Invalid rating. Please enter a rating between 0 and 10."
            );
        }
    }

    static String selectPlatform() {
        while (true) {
            System.out.println("\nSelect OTT Platform:");
            System.out.println("1. Netflix");
            System.out.println("2. Prime Video");
            System.out.println("3. Disney+");
            System.out.println("4. Any");

            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1:
                    return "Netflix";
                case 2:
                    return "Prime Video";
                case 3:
                    return "Disney+";
                case 4:
                    return "Any";
                default:
                    System.out.println(
                            "Invalid choice. Please select platform again."
                    );
            }
        }
    }

    static void addToWatchlist(
            MovieDatabase database,
            String user
    ) {
        System.out.print("\nEnter movie title: ");

        String title = scanner.nextLine().trim();

        Movie movie = database.findMovieByTitle(title);

        if (movie == null) {
            System.out.println("Movie not found.");
            return;
        }

        FileManager.saveWatchlist(user, movie);

        System.out.println(
                movie.getTitle() + " added to your watchlist."
        );
    }

    static void viewWatchlist(String user) {
        List<String> watchlist =
                FileManager.loadWatchlist(user);

        System.out.println("\n========== YOUR WATCHLIST ==========");

        if (watchlist.isEmpty()) {
            System.out.println("Your watchlist is empty.");
            return;
        }

        for (int i = 0; i < watchlist.size(); i++) {
            System.out.println(
                    (i + 1) + ". " + watchlist.get(i)
            );
        }
    }

    static void addMovie(
            MovieService movieService,
            NotificationService notificationService
    ) {
        System.out.println("\n========== ADD MOVIE ==========");

        int id = readInt("Movie ID: ");

        System.out.print("Title: ");
        String title = scanner.nextLine().trim();

        System.out.print("Genre: ");
        String genre = scanner.nextLine().trim();

        System.out.print("Language: ");
        String language = scanner.nextLine().trim();

        double rating = selectRating();

        int year = readInt("Year: ");

        System.out.print("OTT Platform: ");
        String platform = scanner.nextLine().trim();

        Movie movie = MovieFactory.createMovie(
                id,
                title,
                genre,
                language,
                rating,
                year,
                platform
        );

        movieService.addMovie(movie);

        notificationService.notifyObservers(
                "New movie added: " + title
        );
    }

    static void removeMovie(MovieService movieService) {
        int id = readInt(
                "\nEnter Movie ID to remove: "
        );

        movieService.removeMovie(id);
    }

    static int readInt(String message) {
        while (true) {
            try {
                System.out.print(message);

                String input = scanner.nextLine().trim();

                return Integer.parseInt(input);

            } catch (NumberFormatException e) {
                System.out.println(
                        "Please enter a valid number."
                );
            }
        }
    }

    static double readDouble(String message) {
        while (true) {
            try {
                System.out.print(message);

                String input = scanner.nextLine().trim();

                return Double.parseDouble(input);

            } catch (NumberFormatException e) {
                System.out.println(
                        "Please enter a valid number."
                );
            }
        }
    }
}