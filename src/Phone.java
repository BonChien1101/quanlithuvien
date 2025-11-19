package src;

public class Phone extends Product {
    private String brand;

    public Phone(String id, String name, double price, String brand) {
        super(id, name, price);
        this.brand = brand;
    }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    @Override
    public void deliver() {
        System.out.println("Delivering phone: " + getName() + " (Brand: " + brand + ")");
    }
}
