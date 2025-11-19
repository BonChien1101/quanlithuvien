package src;

public class Book extends Product {
    private String author;

    public Book(String id, String name, double price, String author) {
        super(id, name, price);
        this.author = author;
    }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    @Override
    public void deliver() {
        System.out.println("Shipping book: " + getName() + " by " + author);
    }
}
