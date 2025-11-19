package src;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        ProductRepository productRepo = new ProductRepository();
        CustomerRepository customerRepo = new CustomerRepository();
        OrderRepository orderRepo = new OrderRepository();

        // Thêm sản phẩm và bắt lỗi price < 0
        try {
            productRepo.add(new Book("P1", "Clean Code", 250.0, "Robert C. Martin"));
            productRepo.add(new Phone("P2", "iPhone 15", 25000.0, "Apple"));
            productRepo.add(new Laptop("P3", "ThinkPad X1", 42000.0, "Lenovo"));
            // Invalid price
            productRepo.add(new Book("P4", "Invalid Book", -10.0, "Nobody"));
        } catch (InvalidPriceException e) {
            System.out.println("Caught InvalidPriceException: " + e.getMessage());
        } catch (DuplicateIdException e) {
            System.out.println("Caught DuplicateIdException: " + e.getMessage());
        }

        // Duplicate ID test
        try {
            productRepo.add(new Book("P1", "Clean Architecture", 300.0, "Robert C. Martin"));
        } catch (DuplicateIdException e) {
            System.out.println("Caught DuplicateIdException: " + e.getMessage());
        }

        //  In danh sách sản phẩm
        System.out.println("\nDanh sách sản phẩm:");
        List<Product> products = productRepo.findAll();
        products.forEach(System.out::println);

        // Thử deliver & refund
        System.out.println("\nDeliver & Refund thử nghiệm:");
        for (Product p : products) {
            p.deliver();
            try {
                p.refund();
            } catch (NonRefundableException e) {
                System.out.println("Cannot refund: " + p.getName() + " -> " + e.getMessage());
            }
        }

        //  Tạo khách hàng và đơn hàng
        Customer c1 = new Customer("C1", "Nguyen Van A", "a@example.com");
        try {
            customerRepo.add(c1);
        } catch (DuplicateIdException e) {
            System.out.println(e.getMessage());
        }

        Order order = new Order("O1", c1);
        order.addProduct(products.get(0));
        order.addProduct(products.get(1));
        order.addProduct(products.get(2));

        try {
            orderRepo.add(order);
        } catch (DuplicateIdException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("\nOrder tạo ra: " + order);

        // Thanh toán đa kênh
        System.out.println("\nThanh toán đa kênh:");
        payOrder(new CreditCardPayment(), order);
        // Tạo order mới để test kênh khác (vì order đã paid)
        Order order2 = new Order("O2", c1);
        order2.addProduct(products.get(0));
        order2.addProduct(products.get(1));
        payOrder(new PaypalPayment(), order2);
        Order order3 = new Order("O3", c1);
        order3.addProduct(products.get(0));
        payOrder(new CashPayment(), order3);
        Order order4 = new Order("O4", c1);
        order4.addProduct(products.get(1));
        payOrder(new MoMoPayment(), order4);
    }

    private static void payOrder(Payment payment, Order order) {
        payment.pay(order);
    }
}
