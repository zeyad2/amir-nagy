import bcrypt from "bcryptjs";
import Prisma from "../prisma/prisma.js";

async function createAdminUser() {
  try {
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await Prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = await Prisma.user.create({
      data: {
        email: adminEmail,
        hashedPassword: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🆔 UUID: ${adminUser.uuid}`);

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await Prisma.$disconnect();
  }
}

createAdminUser();