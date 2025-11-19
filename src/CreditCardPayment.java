package src;

public class CreditCardPayment implements Payment {
    @Override
    public void pay(Order order) {
        System.out.println("Paid order " + order.getId() + " by Credit Card. Total: " + order.getTotal());
        order.markPaid();
    }
}
