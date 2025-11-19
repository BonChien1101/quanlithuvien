package src;

public class CashPayment implements Payment {
    @Override
    public void pay(Order order) {
        System.out.println("Paid order " + order.getId() + " by Cash. Total: " + order.getTotal());
        order.markPaid();
    }
}
