import Prisma from './prisma/prisma.js';
import bcrypt from 'bcryptjs';

async function checkAdminCredentials() {
  try {
    console.log('=== Checking Admin Credentials ===\n');

    // Check existing admin users
    const adminUsers = await Prisma.user.findMany({
      where: { role: 'admin' },
      select: { uuid: true, email: true, hashedPassword: true }
    });

    console.log('Found admin users:');
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.uuid})`);
    });

    // Test common passwords
    const commonPasswords = ['admin123', 'password', '123456', 'admin'];

    for (const user of adminUsers) {
      console.log(`\nTesting passwords for ${user.email}:`);

      for (const password of commonPasswords) {
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (isMatch) {
          console.log(`✅ Found password: ${password}`);
          break;
        }
      }
    }

    await Prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminCredentials();