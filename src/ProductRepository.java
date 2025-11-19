package src;

public class ProductRepository extends AbstractInMemoryRepository<Product> {
    @Override
    protected String getId(Product item) {
        return item.getId();
    }
}
