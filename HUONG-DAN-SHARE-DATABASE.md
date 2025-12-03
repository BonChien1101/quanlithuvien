# 📚 Hướng Dẫn Share Database Cho Nhóm

## 🌟 Phương Án Đơn Giản Nhất: Dùng File `seed-data.js`

### Cách Làm:

**1. Bạn bè pull code từ GitHub:**
```bash
git clone https://github.com/BonChien1101/quanlithuvien
cd quanlithuvien
```

**2. Cài đặt MySQL trên máy mỗi người:**
- Download MySQL Community Server: https://dev.mysql.com/downloads/mysql/
- Cài đặt với username: `root`, password: `root`
- Tạo database: `CREATE DATABASE FinalWeb;`

**3. Chạy backend để tự động tạo database:**
```bash
cd server
npm install
node seed-data.js
```

File `seed-data.js` sẽ tự động:
- ✅ Tạo các bảng (users, books, categories)
- ✅ Thêm 30 quyển sách mẫu
- ✅ Thêm 8 thể loại
- ✅ Thêm 5 users (admin + 4 users)

**4. Chạy ứng dụng:**
```bash
# Terminal 1: Backend
cd server
node index.js

# Terminal 2: Frontend
cd client
npm install
npm start
```

---

## 📦 Phương Án 2: Export/Import File SQL

### Nếu có mysqldump:

**Export (trên máy bạn):**
```bash
mysqldump -u root -proot FinalWeb > database_backup.sql
```

**Import (trên máy bạn bè):**
```bash
mysql -u root -proot FinalWeb < database_backup.sql
```

### Nếu dùng MySQL Workbench:

1. Mở MySQL Workbench
2. Chọn menu: **Server → Data Export**
3. Chọn database `FinalWeb`
4. Chọn "Export to Self-Contained File"
5. Click **Start Export**
6. Share file `.sql` cho nhóm
7. Nhóm import bằng: **Server → Data Import**

---

## 🌐 Phương Án 3: Dùng Cloud Database (Chi phí)

### MySQL Cloud miễn phí:

1. **FreeSQLDatabase** (5MB free): https://www.freesqldatabase.com/
2. **db4free** (200MB free): https://www.db4free.net/
3. **Clever Cloud** (256MB free): https://www.clever-cloud.com/

### Sau khi có database cloud:

Sửa file `server/.env`:
```env
DB_HOST=your-cloud-host.com
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=FinalWeb
```

Push code lên GitHub, nhóm pull về là chạy được.

---

## ✅ Khuyến Nghị

**Dùng Phương Án 1** (file seed-data.js) vì:
- ✅ Đơn giản nhất
- ✅ Không cần share file
- ✅ Mỗi người có database riêng
- ✅ Không phụ thuộc máy bạn online
- ✅ Dữ liệu đã có sẵn trong code

**File `server/seed-data.js` đã chứa toàn bộ dữ liệu mẫu:**
- 5 users (admin/admin, user1-2/user123)
- 30 books (Văn học Việt Nam + quốc tế)
- 8 categories (Văn học, Khoa học, Lịch sử...)

Nhóm chỉ cần:
```bash
git pull
cd server
npm install
node seed-data.js
node index.js
```

---

## 🔧 Troubleshooting

**Lỗi: "Access denied for user 'root'@'localhost'"**
→ Kiểm tra password MySQL của bạn bè có phải `root` không

**Lỗi: "Cannot connect to MySQL"**
→ Đảm bảo MySQL service đang chạy: `services.msc` → tìm MySQL

**Lỗi: "Database FinalWeb does not exist"**
→ Tạo database trước:
```sql
CREATE DATABASE FinalWeb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📞 Liên Hệ

Nếu có vấn đề, check lại:
1. MySQL đã cài đúng chưa?
2. File `.env` có đúng thông tin chưa?
3. Đã chạy `npm install` chưa?
4. Đã chạy `node seed-data.js` chưa?
