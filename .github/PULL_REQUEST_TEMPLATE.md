## Mô tả
Tóm tắt thay đổi chính, mục tiêu của PR.

## Liên quan
Issue/Task: Closes #<số issue> (nếu có)

## Thay đổi chi tiết
- [ ] Backend
- [ ] Frontend
- [ ] Cấu hình / DevOps

## Cách kiểm tra
Các bước cụ thể để review/test:
1. ...
2. ...

## Ảnh minh hoạ / Log
(Đính kèm nếu cần)

## Checklist chất lượng
- [ ] Đã tự chạy `npm run build` (client)
- [ ] Đã tự chạy `mvn -q -DskipTests package` (server)
- [ ] Không commit file build (dist/target)
- [ ] Không commit secrets (.env)
- [ ] Đã rebase với `main`
- [ ] Đặt tên commit đúng chuẩn

## Rủi ro / Lưu ý triển khai
Những điểm cần chú ý khi deploy (migration DB, thay đổi env...).

## Sau khi merge
- [ ] Xóa nhánh
- [ ] Tạo tag (nếu là release)
