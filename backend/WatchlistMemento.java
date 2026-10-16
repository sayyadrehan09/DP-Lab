import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Memento Pattern Implementation for CinePattern
 * Captures and externalizes the state of a user's Watchlist (list of saved movie IDs)
 * so that deletions or additions can be cleanly undone without exposing private data.
 */

/**
 * 1. MEMENTO (Immutable state snapshot)
 */
public class WatchlistMemento {
    private final List<Integer> movieIds;
    private final String timestamp;
    private final String description;

    public WatchlistMemento(List<Integer> movieIds, String description) {
        this.movieIds = new ArrayList<>(movieIds); // Deep copy of state
        this.timestamp = new SimpleDateFormat("HH:mm:ss").format(new Date());
        this.description = description;
    }

    public List<Integer> getSavedState() {
        return new ArrayList<>(movieIds);
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getDescription() {
        return description;
    }
}

/**
 * 2. CARETAKER (Manages and protects the history of Mementos)
 */
class WatchlistCaretaker {
    // Map of username -> Stack of Mementos
    private static final Map<String, Stack<WatchlistMemento>> userHistories = new HashMap<>();
    private static int totalSnapshotsTaken = 0;

    /**
     * Saves a snapshot of the current state before a mutation occurs
     */
    public static synchronized void saveSnapshot(String username, List<Integer> currentMovieIds, String actionDescription) {
        if (username == null || username.trim().isEmpty()) return;
        String user = username.trim().toLowerCase();
        
        userHistories.putIfAbsent(user, new Stack<>());
        Stack<WatchlistMemento> stack = userHistories.get(user);

        // Cap history to 20 states per user to prevent unbounded memory growth
        if (stack.size() >= 20) {
            stack.remove(0);
        }

        stack.push(new WatchlistMemento(currentMovieIds, actionDescription));
        totalSnapshotsTaken++;
    }

    /**
     * Pops and returns the most recent Memento to restore
     */
    public static synchronized WatchlistMemento undo(String username) {
        if (username == null) return null;
        String user = username.trim().toLowerCase();
        Stack<WatchlistMemento> stack = userHistories.get(user);
        
        if (stack != null && !stack.isEmpty()) {
            return stack.pop();
        }
        return null;
    }

    /**
     * Checks if undo is currently available for this user
     */
    public static synchronized boolean canUndo(String username) {
        if (username == null) return false;
        String user = username.trim().toLowerCase();
        Stack<WatchlistMemento> stack = userHistories.get(user);
        return stack != null && !stack.isEmpty();
    }

    /**
     * Returns how many undo steps are recorded for this user
     */
    public static synchronized int getHistoryDepth(String username) {
        if (username == null) return 0;
        String user = username.trim().toLowerCase();
        Stack<WatchlistMemento> stack = userHistories.get(user);
        return (stack != null) ? stack.size() : 0;
    }

    public static int getTotalSnapshotsTaken() {
        return totalSnapshotsTaken;
    }
}
