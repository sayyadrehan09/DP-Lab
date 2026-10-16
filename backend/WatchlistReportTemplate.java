import java.util.*;

/**
 * Template Method Pattern Implementation for CinePattern
 * Defines the skeleton of a watchlist reporting algorithm in an abstract superclass,
 * deferring formatting of header, rows, and footer to concrete subclasses.
 */
public abstract class WatchlistReportTemplate {

    /**
     * The TEMPLATE METHOD.
     * Declared final so subclasses cannot override the algorithm skeleton.
     */
    public final String generateReport(String username, List<Movie> movies) {
        StringBuilder sb = new StringBuilder();
        sb.append(formatHeader(username));
        if (movies == null || movies.isEmpty()) {
            sb.append(formatEmptyState());
        } else {
            for (int i = 0; i < movies.size(); i++) {
                sb.append(formatMovieRow(movies.get(i), i + 1));
            }
        }
        sb.append(formatFooter((movies != null) ? movies.size() : 0, computeAverageRating(movies)));
        return sb.toString();
    }

    // Primitive operations to be customized by subclasses
    protected abstract String formatHeader(String username);
    protected abstract String formatMovieRow(Movie movie, int index);
    protected abstract String formatFooter(int totalCount, double avgRating);
    protected abstract String formatEmptyState();
    public abstract String getFormatName();

    /**
     * Concrete helper hook available to all template subclasses
     */
    protected double computeAverageRating(List<Movie> movies) {
        if (movies == null || movies.isEmpty()) return 0.0;
        double sum = 0;
        for (Movie m : movies) {
            sum += m.getRating();
        }
        return Math.round((sum / movies.size()) * 10.0) / 10.0;
    }

    /**
     * Factory helper to instantiate the requested template generator
     */
    public static WatchlistReportTemplate getGenerator(String format) {
        if (format == null) return new MarkdownWatchlistReport();
        switch (format.trim().toLowerCase()) {
            case "text":
            case "txt":
            case "receipt":
                return new PlainTextWatchlistReport();
            case "json":
                return new JsonWatchlistReport();
            case "markdown":
            case "md":
            default:
                return new MarkdownWatchlistReport();
        }
    }
}

/**
 * Concrete Template 1: GitHub Flavored Markdown Table
 */
class MarkdownWatchlistReport extends WatchlistReportTemplate {
    @Override
    public String getFormatName() {
        return "Markdown Table (.md)";
    }

    @Override
    protected String formatHeader(String username) {
        return "# 🎬 CinePattern Watchlist Report\n" +
               "**Curated for:** `" + username + "`  \n" +
               "**Generated on:** " + new Date() + "\n\n" +
               "| # | Title | Genre | Language | Rating | Year | Platform |\n" +
               "|:--|:------|:------|:---------|:-------|:-----|:---------|\n";
    }

    @Override
    protected String formatMovieRow(Movie movie, int index) {
        return "| " + index + " | **" + movie.getTitle() + "** | " +
               movie.getGenre() + " | " + movie.getLanguage() + " | " +
               movie.getRating() + " ★ | " + movie.getYear() + " | " +
               movie.getPlatform() + " |\n";
    }

    @Override
    protected String formatEmptyState() {
        return "| - | *No movies saved in watchlist yet* | - | - | - | - | - |\n";
    }

    @Override
    protected String formatFooter(int totalCount, double avgRating) {
        return "\n---\n" +
               "- **Total Titles Saved:** " + totalCount + "\n" +
               "- **Average IMDb Rating:** " + avgRating + " / 10.0\n" +
               "- *Report generated via Template Method Pattern*\n";
    }
}

/**
 * Concrete Template 2: Plain Text Receipt / Summary Box
 */
class PlainTextWatchlistReport extends WatchlistReportTemplate {
    @Override
    public String getFormatName() {
        return "Plain Text Receipt (.txt)";
    }

    @Override
    protected String formatHeader(String username) {
        return "========================================================\n" +
               "          CINEPATTERN WATCHLIST SUMMARY RECEIPT         \n" +
               "========================================================\n" +
               " User: " + username.toUpperCase() + "\n" +
               " Export Date: " + new Date() + "\n" +
               "--------------------------------------------------------\n";
    }

    @Override
    protected String formatMovieRow(Movie movie, int index) {
        return String.format(" [%02d] %-28s | %-7s | %4.1f* | %s\n",
                index,
                movie.getTitle().length() > 28 ? movie.getTitle().substring(0, 25) + "..." : movie.getTitle(),
                movie.getGenre(),
                movie.getRating(),
                movie.getPlatform());
    }

    @Override
    protected String formatEmptyState() {
        return " [!] Watchlist is currently empty.\n";
    }

    @Override
    protected String formatFooter(int totalCount, double avgRating) {
        return "--------------------------------------------------------\n" +
               " Total Saved Movies: " + totalCount + "\n" +
               " Mean Rating Score:  " + avgRating + " / 10.0\n" +
               "========================================================\n" +
               " Pattern: Template Method Pattern (WatchlistReportTemplate)\n" +
               "========================================================\n";
    }
}

/**
 * Concrete Template 3: Structured JSON Array Export
 */
class JsonWatchlistReport extends WatchlistReportTemplate {
    @Override
    public String getFormatName() {
        return "Structured JSON (.json)";
    }

    @Override
    protected String formatHeader(String username) {
        return "{\n" +
               "  \"reportType\": \"WatchlistExport\",\n" +
               "  \"pattern\": \"TemplateMethodPattern\",\n" +
               "  \"user\": \"" + username + "\",\n" +
               "  \"items\": [\n";
    }

    @Override
    protected String formatMovieRow(Movie movie, int index) {
        String comma = ",\n";
        return "    {\n" +
               "      \"id\": " + movie.getId() + ",\n" +
               "      \"title\": \"" + movie.getTitle().replace("\"", "\\\"") + "\",\n" +
               "      \"genre\": \"" + movie.getGenre() + "\",\n" +
               "      \"language\": \"" + movie.getLanguage() + "\",\n" +
               "      \"rating\": " + movie.getRating() + ",\n" +
               "      \"year\": " + movie.getYear() + ",\n" +
               "      \"platform\": \"" + movie.getPlatform() + "\"\n" +
               "    }" + comma;
    }

    @Override
    protected String formatEmptyState() {
        return "";
    }

    @Override
    protected String formatFooter(int totalCount, double avgRating) {
        return "  ],\n" +
               "  \"totalCount\": " + totalCount + ",\n" +
               "  \"averageRating\": " + avgRating + "\n" +
               "}";
    }
}
