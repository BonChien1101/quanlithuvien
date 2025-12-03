require('dotenv').config();
const { sequelize, Reader, Loan, Book } = require('./models');

async function seedLoans() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // 1. Tạo readers (độc giả) nếu chưa có
    const readers = await Reader.bulkCreate([
      { name: 'Nguyễn Văn A', address: 'Hà Nội', phone: '0123456789', quota: 5 },
      { name: 'Trần Thị B', address: 'TP.HCM', phone: '0987654321', quota: 5 },
      { name: 'Lê Văn C', address: 'Đà Nẵng', phone: '0369852147', quota: 3 },
      { name: 'Phạm Thị D', address: 'Cần Thơ', phone: '0159753486', quota: 5 },
      { name: 'Hoàng Văn E', address: 'Hải Phòng', phone: '0147258369', quota: 4 },
    ], { ignoreDuplicates: true });
    console.log(`✓ Created/checked ${readers.length} readers`);

    // 2. Lấy danh sách sách
    const books = await Book.findAll();
    if (books.length === 0) {
      console.log('⚠ No books found. Please run seed-data.js first!');
      process.exit(1);
    }

    // 3. Tạo các khoản mượn sách với thời gian khác nhau
    const now = new Date();
    
    // Mượn trong tuần này (7 ngày gần đây)
    const weekLoans = [];
    for (let i = 0; i < 8; i++) {
      const borrowDate = new Date(now);
      borrowDate.setDate(now.getDate() - i);
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + 14); // Hạn trả sau 14 ngày
      
      weekLoans.push({
        bookId: books[i % books.length].id,
        readerId: (i % 5) + 1, // Readers có id từ 1-5
        borrowedAt: borrowDate,
        dueAt: dueDate,
        returnedAt: i % 3 === 0 ? new Date(borrowDate.setDate(borrowDate.getDate() + 7)) : null // Một số đã trả
      });
    }

    // Mượn trong tháng này (30 ngày gần đây)
    const monthLoans = [];
    for (let i = 7; i < 20; i++) {
      const borrowDate = new Date(now);
      borrowDate.setDate(now.getDate() - i);
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + 14);
      
      monthLoans.push({
        bookId: books[i % books.length].id,
        readerId: (i % 5) + 1,
        borrowedAt: borrowDate,
        dueAt: dueDate,
        returnedAt: i % 2 === 0 ? new Date(borrowDate.setDate(borrowDate.getDate() + 10)) : null
      });
    }

    // Mượn từ tháng trước
    const oldLoans = [];
    for (let i = 0; i < 5; i++) {
      const borrowDate = new Date(now);
      borrowDate.setMonth(now.getMonth() - 2);
      borrowDate.setDate(now.getDate() - i);
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + 14);
      
      oldLoans.push({
        bookId: books[i % books.length].id,
        readerId: (i % 5) + 1,
        borrowedAt: borrowDate,
        dueAt: dueDate,
        returnedAt: new Date(borrowDate.setDate(borrowDate.getDate() + 12)) // Đã trả hết
      });
    }

    const allLoans = [...weekLoans, ...monthLoans, ...oldLoans];
    const createdLoans = await Loan.bulkCreate(allLoans, { ignoreDuplicates: true });
    console.log(`✓ Created ${createdLoans.length} loan records`);

    // Thống kê
    const totalBorrowed = createdLoans.length;
    const totalReturned = createdLoans.filter(l => l.returnedAt !== null).length;
    const stillBorrowing = totalBorrowed - totalReturned;

    console.log('\n✅ Seed loans completed successfully!');
    console.log(`\n📊 Statistics:`);
    console.log(`  Total loans: ${totalBorrowed}`);
    console.log(`  Returned: ${totalReturned}`);
    console.log(`  Still borrowing: ${stillBorrowing}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding loans:', error);
    process.exit(1);
  }
}

seedLoans();
