package src;

public class PaypalPayment implements Payment {
    @Override
    public void pay(Order order) {
        System.out.println("Paid order " + order.getId() + " via PayPal. Total: " + order.getTotal());
        order.markPaid();
    }
}
