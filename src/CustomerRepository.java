package src;

public class CustomerRepository extends AbstractInMemoryRepository<Customer> {
    @Override
    protected String getId(Customer item) {
        return item.getId();
    }
}
