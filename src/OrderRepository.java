package src;

public class OrderRepository extends AbstractInMemoryRepository<Order> {
    @Override
    protected String getId(Order item) {
        return item.getId();
    }
}
