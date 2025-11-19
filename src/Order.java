package src;

import java.util.ArrayList;
import java.util.List;

public class Order {
    private final String id;
    private final Customer customer;
    private final List<Product> products = new ArrayList<>();
    private boolean paid = false;

    public Order(String id, Customer customer) {
        this.id = id;
        this.customer = customer;
    }

    public String getId() { return id; }
    public Customer getCustomer() { return customer; }
    public List<Product> getProducts() { return products; }
    public boolean isPaid() { return paid; }
    public void markPaid() { this.paid = true; }

    public void addProduct(Product product) {
        products.add(product);
    }

    public double getTotal() {
        return products.stream().mapToDouble(Product::getPrice).sum();
    }

    @Override
    public String toString() {
        return "Order{" +
                "id='" + id + '\'' +
                ", customer=" + customer +
                ", total=" + getTotal() +
                ", paid=" + paid +
                '}';
    }
}
