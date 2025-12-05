# Quản Lý Thư Viện – Library App

Ứng dụng web quản lý thư viện gồm 2 phần:
- Backend (Node.js + Express + Sequelize + MySQL)
- Frontend (React + TypeScript + Redux Toolkit, Webpack)

Bạn có thể dùng để quản lý sách, thể loại, độc giả, mượn/trả, và xem dashboard báo cáo. Tài khoản/Phân quyền: ADMIN, LIBRARIAN (thủ thư), USER.

## Tính năng chính
- Đăng nhập/Đăng ký, phân quyền theo vai trò
- Quản lý Sách: tạo/sửa/xóa, ẩn/hiện, ảnh bìa (imageUrl), tồn kho, thể loại
- Quản lý Thể loại: tạo/sửa/xóa, ẩn/hiện kéo theo sách
- Quản lý Độc giả: tạo/sửa/xóa, quota mượn
- Mượn/Trả sách, tự động cập nhật tồn kho và quota
- Dashboard: thống kê, cảnh báo, xu hướng mượn/trả, danh sách sách mới
- Khu vực người dùng (USER): duyệt sách theo thể loại, xem chi tiết

## Kiến trúc & công nghệ
- Backend: Express, Sequelize (MySQL), JWT Auth, CORS
- Frontend: React 18, TypeScript, Redux Toolkit, React Router, Bootstrap 5

## Chuẩn bị môi trường
- Node.js LTS (khuyên dùng ≥ 18)
- MySQL (khuyên dùng ≥ 8)
- Windows PowerShell (các lệnh dưới đây viết cho PowerShell)

## Cấu hình môi trường (Backend)
Tạo file `.env` trong thư mục `server/` (cùng cấp `index.js`):

```env
# Cổng API (mặc định 8080)
PORT=8080

# Kết nối MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=FinalWeb

# JWT
JWT_SECRET=change_me
```

Tạo database trước (ví dụ):

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS FinalWeb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Bạn có thể seed dữ liệu mẫu hoặc reset admin bằng các script sẵn có trong `server/` (tùy chọn).

## Cài đặt & chạy dự án
1) Cài dependencies
```powershell
cd D:\btapjava\server; npm install
cd D:\btapjava\client; npm install
```

2) Chạy Backend (API)
```powershell
cd D:\btapjava\server; npm start
```
API sẽ lắng nghe tại http://localhost:8080 (có thể đổi PORT trong `.env`).

3) Chạy Frontend (Web)
Mặc định `webpack-dev-server` có thể dùng cổng 8080 – dễ trùng với backend. Khuyến nghị chạy frontend ở cổng khác (vd 3000):
```powershell
cd D:\btapjava\client; npm start -- --port 3000
```
Sau đó mở http://localhost:3000.

4) Tài khoản mặc định (tùy chọn)
- Có script `server/reset-admin.js` để tạo lại tài khoản ADMIN:
```powershell
cd D:\btapjava\server; node reset-admin.js
```
Tài khoản: admin / admin (hãy đổi mật khẩu khi triển khai thật).

## Thư mục chính
- `server/` – mã nguồn API (Express, Sequelize models, routes)
  - `routes/` – các endpoint: auth, books, categories, readers, loans, reports, users, my-library
  - `models/` – Sequelize models: User, Book, Category, Reader, Loan
  - `middleware/auth.js` – xác thực JWT, kiểm tra vai trò
- `client/` – mã nguồn frontend (React + TS)
  - `src/modules/` – các màn hình (Dashboard, Books, Categories, Readers, Loans, Reports, Users, User area)
  - `src/api/` – axios client + API wrappers
  - `src/styles/index.css` – style tổng

## Một số API tham khảo
- Auth: `POST /api/auth/login`, `POST /api/auth/signup`
- Sách: `GET /api/books`, `POST /api/books`, `PUT /api/books/:id`, `POST /api/books/:id/toggle`, `DELETE /api/books/:id`
- Thể loại: `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `POST /api/categories/:id/toggle`
- Độc giả: `GET /api/readers`, `POST /api/readers`, `PUT /api/readers/:id`, `DELETE /api/readers/:id`
- Mượn/Trả: `GET /api/loans`, `POST /api/loans/borrow`, `POST /api/loans/:id/return`, `PUT /api/loans/:id/due`
- Báo cáo: `GET /api/reports/inventory`, `GET /api/reports/inventory/low`, `GET /api/reports/summary`, `GET /api/reports/borrow-stats`

## Lưu ý & Mẹo nhỏ
- Ảnh bìa sách: trong màn hình Sách, nhập trường “Ảnh bìa (URL)”. Client đã gửi đúng `imageUrl` lên API; nếu không thấy ảnh, kiểm tra URL hợp lệ và CORS hình ảnh.
- Phân quyền:
  - ADMIN: toàn quyền + quản trị người dùng
  - LIBRARIAN: quản lý nghiệp vụ thư viện
  - USER: duyệt sách khu vực người dùng
- Dashboard có các ô số liệu có thể nhấp để xem chi tiết (trừ một vài ô theo yêu cầu). 

## Khắc phục sự cố (Troubleshooting)
- Lỗi EADDRINUSE: cổng 8080 đang được dùng
  - Đổi PORT của backend trong `.env` (vd 8081), hoặc
  - Chạy frontend với cổng khác: `npm start -- --port 3000`
- Backend kết nối DB thất bại
  - Kiểm tra thông tin `.env`, đảm bảo DB đã được tạo & MySQL đang chạy
- CORS/Token
  - Backend đã bật CORS; Client tự động gắn token nếu có `auth_token` trong localStorage

## Phát triển & đóng góp
- Nhánh chính: `main`
- Nhánh tính năng ví dụ: `feature/final`
- Quy trình: tạo nhánh mới → commit theo chức năng → PR về `main`

Chúc bạn dùng vui. Nếu cần hỗ trợ cấu hình/triển khai, cứ mở issue hoặc ping trong PR nhé!
