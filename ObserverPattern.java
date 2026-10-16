import java.util.*;

interface Observer { void update(String message); }
interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers(String message);
}

class UserObserver implements Observer {
    private String name;
    public UserObserver(String name) { this.name = name; }
    public void update(String message) { System.out.println("\nNotification for " + name + ": " + message); }
}

class NotificationService implements Subject {
    private List<Observer> observers = new ArrayList<>();
    public void addObserver(Observer observer) { observers.add(observer); }
    public void removeObserver(Observer observer) { observers.remove(observer); }
    public void notifyObservers(String message) { for (Observer observer : observers) observer.update(message); }
}
