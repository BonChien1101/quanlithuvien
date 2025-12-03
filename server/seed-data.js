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
      { title: 'Số đỏ', author: 'Vũ Trọng Phụng', stock: 15, categoryId: 1 },
      { title: 'Tắt đèn', author: 'Ngô Tất Tố', stock: 12, categoryId: 1 },
      { title: 'Chí Phèo', author: 'Nam Cao', stock: 20, categoryId: 1 },
      { title: 'Lão Hạc', author: 'Nam Cao', stock: 18, categoryId: 1 },
      { title: 'Vợ nhặt', author: 'Kim Lân', stock: 10, categoryId: 1 },
      { title: 'Nhà giả kim', author: 'Paulo Coelho', stock: 25, categoryId: 1 },
      { title: 'Đắc nhân tâm', author: 'Dale Carnegie', stock: 30, categoryId: 6 },
      
      // Khoa học & Công nghệ
      { title: 'Lược sử thời gian', author: 'Stephen Hawking', stock: 8, categoryId: 2 },
      { title: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', stock: 22, categoryId: 2 },
      { title: 'Homo Deus', author: 'Yuval Noah Harari', stock: 18, categoryId: 2 },
      { title: 'Thuật toán đời sống', author: 'Brian Christian', stock: 10, categoryId: 2 },
      { title: 'Clean Code', author: 'Robert C. Martin', stock: 15, categoryId: 2 },
      
      // Lịch sử
      { title: 'Việt Nam sử lược', author: 'Trần Trọng Kim', stock: 12, categoryId: 3 },
      { title: 'Đại Việt sử ký toàn thư', author: 'Ngô Sĩ Liên', stock: 8, categoryId: 3 },
      { title: 'Lịch sử thế giới', author: 'J.M. Roberts', stock: 10, categoryId: 3 },
      
      // Triết học
      { title: 'Nghệ thuật sống', author: 'Thích Nhất Hạnh', stock: 20, categoryId: 4 },
      { title: 'Tuổi trẻ đáng giá bao nhiêu', author: 'Rosie Nguyễn', stock: 28, categoryId: 6 },
      { title: 'Quốc gia', author: 'Plato', stock: 6, categoryId: 4 },
      
      // Kinh tế
      { title: 'Tư bản luận', author: 'Karl Marx', stock: 5, categoryId: 5 },
      { title: 'Nghĩ giàu làm giàu', author: 'Napoleon Hill', stock: 24, categoryId: 5 },
      { title: 'Dám nghĩ lớn', author: 'David J. Schwartz', stock: 16, categoryId: 6 },
      
      // Thiếu nhi
      { title: 'Dế mèn phưu lưu ký', author: 'Tô Hoài', stock: 30, categoryId: 7 },
      { title: 'Hoàng tử bé', author: 'Antoine de Saint-Exupéry', stock: 25, categoryId: 7 },
      { title: 'Rừng Na-uy', author: 'Haruki Murakami', stock: 14, categoryId: 1 },
      { title: 'Kafka bên bờ biển', author: 'Haruki Murakami', stock: 12, categoryId: 1 },
      
      // Giáo khoa & Tham khảo
      { title: 'Toán cao cấp', author: 'Nguyễn Đình Trí', stock: 20, categoryId: 8 },
      { title: 'Vật lý đại cương', author: 'Nguyễn Văn Hùng', stock: 18, categoryId: 8 },
      { title: 'Hóa học hữu cơ', author: 'Trần Văn Nam', stock: 15, categoryId: 8 },
      { title: 'Tiếng Anh giao tiếp', author: 'Cambridge', stock: 22, categoryId: 8 },
      { title: 'Cấu trúc dữ liệu và giải thuật', author: 'Thomas H. Cormen', stock: 10, categoryId: 2 }
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
