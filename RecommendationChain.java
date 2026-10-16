import java.util.*;

abstract class RecommendationHandler {
    protected RecommendationHandler next;
    public void setNext(RecommendationHandler next) { this.next = next; }
    public abstract List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform);
}

class GenreHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) if (genre.equalsIgnoreCase("Any") || movie.getGenre().equalsIgnoreCase(genre)) result.add(movie);
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }
}

class LanguageHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) if (language.equalsIgnoreCase("Any") || movie.getLanguage().equalsIgnoreCase(language)) result.add(movie);
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }
}

class RatingHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) if (movie.getRating() >= rating) result.add(movie);
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }
}

class PlatformHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) if (platform.equalsIgnoreCase("Any") || movie.getPlatform().equalsIgnoreCase(platform)) result.add(movie);
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }
}

class RecommendationChain {
    private RecommendationHandler chain;
    public RecommendationChain() {
        RecommendationHandler genre = new GenreHandler();
        RecommendationHandler language = new LanguageHandler();
        RecommendationHandler rating = new RatingHandler();
        RecommendationHandler platform = new PlatformHandler();
        genre.setNext(language);
        language.setNext(rating);
        rating.setNext(platform);
        chain = genre;
    }
    public List<Movie> recommend(List<Movie> movies, String genre, String language, double rating, String platform) {
        return chain.filter(movies, genre, language, rating, platform);
    }
}
