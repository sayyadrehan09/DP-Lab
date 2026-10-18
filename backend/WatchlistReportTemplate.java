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
            case "html":
            case "htm":
                return new HtmlWatchlistReport();
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

/**
 * Concrete Template 4: Styled Standalone HTML Document
 */
class HtmlWatchlistReport extends WatchlistReportTemplate {
    @Override
    public String getFormatName() {
        return "HTML Document (.html)";
    }

    @Override
    protected String formatHeader(String username) {
        return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n" +
               "<title>Watchlist - " + username + "</title>\n" +
               "<style>\n" +
               "  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #e2e8f0; margin: 0; padding: 40px; }\n" +
               "  .container { max-width: 900px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }\n" +
               "  h1 { margin-top: 0; color: #38bdf8; font-size: 26px; display: flex; align-items: center; gap: 10px; }\n" +
               "  .meta { color: #94a3b8; font-size: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1e293b; }\n" +
               "  table { width: 100%; border-collapse: collapse; margin-top: 10px; }\n" +
               "  th { background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; }\n" +
               "  td { padding: 14px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; }\n" +
               "  tr:hover { background: rgba(56, 189, 248, 0.04); }\n" +
               "  .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #0284c7; color: white; }\n" +
               "  .rating { color: #f59e0b; font-weight: bold; }\n" +
               "  .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 13.5px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; }\n" +
               "</style>\n</head>\n<body>\n" +
               "<div class=\"container\">\n" +
               "  <h1><span>🎬</span> CinePattern Watchlist</h1>\n" +
               "  <div class=\"meta\">Curated for: <strong style=\"color:#f1f5f9;\">" + username + "</strong> &bull; Generated: " + new Date() + "</div>\n" +
               "  <table>\n" +
               "    <thead>\n" +
               "      <tr><th>#</th><th>Title</th><th>Genre</th><th>Language</th><th>Rating</th><th>Year</th><th>Platform</th></tr>\n" +
               "    </thead>\n" +
               "    <tbody>\n";
    }

    @Override
    protected String formatMovieRow(Movie movie, int index) {
        return "      <tr>\n" +
               "        <td>" + index + "</td>\n" +
               "        <td><strong style=\"color:#f8fafc;\">" + movie.getTitle() + "</strong></td>\n" +
               "        <td>" + movie.getGenre() + "</td>\n" +
               "        <td>" + movie.getLanguage() + "</td>\n" +
               "        <td class=\"rating\">★ " + movie.getRating() + "</td>\n" +
               "        <td>" + movie.getYear() + "</td>\n" +
               "        <td><span class=\"badge\">" + movie.getPlatform() + "</span></td>\n" +
               "      </tr>\n";
    }

    @Override
    protected String formatEmptyState() {
        return "      <tr><td colspan=\"7\" style=\"text-align:center;padding:32px;color:#64748b;\">Your watchlist is currently empty.</td></tr>\n";
    }

    @Override
    protected String formatFooter(int totalCount, double avgRating) {
        return "    </tbody>\n" +
               "  </table>\n" +
               "  <div class=\"footer\">\n" +
               "    <div>Total Titles Saved: <strong style=\"color:#f8fafc;\">" + totalCount + "</strong> &bull; Average Rating: <strong style=\"color:#f59e0b;\">" + avgRating + " / 10.0</strong></div>\n" +
               "    <div><em>Template Method Pattern</em></div>\n" +
               "  </div>\n" +
               "</div>\n</body>\n</html>";
    }
}

