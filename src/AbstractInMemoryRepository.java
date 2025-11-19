package src;

import java.util.*;

public abstract class AbstractInMemoryRepository<T> implements Repository<T> {
    protected final Map<String, T> store = new LinkedHashMap<>();

    protected abstract String getId(T item);

    @Override
    public void add(T item) throws DuplicateIdException {
        String id = getId(item);
        if (store.containsKey(id)) throw new DuplicateIdException(id);
        store.put(id, item);
    }

    @Override
    public void update(T item) throws NotFoundException {
        String id = getId(item);
        if (!store.containsKey(id)) throw new NotFoundException(id);
        store.put(id, item);
    }

    @Override
    public void delete(String id) throws NotFoundException {
        if (!store.containsKey(id)) throw new NotFoundException(id);
        store.remove(id);
    }

    @Override
    public List<T> findAll() {
        return new ArrayList<>(store.values());
    }
}
