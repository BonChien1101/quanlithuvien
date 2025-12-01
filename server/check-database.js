const { sequelize, Book, Category, User } = require('./models');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Kết nối database thành công\n');

    const bookCount = await Book.count();
    const categoryCount = await Category.count();
    const userCount = await User.count();

    console.log('=== THỐNG KÊ DỮ LIỆU TRONG DATABASE ===');
    console.log(`Tổng số sách: ${bookCount}`);
    console.log(`Tổng số thể loại: ${categoryCount}`);
    console.log(`Tổng số người dùng: ${userCount}\n`);

    // Hiển thị 5 sách mới nhất
    const recentBooks = await Book.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ association: 'category', attributes: ['name'] }]
    });

    console.log('=== 5 SÁCH MỚI NHẤT ===');
    recentBooks.forEach(book => {
      console.log(`- [${book.id}] ${book.title} (Thể loại: ${book.category?.name || 'N/A'})`);
    });

    // Hiển thị tất cả thể loại
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    console.log('\n=== TẤT CẢ THỂ LOẠI ===');
    categories.forEach(cat => {
      console.log(`- [${cat.id}] ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error.message);
    process.exit(1);
  }
}

checkDatabase();
