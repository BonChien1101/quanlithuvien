# Hệ thống quản lý thư viện

## Kiến trúc
- Frontend: React + TypeScript, Redux Toolkit, React Router, Axios, TailwindCSS/Bootstrap.
- Backend: Java Spring Boot (JWT + OAuth2 Google/Facebook), MySQL, Flyway migrations.
- Triển khai Git: mỗi thành viên 1 branch, PR, code review.

## Tính năng
- Quản lý thể loại.
- Quản lý sách: thêm/sửa/ẩn/bỏ ẩn/xóa, tìm kiếm theo tiêu đề/tác giả.
- Quản lý bạn đọc với quota mượn.
- Mượn sách: kiểm tra quota và tồn kho, giảm số lượng khi mượn.
- Trả sách: tăng số lượng.
- Cập nhật/xóa giao dịch mượn khi chưa trả.
- Thống kê mượn/trả theo tuần/tháng/người; tồn kho.
- Đăng nhập: username/password, Google, Facebook.

## Cách chạy nhanh (Windows PowerShell)
Xem thêm trong `docs/setup-windows.md`.

## Quy trình Git
Xem chi tiết trong `docs/GIT_WORKFLOW.md`. Tóm tắt:
- Nhánh chính: `main`.
- Nhánh tính năng: `feature/<ten>`.
- Commit chuẩn: `type(scope): message` (ví dụ `feat(book): thêm API tìm kiếm`).
- Pull Request nhỏ, có mô tả cách test.

## Lệnh Git cơ bản
```powershell
# Tạo nhánh mới làm việc
git checkout -b feature/books-crud

# Xem trạng thái
git status

# Thêm và commit
git add .
git commit -m "feat(book): thêm toggle ẩn/hiện"

# Đồng bộ với remote
git push -u origin feature/books-crud

# Rebase với main khi cần cập nhật
git fetch origin
git rebase origin/main

# Tạo tag phiên bản
git tag -a v1.0.0 -m "Release đầu tiên"
git push origin v1.0.0
```

## CI/CD
Workflow GitHub Actions (`.github/workflows/ci.yml`) tự động:
- Chạy build frontend (npm ci + npm run build).
- Chạy build backend (mvn package skip tests nếu chưa có test).
- Cache dependency để tăng tốc.
- Upload artifact: thư mục `client/dist` và file jar `server/target/*.jar`.

Thêm test/lint sau:
```yaml
	- name: Run frontend tests
		working-directory: client
		run: npm test -- --ci

	- name: Run backend tests
		working-directory: server
		run: mvn test
```

Khi PR vào `main`, workflow chạy để bảo đảm không vỡ build trước khi merge.
