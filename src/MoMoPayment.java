package src;

public class MoMoPayment implements Payment {
    @Override
    public void pay(Order order) {
        System.out.println("Paid order " + order.getId() + " via MoMo e-wallet. Total: " + order.getTotal());
        order.markPaid();
    }
}
