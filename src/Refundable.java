package src;

public interface Refundable {
    void refund() throws NonRefundableException;
}
