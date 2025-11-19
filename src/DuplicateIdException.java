package src;

public class DuplicateIdException extends Exception {
    public DuplicateIdException(String id) {
        super("Duplicate ID: " + id);
    }
}
    