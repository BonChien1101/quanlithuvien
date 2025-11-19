package src;

public class InvalidPriceException extends RuntimeException {
    public InvalidPriceException(double price) {
        super("Invalid price (must be >=0): " + price);
    }
}
