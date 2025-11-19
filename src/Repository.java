package src;

import java.util.List;

public interface Repository<T> {
    void add(T item) throws DuplicateIdException;
    void update(T item) throws NotFoundException;
    void delete(String id) throws NotFoundException;
    List<T> findAll();
}
