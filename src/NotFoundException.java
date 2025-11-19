package src;

public class NotFoundException extends Exception {
    public NotFoundException(String id) {
        super("Not found ID: " + id);
    }
}
