import java.util.*;

/**
 * Strategy Pattern Implementation for CinePattern
 * Encapsulates sorting algorithms into interchangeable strategy classes.
 */
public interface MovieSortStrategy {
    List<Movie> sort(List<Movie> movies);
    String getStrategyName();
    String getDescription();
}

/**
 * Concrete Strategy 1: Highest Rating First
 */
class RatingSortStrategy implements MovieSortStrategy {
    @Override
    public List<Movie> sort(List<Movie> movies) {
        List<Movie> result = new ArrayList<>(movies);
        result.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));
        return result;
    }

    @Override
    public String getStrategyName() {
        return "Rating (Highest First)";
    }

    @Override
    public String getDescription() {
        return "Sorts movies in descending order based on IMDb score.";
    }
}

/**
 * Concrete Strategy 2: Newest Release Year First
 */
class YearSortStrategy implements MovieSortStrategy {
    @Override
    public List<Movie> sort(List<Movie> movies) {
        List<Movie> result = new ArrayList<>(movies);
        result.sort((a, b) -> Integer.compare(b.getYear(), a.getYear()));
        return result;
    }

    @Override
    public String getStrategyName() {
        return "Release Year (Newest First)";
    }

    @Override
    public String getDescription() {
        return "Sorts movies in descending order of release year.";
    }
}

/**
 * Concrete Strategy 3: Alphabetical Title (A - Z)
 */
class TitleSortStrategy implements MovieSortStrategy {
    @Override
    public List<Movie> sort(List<Movie> movies) {
        List<Movie> result = new ArrayList<>(movies);
        result.sort(Comparator.comparing(Movie::getTitle, String.CASE_INSENSITIVE_ORDER));
        return result;
    }

    @Override
    public String getStrategyName() {
        return "Title (A to Z)";
    }

    @Override
    public String getDescription() {
        return "Sorts movies alphabetically by title from A to Z.";
    }
}

/**
 * Concrete Strategy 4: Binge-Worthy Popularity Score
 * Weighted score combining rating (80%) and recency (20%)
 */
class PopularitySortStrategy implements MovieSortStrategy {
    @Override
    public List<Movie> sort(List<Movie> movies) {
        List<Movie> result = new ArrayList<>(movies);
        result.sort((a, b) -> {
            double scoreA = (a.getRating() * 10.0) + ((a.getYear() - 1970) * 0.15);
            double scoreB = (b.getRating() * 10.0) + ((b.getYear() - 1970) * 0.15);
            return Double.compare(scoreB, scoreA);
        });
        return result;
    }

    @Override
    public String getStrategyName() {
        return "Binge Score (Popularity)";
    }

    @Override
    public String getDescription() {
        return "Calculates a composite score based on rating and release recency.";
    }
}

/**
 * Context Class that holds a reference to the selected strategy
 */
class CatalogSorterContext {
    private MovieSortStrategy strategy;

    public CatalogSorterContext() {
        this.strategy = new RatingSortStrategy(); // Default strategy
    }

    public CatalogSorterContext(MovieSortStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(MovieSortStrategy strategy) {
        this.strategy = strategy;
    }

    public MovieSortStrategy getStrategy() {
        return strategy;
    }

    public List<Movie> executeSort(List<Movie> movies) {
        if (strategy == null) {
            strategy = new RatingSortStrategy();
        }
        return strategy.sort(movies);
    }

    public static MovieSortStrategy getStrategyByName(String name) {
        if (name == null) return new RatingSortStrategy();
        switch (name.trim().toLowerCase()) {
            case "year":
            case "newest":
                return new YearSortStrategy();
            case "title":
            case "alpha":
            case "az":
                return new TitleSortStrategy();
            case "popularity":
            case "score":
            case "binge":
                return new PopularitySortStrategy();
            case "rating":
            default:
                return new RatingSortStrategy();
        }
    }
}
