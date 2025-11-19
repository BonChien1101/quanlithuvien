# Online Store OOP Demo

## Yêu cầu đã triển khai
- Kế thừa: `Product` + `Book`, `Phone`, `Laptop` (Laptop không hoàn tiền)
- Interface: `Deliverable`, `Refundable`, `Payment`
- Đa hình thanh toán: `CreditCardPayment`, `PaypalPayment`, `CashPayment`, `MoMoPayment`
- Generic Repository: `Repository<T>` + `AbstractInMemoryRepository` và các repo cụ thể
- Exception nghiệp vụ: `DuplicateIdException`, `InvalidPriceException`, `NonRefundableException`, `NotFoundException`
- Test tất cả trong `Main`

## Chạy chương trình
```powershell
javac --release 8 src\*.java
java -cp . src.Main
```

## Đẩy lên GitHub
```powershell
git init
git remote add origin https://github.com/BonChien1101/btjavafinish
git add .
git commit -m "Initial implementation"
git branch -M main
git push -u origin main
```

Nếu cần Personal Access Token: dùng dạng `https://<token>@github.com/BonChien1101/btjavafinish.git` khi thêm remote hoặc nhập khi push.
