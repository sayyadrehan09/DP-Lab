public class Movie {
    private int id;
    private String title;
    private String genre;
    private String language;
    private double rating;
    private int year;
    private String platform;

    public Movie(int id, String title, String genre, String language, double rating, int year, String platform) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.language = language;
        this.rating = rating;
        this.year = year;
        this.platform = platform;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getGenre() { return genre; }
    public String getLanguage() { return language; }
    public double getRating() { return rating; }
    public int getYear() { return year; }
    public String getPlatform() { return platform; }

    public String toFileString() {
        return id + "|" + title + "|" + genre + "|" + language + "|" + rating + "|" + year + "|" + platform;
    }

    public String toJson() {
        return "{" +
                "\"id\":" + id + "," +
                "\"title\":\"" + escapeJson(title) + "\"," +
                "\"genre\":\"" + escapeJson(genre) + "\"," +
                "\"language\":\"" + escapeJson(language) + "\"," +
                "\"rating\":" + rating + "," +
                "\"year\":" + year + "," +
                "\"platform\":\"" + escapeJson(platform) + "\"" +
                "}";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    public void showDetails() {
        System.out.println("ID       : " + id);
        System.out.println("Title    : " + title);
        System.out.println("Genre    : " + genre);
        System.out.println("Language : " + language);
        System.out.println("Rating   : " + rating);
        System.out.println("Year     : " + year);
        System.out.println("Platform : " + platform);
        System.out.println("----------------------------------------");
    }
}
