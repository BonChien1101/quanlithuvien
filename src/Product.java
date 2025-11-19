package src;

public abstract class Product implements Deliverable, Refundable {
    private final String id;
    private String name;
    private double price;

    protected Product(String id, String name, double price) {
        if (price < 0) throw new InvalidPriceException(price);
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    public void setName(String name) { this.name = name; }
    public void setPrice(double price) { if (price < 0) throw new InvalidPriceException(price); this.price = price; }

    @Override
    public void deliver() {
        System.out.println("Delivering product: " + name + " (#" + id + ")");
    }

    @Override
    public void refund() throws NonRefundableException {
        // Default refundable behavior; subclasses can override.
        System.out.println("Refund processed for product: " + name);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                '}';
    }
}
