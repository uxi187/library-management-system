const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (ignore errors if tables don't exist)
  try {
    await prisma.borrowing.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Some tables may not exist yet, continuing with seeding...');
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fiction', description: 'Fictional novels and stories' }
    }),
    prisma.category.create({
      data: { name: 'Programming', description: 'Software development and programming books' }
    }),
    prisma.category.create({
      data: { name: 'Science', description: 'Scientific books and research' }
    }),
    prisma.category.create({
      data: { name: 'Biography', description: 'Biographical and autobiographical works' }
    }),
    prisma.category.create({
      data: { name: 'History', description: 'Historical books and documentaries' }
    })
  ]);

  // Create authors
  const authors = await Promise.all([
    prisma.author.create({
      data: { 
        name: 'Robert C. Martin',
        bio: 'Software engineer and author known for Clean Code',
        birthYear: 1952
      }
    }),
    prisma.author.create({
      data: { 
        name: 'Douglas Crockford',
        bio: 'JavaScript architect at Yahoo!, known for JSON',
        birthYear: 1955
      }
    }),
    prisma.author.create({
      data: { 
        name: 'George Orwell',
        bio: 'English novelist and essayist',
        birthYear: 1903
      }
    }),
    prisma.author.create({
      data: { 
        name: 'Harper Lee',
        bio: 'American novelist',
        birthYear: 1926
      }
    }),
    prisma.author.create({
      data: { 
        name: 'Stephen Hawking',
        bio: 'Theoretical physicist and cosmologist',
        birthYear: 1942
      }
    })
  ]);

  // Create books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        authorId: authors[0].id,
        categoryId: categories[1].id, // Programming
        isbn: '978-0132350884',
        publishedYear: 2008,
        description: 'A comprehensive guide to writing clean, maintainable code.',
        available: true
      }
    }),
    prisma.book.create({
      data: {
        title: 'JavaScript: The Good Parts',
        authorId: authors[1].id,
        categoryId: categories[1].id, // Programming
        isbn: '978-0596517748',
        publishedYear: 2008,
        description: 'Unearthing the excellence in JavaScript.',
        available: true
      }
    }),
    prisma.book.create({
      data: {
        title: '1984',
        authorId: authors[2].id,
        categoryId: categories[0].id, // Fiction
        isbn: '978-0451524935',
        publishedYear: 1949,
        description: 'A dystopian social science fiction novel.',
        available: true
      }
    }),
    prisma.book.create({
      data: {
        title: 'To Kill a Mockingbird',
        authorId: authors[3].id,
        categoryId: categories[0].id, // Fiction
        isbn: '978-0060935467',
        publishedYear: 1960,
        description: 'A gripping tale of racial injustice and childhood innocence.',
        available: true
      }
    }),
    prisma.book.create({
      data: {
        title: 'A Brief History of Time',
        authorId: authors[4].id,
        categoryId: categories[2].id, // Science
        isbn: '978-0553380163',
        publishedYear: 1988,
        description: 'A landmark volume in science writing.',
        available: true
      }
    })
  ]);

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testPassword = await bcrypt.hash('testpass123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@library.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        membershipType: 'ADMIN',
        phone: '555-0001',
        address: '123 Library St'
      }
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        membershipType: 'MEMBER',
        phone: '555-0002',
        address: '456 Main St'
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        membershipType: 'LIBRARIAN',
        phone: '555-0003',
        address: '789 Oak Ave'
      }
    }),
    prisma.user.create({
      data: {
        email: 'test.user@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: testPassword,
        membershipType: 'MEMBER',
        phone: '555-0004',
        address: '321 Test Blvd'
      }
    })
  ]);

  // Create some borrow records and update book availability
  const borrowRecords = await Promise.all([
    prisma.borrowing.create({
      data: {
        userId: users[1].userId,
        bookId: books[0].id,
        dueDate: new Date('2024-01-29'),
        status: 'ACTIVE'
      }
    }),
    prisma.borrowing.create({
      data: {
        userId: users[2].userId,
        bookId: books[3].id,
        dueDate: new Date('2024-01-24'),
        returnedAt: new Date('2024-01-23'),
        status: 'RETURNED'
      }
    }),
    prisma.borrowing.create({
      data: {
        userId: users[2].userId,
        bookId: books[1].id,
        dueDate: new Date('2024-02-03'),
        status: 'ACTIVE'
      }
    })
  ]);

  // Update book availability for books with ACTIVE borrowings
  await Promise.all([
    // Clean Code (books[0]) is borrowed by John Doe - set to unavailable
    prisma.book.update({
      where: { id: books[0].id },
      data: { available: false }
    }),
    // JavaScript: The Good Parts (books[1]) is borrowed by Jane Smith - set to unavailable  
    prisma.book.update({
      where: { id: books[1].id },
      data: { available: false }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`📚 Created ${books.length} books`);
  console.log(`👥 Created ${users.length} users`);
  console.log(`📖 Created ${borrowRecords.length} borrow records`);
  console.log(`🏷️ Created ${categories.length} categories`);
  console.log(`✍️ Created ${authors.length} authors`);
  
  console.log('\n🔐 Test credentials:');
  console.log('Email: test.user@example.com');
  console.log('Password: testpass123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
