package com.library.loan;

import com.library.book.Book;
import com.library.book.BookRepository;
import com.library.reader.Reader;
import com.library.reader.ReaderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoanServiceTest {
    private LoanRepository loanRepo;
    private BookRepository bookRepo;
    private ReaderRepository readerRepo;
    private LoanService service;

    @BeforeEach
    void setup(){
        loanRepo = mock(LoanRepository.class);
        bookRepo = mock(BookRepository.class);
        readerRepo = mock(ReaderRepository.class);
        service = new LoanService(loanRepo, bookRepo, readerRepo);
    }

    @Test @DisplayName("Mượn sách hợp lệ giảm stock và tạo loan")
    void borrow_ok(){
        Book book = Book.builder().id(1L).title("A").stock(2).build();
        Reader reader = Reader.builder().id(10L).name("R").quota(3).build();
        when(bookRepo.findById(1L)).thenReturn(Optional.of(book));
        when(readerRepo.findById(10L)).thenReturn(Optional.of(reader));
        when(loanRepo.countActiveLoansByReader(10L)).thenReturn(0L);
        when(loanRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Loan loan = service.borrow(1L,10L);
        assertNotNull(loan.getBorrowedAt());
        assertEquals(1, book.getStock());
    }

    @Test @DisplayName("Vượt quota -> IllegalStateException")
    void borrow_quota_exceeded(){
        Book book = Book.builder().id(1L).title("A").stock(2).build();
        Reader reader = Reader.builder().id(10L).name("R").quota(1).build();
        when(bookRepo.findById(1L)).thenReturn(Optional.of(book));
        when(readerRepo.findById(10L)).thenReturn(Optional.of(reader));
        when(loanRepo.countActiveLoansByReader(10L)).thenReturn(1L);
        assertThrows(IllegalStateException.class, () -> service.borrow(1L,10L));
    }

    @Test @DisplayName("Hết stock -> IllegalStateException")
    void borrow_out_of_stock(){
        Book book = Book.builder().id(1L).title("A").stock(0).build();
        Reader reader = Reader.builder().id(10L).name("R").quota(3).build();
        when(bookRepo.findById(1L)).thenReturn(Optional.of(book));
        when(readerRepo.findById(10L)).thenReturn(Optional.of(reader));
        when(loanRepo.countActiveLoansByReader(10L)).thenReturn(0L);
        assertThrows(IllegalStateException.class, () -> service.borrow(1L,10L));
    }

    @Test @DisplayName("Trả sách tăng lại stock")
    void return_increase_stock(){
        Book book = Book.builder().id(1L).title("A").stock(0).build();
        Reader reader = Reader.builder().id(10L).name("R").quota(3).build();
        Loan existing = Loan.builder().id(99L).book(book).reader(reader).borrowedAt(Instant.now()).dueAt(Instant.now()).build();
        when(loanRepo.findById(99L)).thenReturn(Optional.of(existing));
        when(loanRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Loan returned = service.returnBook(99L);
        assertNotNull(returned.getReturnedAt());
        assertEquals(1, book.getStock());
    }
}
