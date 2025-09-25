import Prisma from './prisma/prisma.js';

async function checkData() {
  try {
    console.log('=== Checking Database Test Data ===\n');

    // Check admin users
    const adminUsers = await Prisma.user.findMany({
      where: { role: 'admin' },
      select: { uuid: true, email: true, role: true }
    });
    console.log('Admin users:', adminUsers);

    // Check courses with sessions
    const courses = await Prisma.course.findMany({
      take: 2,
      include: {
        sessions: {
          take: 3,
          select: { id: true, title: true, date: true }
        },
        enrollments: {
          take: 2,
          select: { id: true, status: true }
        }
      }
    });
    console.log('\nCourses with sessions:');
    courses.forEach(course => {
      console.log(`- ${course.title} (ID: ${course.id})`);
      console.log(`  Sessions: ${course.sessions.length}`);
      console.log(`  Enrollments: ${course.enrollments.length}`);
    });

    // Check students
    const students = await Prisma.student.findMany({
      take: 3,
      include: {
        user: { select: { uuid: true, email: true } },
        enrollments: { select: { id: true, courseId: true } }
      }
    });
    console.log('\nStudents:');
    students.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (${student.user.email})`);
      console.log(`  Enrollments: ${student.enrollments.length}`);
    });

    await Prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();