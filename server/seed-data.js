require('dotenv').config();
const { sequelize, User, Book, Category } = require('./models');

async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Tắt foreign key check để có thể drop bảng
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Sync all models (force: true sẽ xóa và tạo lại bảng)
    await sequelize.sync({ force: true }); 
    console.log('✓ Models synced (tables recreated)');
    
    // Bật lại foreign key check
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Tạo categories (thể loại sách)
    const categories = await Category.bulkCreate([
      { name: 'Văn học', description: 'Sách văn học trong và ngoài nước' },
      { name: 'Khoa học', description: 'Sách khoa học tự nhiên, công nghệ' },
      { name: 'Lịch sử', description: 'Sách lịch sử và địa lý' },
      { name: 'Triết học', description: 'Sách triết học và tư tưởng' },
      { name: 'Kinh tế', description: 'Sách kinh tế, kinh doanh' },
      { name: 'Kỹ năng sống', description: 'Sách phát triển bản thân' },
      { name: 'Thiếu nhi', description: 'Sách dành cho trẻ em' },
      { name: 'Giáo khoa', description: 'Sách giáo khoa và tham khảo' }
    ], { ignoreDuplicates: true });
    console.log(`✓ Created ${categories.length} categories`);

    // 2. Tạo sách mẫu
    const books = await Book.bulkCreate([
      // Văn học
      { code: 'VH001', title: 'Số đỏ', author: 'Vũ Trọng Phụng', imageUrl: 'https://picsum.photos/seed/vh001/200/300', stock: 15, categoryId: 1 },
      { code: 'VH002', title: 'Tắt đèn', author: 'Ngô Tất Tố', imageUrl: 'https://picsum.photos/seed/vh002/200/300', stock: 12, categoryId: 1 },
      { code: 'VH003', title: 'Chí Phèo', author: 'Nam Cao', imageUrl: 'https://picsum.photos/seed/vh003/200/300', stock: 20, categoryId: 1 },
      { code: 'VH004', title: 'Lão Hạc', author: 'Nam Cao', imageUrl: 'https://picsum.photos/seed/vh004/200/300', stock: 18, categoryId: 1 },
      { code: 'VH005', title: 'Vợ nhặt', author: 'Kim Lân', imageUrl: 'https://picsum.photos/seed/vh005/200/300', stock: 10, categoryId: 1 },
      { code: 'VH006', title: 'Nhà giả kim', author: 'Paulo Coelho', imageUrl: 'https://picsum.photos/seed/vh006/200/300', stock: 25, categoryId: 1 },
      { code: 'KN001', title: 'Đắc nhân tâm', author: 'Dale Carnegie', imageUrl: 'https://picsum.photos/seed/kn001/200/300', stock: 30, categoryId: 6 },
      
      // Khoa học & Công nghệ
  { code: 'KH001', title: 'Lược sử thời gian', author: 'Stephen Hawking', imageUrl: 'https://picsum.photos/seed/kh001/200/300', stock: 8, categoryId: 2 },
  { code: 'KH002', title: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', imageUrl: 'https://picsum.photos/seed/kh002/200/300', stock: 22, categoryId: 2 },
  { code: 'KH003', title: 'Homo Deus', author: 'Yuval Noah Harari', imageUrl: 'https://picsum.photos/seed/kh003/200/300', stock: 18, categoryId: 2 },
  { code: 'KH004', title: 'Thuật toán đời sống', author: 'Brian Christian', imageUrl: 'https://picsum.photos/seed/kh004/200/300', stock: 10, categoryId: 2 },
  { code: 'CN001', title: 'Clean Code', author: 'Robert C. Martin', imageUrl: 'https://picsum.photos/seed/cn001/200/300', stock: 15, categoryId: 2 },
      
      // Lịch sử
  { code: 'LS001', title: 'Việt Nam sử lược', author: 'Trần Trọng Kim', imageUrl: 'https://picsum.photos/seed/ls001/200/300', stock: 12, categoryId: 3 },
  { code: 'LS002', title: 'Đại Việt sử ký toàn thư', author: 'Ngô Sĩ Liên', imageUrl: 'https://picsum.photos/seed/ls002/200/300', stock: 8, categoryId: 3 },
  { code: 'LS003', title: 'Lịch sử thế giới', author: 'J.M. Roberts', imageUrl: 'https://picsum.photos/seed/ls003/200/300', stock: 10, categoryId: 3 },
      
      // Triết học
  { code: 'TP001', title: 'Nghệ thuật sống', author: 'Thích Nhất Hạnh', imageUrl: 'https://picsum.photos/seed/tp001/200/300', stock: 20, categoryId: 4 },
  { code: 'KN002', title: 'Tuổi trẻ đáng giá bao nhiêu', author: 'Rosie Nguyễn', imageUrl: 'https://picsum.photos/seed/kn002/200/300', stock: 28, categoryId: 6 },
  { code: 'TP002', title: 'Quốc gia', author: 'Plato', imageUrl: 'https://picsum.photos/seed/tp002/200/300', stock: 6, categoryId: 4 },
      
      // Kinh tế
  { code: 'KT001', title: 'Tư bản luận', author: 'Karl Marx', imageUrl: 'https://picsum.photos/seed/kt001/200/300', stock: 5, categoryId: 5 },
  { code: 'KT002', title: 'Nghĩ giàu làm giàu', author: 'Napoleon Hill', imageUrl: 'https://picsum.photos/seed/kt002/200/300', stock: 24, categoryId: 5 },
  { code: 'KN003', title: 'Dám nghĩ lớn', author: 'David J. Schwartz', imageUrl: 'https://picsum.photos/seed/kn003/200/300', stock: 16, categoryId: 6 },
      
      // Thiếu nhi
  { code: 'TN001', title: 'Dế mèn phưu lưu ký', author: 'Tô Hoài', imageUrl: 'https://picsum.photos/seed/tn001/200/300', stock: 30, categoryId: 7 },
  { code: 'TN002', title: 'Hoàng tử bé', author: 'Antoine de Saint-Exupéry', imageUrl: 'https://picsum.photos/seed/tn002/200/300', stock: 25, categoryId: 7 },
  { code: 'VH007', title: 'Rừng Na-uy', author: 'Haruki Murakami', imageUrl: 'https://picsum.photos/seed/vh007/200/300', stock: 14, categoryId: 1 },
  { code: 'VH008', title: 'Kafka bên bờ biển', author: 'Haruki Murakami', imageUrl: 'https://picsum.photos/seed/vh008/200/300', stock: 12, categoryId: 1 },
      
      // Giáo khoa & Tham khảo
  { code: 'GK001', title: 'Toán cao cấp', author: 'Nguyễn Đình Trí', imageUrl: 'https://picsum.photos/seed/gk001/200/300', stock: 20, categoryId: 8 },
  { code: 'GK002', title: 'Vật lý đại cương', author: 'Nguyễn Văn Hùng', imageUrl: 'https://picsum.photos/seed/gk002/200/300', stock: 18, categoryId: 8 },
  { code: 'GK003', title: 'Hóa học hữu cơ', author: 'Trần Văn Nam', imageUrl: 'https://picsum.photos/seed/gk003/200/300', stock: 15, categoryId: 8 },
  { code: 'GK004', title: 'Tiếng Anh giao tiếp', author: 'Cambridge', imageUrl: 'https://picsum.photos/seed/gk004/200/300', stock: 22, categoryId: 8 },
  { code: 'CN002', title: 'Cấu trúc dữ liệu và giải thuật', author: 'Thomas H. Cormen', imageUrl: 'https://picsum.photos/seed/cn002/200/300', stock: 10, categoryId: 2 }
    ], { ignoreDuplicates: true });
    console.log(`✓ Created ${books.length} books`);

    // 3. admin user
    const users = await User.bulkCreate([
      { username: 'admin', password: 'admin', roles: JSON.stringify(['ADMIN']) },

    ], { 
      ignoreDuplicates: true,
      individualHooks: true // Để trigger beforeCreate hook (hash password)
    });
    console.log(`✓ Created ${users.length} sample users`);

    console.log('\n✅ Seed data completed successfully!');
    console.log('\nSample accounts:');
    console.log('  Admin: admin / admin');

    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
