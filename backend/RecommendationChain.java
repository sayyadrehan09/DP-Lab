import java.util.*;

abstract class RecommendationHandler {
    protected RecommendationHandler next;

    public void setNext(RecommendationHandler next) {
        this.next = next;
    }

    public abstract List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform);

    public List<Movie> filterWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        return filter(movies, genre, language, rating, platform);
    }
}

class ChainTraceStep {
    private String handlerName;
    private String filterApplied;
    private int inputCount;
    private int outputCount;

    public ChainTraceStep(String handlerName, String filterApplied, int inputCount, int outputCount) {
        this.handlerName = handlerName;
        this.filterApplied = filterApplied;
        this.inputCount = inputCount;
        this.outputCount = outputCount;
    }

    public String getHandlerName() { return handlerName; }
    public String getFilterApplied() { return filterApplied; }
    public int getInputCount() { return inputCount; }
    public int getOutputCount() { return outputCount; }

    public String toJson() {
        return "{" +
                "\"handler\":\"" + handlerName + "\"," +
                "\"filter\":\"" + filterApplied.replace("\"", "\\\"") + "\"," +
                "\"inputCount\":" + inputCount + "," +
                "\"outputCount\":" + outputCount +
                "}";
    }
}

class GenreHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (genre.equalsIgnoreCase("Any") || movie.getGenre().equalsIgnoreCase(genre)) {
                result.add(movie);
            }
        }
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }

    @Override
    public List<Movie> filterWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (genre.equalsIgnoreCase("Any") || movie.getGenre().equalsIgnoreCase(genre)) {
                result.add(movie);
            }
        }
        trace.add(new ChainTraceStep("GenreHandler", "Genre == " + genre, movies.size(), result.size()));
        return next == null ? result : next.filterWithTrace(result, genre, language, rating, platform, trace);
    }
}

class LanguageHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (language.equalsIgnoreCase("Any") || movie.getLanguage().equalsIgnoreCase(language)) {
                result.add(movie);
            }
        }
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }

    @Override
    public List<Movie> filterWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (language.equalsIgnoreCase("Any") || movie.getLanguage().equalsIgnoreCase(language)) {
                result.add(movie);
            }
        }
        trace.add(new ChainTraceStep("LanguageHandler", "Language == " + language, movies.size(), result.size()));
        return next == null ? result : next.filterWithTrace(result, genre, language, rating, platform, trace);
    }
}

class RatingHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (movie.getRating() >= rating) {
                result.add(movie);
            }
        }
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }

    @Override
    public List<Movie> filterWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (movie.getRating() >= rating) {
                result.add(movie);
            }
        }
        trace.add(new ChainTraceStep("RatingHandler", "Rating >= " + rating, movies.size(), result.size()));
        return next == null ? result : next.filterWithTrace(result, genre, language, rating, platform, trace);
    }
}

class PlatformHandler extends RecommendationHandler {
    public List<Movie> filter(List<Movie> movies, String genre, String language, double rating, String platform) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (platform.equalsIgnoreCase("Any") || movie.getPlatform().equalsIgnoreCase(platform)) {
                result.add(movie);
            }
        }
        return next == null ? result : next.filter(result, genre, language, rating, platform);
    }

    @Override
    public List<Movie> filterWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        List<Movie> result = new ArrayList<>();
        for (Movie movie : movies) {
            if (platform.equalsIgnoreCase("Any") || movie.getPlatform().equalsIgnoreCase(platform)) {
                result.add(movie);
            }
        }
        trace.add(new ChainTraceStep("PlatformHandler", "Platform == " + platform, movies.size(), result.size()));
        return next == null ? result : next.filterWithTrace(result, genre, language, rating, platform, trace);
    }
}

public class RecommendationChain {
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

    public List<Movie> recommendWithTrace(List<Movie> movies, String genre, String language, double rating, String platform, List<ChainTraceStep> trace) {
        return chain.filterWithTrace(movies, genre, language, rating, platform, trace);
    }
}
