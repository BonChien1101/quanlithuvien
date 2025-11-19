package src;

public class NonRefundableException extends Exception {
    public NonRefundableException(String message) {
        super(message);
    }
}
