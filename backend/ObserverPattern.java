import java.util.*;
import java.text.SimpleDateFormat;

interface Observer {
    void update(String message);
    String getName();
}

interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers(String message);
}

class UserObserver implements Observer {
    private String name;

    public UserObserver(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void update(String message) {
        System.out.println("\n[Observer Notification] for " + name + ": " + message);
    }
}

class NotificationRecord {
    private String id;
    private String message;
    private String timestamp;

    public NotificationRecord(String message) {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.message = message;
        this.timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }

    public String getId() { return id; }
    public String getMessage() { return message; }
    public String getTimestamp() { return timestamp; }

    public String toJson() {
        return "{\"id\":\"" + id + "\",\"message\":\"" + message.replace("\"", "\\\"") + "\",\"timestamp\":\"" + timestamp + "\"}";
    }
}

class NotificationService implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private List<NotificationRecord> history = new ArrayList<>();

    public void addObserver(Observer observer) {
        // Prevent duplicate observers with same name
        for (Observer o : observers) {
            if (o.getName().equalsIgnoreCase(observer.getName())) {
                return;
            }
        }
        observers.add(observer);
    }

    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }

    public void removeObserverByName(String name) {
        observers.removeIf(o -> o.getName().equalsIgnoreCase(name));
    }

    public void notifyObservers(String message) {
        NotificationRecord record = new NotificationRecord(message);
        history.add(0, record); // Most recent first
        // Keep max 50 in history
        if (history.size() > 50) {
            history.remove(history.size() - 1);
        }
        for (Observer observer : observers) {
            observer.update(message);
        }
    }

    public List<Observer> getObservers() {
        return new ArrayList<>(observers);
    }

    public List<NotificationRecord> getHistory() {
        return new ArrayList<>(history);
    }
}
