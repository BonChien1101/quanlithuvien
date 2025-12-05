# HỆ THỐNG PHÂN QUYỀN - QUẢN LÝ THƯ VIỆN

##  Các Vai Trò Trong Hệ Thống

### 1 ADMIN (Quản trị viên)
**Quyền hạn:**
- ✅ Toàn quyền quản lý hệ thống
- ✅ Quản lý người dùng (xem, thêm, xóa, phân quyền)
- ✅ Quản lý thể loại sách (thêm, sửa, xóa, ẩn/hiện)
- ✅ Quản lý sách (thêm, sửa, xóa, tìm kiếm)
- ✅ Quản lý độc giả
- ✅ Quản lý mượn trả sách
- ✅ Xem báo cáo thống kê

**Tài khoản mẫu:**
- Username: `admin`
- Password: `admin`

---

### 2️ USER (Người dùng/Độc giả)
**Quyền hạn:**
- ✅ Xem danh sách sách
- ✅ Tìm kiếm sách
- ✅ Xem thông tin sách chi tiết
- ✅ Mượn sách (nếu có quota)
- ✅ Xem lịch sử mượn sách của bản thân
- ❌ KHÔNG được quản lý hệ thống

**Tài khoản mẫu:**
- Username: `user1` / Password: `user123`
- Username: `user2` / Password: `user123`

---

##  So Sánh Quyền Hạn

| Chức năng | ADMIN | USER |
|-----------|-------|------|
| Quản lý Users | ✅ | ❌ |
| Quản lý Books | ✅ | ❌ |
| Quản lý Categories | ✅ | ❌ |
| Quản lý Readers | ✅ | ❌ |
| Quản lý Loans | ✅ | ❌ |
| Xem Books | ✅ | ✅ |
| Mượn sách | ✅ | ✅ |
| Dashboard | ✅ | ❌ |
| Báo cáo | ✅ | ❌ |

---

##  Cách Hoạt Động

### Backend (Node.js + Express)
1. **Authentication Middleware** (`server/middleware/auth.js`):
   - Xác thực JWT token
   - Lấy thông tin user và roles từ token

2. **Authorization Middleware** (`requireRole(['ADMIN'])`):
   - Kiểm tra xem user có role yêu cầu không
   - Chặn truy cập nếu không đủ quyền

3. **Protected Routes**:
   ```javascript
   // Chỉ ADMIN mới truy cập được
   router.get('/users', authenticate, requireRole(['ADMIN']), getUsers);
   
   // ADMIN và USER đều truy cập được (nếu cần)
   router.get('/books', authenticate, getBooks);
   ```

### Frontend (React + Redux)
1. **RequireRole Component**:
   - Ẩn/hiện các component dựa trên role
   - Ví dụ: Menu "Users" chỉ hiện với ADMIN

2. **Sidebar Navigation**:
   ```tsx
   <RequireRole roles={['ADMIN']}>
     <NavLink to="/users">👥 Người dùng</NavLink>
   </RequireRole>
   ```

3. **Route Protection**:
   - Redirect USER về trang `/borrow` sau khi đăng nhập
   - ADMIN/LIBRARIAN về trang Dashboard `/`

---

## 💾 Database

### Bảng `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Mã hóa bằng bcrypt
  roles TEXT,                       -- JSON string: '["ADMIN"]' hoặc '["USER"]'
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### Dữ liệu mẫu
```javascript
// Trong seed-data.js
await User.bulkCreate([
  { username: 'admin', password: 'admin', roles: JSON.stringify(['ADMIN']) },
  { username: 'user1', password: 'user123', roles: JSON.stringify(['USER']) },
  { username: 'user2', password: 'user123', roles: JSON.stringify(['USER']) }
]);
```

---

##  Cách Sử Dụng

### 1. Đăng nhập với vai trò khác nhau
```
1. Vào http://localhost:3001
2. Click nút " ADMIN" để đăng nhập admin
3. Hoặc click " NGƯỜI DÙNG" để đăng nhập user
4. Xem sự khác biệt về menu và quyền truy cập
```

### 2. Kiểm tra phân quyền
```
- Đăng nhập bằng ADMIN → Thấy menu "Người dùng"
- Đăng nhập bằng USER → KHÔNG thấy menu "Người dùng"
- USER chỉ thấy trang mượn sách
```

### 3. Test API với Postman
```bash
# 1. Login để lấy token
POST http://localhost:8080/auth/login
Body: { "username": "admin", "password": "admin" }

# 2. Dùng token để gọi API
GET http://localhost:8080/api/users
Headers: Authorization: Bearer <token>

# 3. Nếu token của USER → Sẽ bị lỗi 403 Forbidden
```

---

##  Bảo Mật

1. **Password**: Mã hóa bằng bcrypt (10 rounds)
2. **JWT Token**: Lưu trong localStorage, expire sau 24h
3. **HTTPS**: Nên dùng HTTPS trong production
4. **CORS**: Chỉ cho phép origin từ frontend
5. **SQL Injection**: Sequelize ORM tự động escape
6. **XSS**: React tự động escape HTML

---

##  Lưu Ý

1. **Đổi mật khẩu mặc định** trong production
2. **JWT_SECRET** phải đổi thành chuỗi bí mật phức tạp
3. **Không commit** file `.env` lên GitHub
4. **Backup database** định kỳ
5. **Log** tất cả thao tác quan trọng (thêm/xóa user, sách)

---

##  Mở Rộng Thêm

### Các tính năng có thể thêm:
-  Đăng ký tài khoản USER tự động
-  Quên mật khẩu & reset qua email
-  2FA (Two-Factor Authentication)
-  Session timeout tự động logout
-  Lịch sử hoạt động của user
-  Khóa tài khoản khi login sai nhiều lần
-  Role "LIBRARIAN" cho thủ thư (nếu cần mở rộng)
-  Role "TEACHER" cho giáo viên
-  Phân quyền chi tiết hơn (READ, WRITE, DELETE)

---

**Tác giả:** Vinh  
**Email:** vinhpt20106ptit@gmail.com  
**Ngày:** December 2, 2025
