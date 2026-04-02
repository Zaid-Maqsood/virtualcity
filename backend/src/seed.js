const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Delete all records in reverse dependency order
  console.log('Cleaning existing data...');
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.tutorRequest.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');

  // 2. Create admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@virtualcity.edu',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 3. Create teachers
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@virtualcity.edu',
      password: teacherPassword,
      role: 'teacher',
    },
  });
  const john = await prisma.user.create({
    data: {
      name: 'John Williams',
      email: 'john@virtualcity.edu',
      password: teacherPassword,
      role: 'teacher',
    },
  });
  console.log(`Created teachers: ${sarah.email}, ${john.email}`);

  // 4. Create students
  const studentPassword = await bcrypt.hash('student123', 10);
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@student.edu',
      password: studentPassword,
      role: 'student',
      grade: '10',
    },
  });
  const bob = await prisma.user.create({
    data: {
      name: 'Bob Martinez',
      email: 'bob@student.edu',
      password: studentPassword,
      role: 'student',
      grade: '11',
    },
  });
  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie@student.edu',
      password: studentPassword,
      role: 'student',
      grade: '9',
    },
  });
  console.log(`Created students: ${alice.email}, ${bob.email}, ${charlie.email}`);

  // 5. Create parent linked to alice
  const parentPassword = await bcrypt.hash('parent123', 10);
  const parent = await prisma.user.create({
    data: {
      name: 'Mary Smith',
      email: 'parent@virtualcity.edu',
      password: parentPassword,
      role: 'parent',
    },
  });
  // Link alice to parent
  await prisma.user.update({
    where: { id: alice.id },
    data: { parentId: parent.id },
  });
  console.log(`Created parent: ${parent.email} (linked to ${alice.email})`);

  // 6. Create courses
  console.log('Creating courses...');
  const mathCourse = await prisma.course.create({
    data: {
      title: 'Mathematics Grade 10',
      description: 'Comprehensive mathematics course covering algebra, geometry, and trigonometry for Grade 10 students.',
      instructorId: sarah.id,
      price: 99.99,
      rating: 4.8,
      category: 'Tech',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    },
  });
  const scienceCourse = await prisma.course.create({
    data: {
      title: 'Science Grade 10',
      description: 'Explore the wonders of physics, chemistry, and biology in this comprehensive science course.',
      instructorId: sarah.id,
      price: 89.99,
      rating: 4.7,
      category: 'Tech',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543559lernen?w=400',
    },
  });
  const englishCourse = await prisma.course.create({
    data: {
      title: 'English Literature',
      description: 'Dive deep into classic and contemporary literature, developing critical reading and writing skills.',
      instructorId: john.id,
      price: 79.99,
      rating: 4.6,
      category: 'Arts',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    },
  });
  const historyCourse = await prisma.course.create({
    data: {
      title: 'World History',
      description: 'Journey through major historical events and civilizations that shaped our modern world.',
      instructorId: john.id,
      price: 74.99,
      rating: 4.5,
      category: 'Arts',
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
    },
  });
  const satCourse = await prisma.course.create({
    data: {
      title: 'SAT Test Preparation',
      description: 'Complete SAT prep covering math, reading, and writing sections with practice tests and strategies.',
      instructorId: sarah.id,
      price: 149.99,
      rating: 4.9,
      category: 'Test Prep',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400',
    },
  });
  console.log('Created 5 courses: Mathematics, Science, English, History, SAT Prep');

  // 7. Tutors are teachers — no separate Tutor records needed
  console.log('Teachers serve as tutors (no separate Tutor records).');

  // 8. Enroll alice and bob in Mathematics and Science
  console.log('Creating enrollments...');
  await prisma.enrollment.createMany({
    data: [
      { studentId: alice.id, courseId: mathCourse.id },
      { studentId: alice.id, courseId: scienceCourse.id },
      { studentId: bob.id, courseId: mathCourse.id },
      { studentId: bob.id, courseId: scienceCourse.id },
    ],
  });
  console.log('Enrolled Alice and Bob in Mathematics and Science');

  // 9. Create 2 assignments for Mathematics
  console.log('Creating assignments...');
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: mathCourse.id,
      title: 'Algebra Problem Set 1',
      description: 'Solve the following 20 algebraic equations. Show all working steps for full marks.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      createdById: sarah.id,
    },
  });
  const assignment2 = await prisma.assignment.create({
    data: {
      courseId: mathCourse.id,
      title: 'Geometry Quiz',
      description: 'Complete the geometry exercises covering triangles, circles, and quadrilaterals.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdById: sarah.id,
    },
  });
  console.log(`Created 2 assignments: "${assignment1.title}", "${assignment2.title}"`);

  // 10. Create 1 live class for Mathematics
  console.log('Creating live class...');
  const liveClass = await prisma.liveClass.create({
    data: {
      courseId: mathCourse.id,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      title: 'Weekly Math Session - Algebra Review',
      createdById: sarah.id,
    },
  });
  console.log(`Created live class: "${liveClass.title}"`);

  // 11. Seed attendance for enrolled students (past 4 weeks, Mon/Wed/Fri)
  console.log('Creating attendance records...');

  // Build list of past session dates (Mon/Wed/Fri over last 4 weeks = 12 dates)
  function getPastSessionDates(weeksBack = 4) {
    const dates = [];
    const now = new Date();
    for (let w = weeksBack; w >= 1; w--) {
      // Monday, Wednesday, Friday of that week
      for (const dayOffset of [0, 2, 4]) {
        const d = new Date(now);
        d.setDate(d.getDate() - (w * 7) + dayOffset);
        d.setHours(9, 0, 0, 0);
        dates.push(new Date(d));
      }
    }
    return dates;
  }

  function randomStatus() {
    const r = Math.random();
    if (r < 0.75) return 'present';
    if (r < 0.90) return 'absent';
    return 'late';
  }

  const sessionDates = getPastSessionDates(4);
  const enrollments = [
    { studentId: alice.id, courseId: mathCourse.id },
    { studentId: alice.id, courseId: scienceCourse.id },
    { studentId: bob.id, courseId: mathCourse.id },
    { studentId: bob.id, courseId: scienceCourse.id },
  ];

  const attendanceData = [];
  for (const { studentId, courseId } of enrollments) {
    for (const date of sessionDates) {
      attendanceData.push({ studentId, courseId, date, status: randomStatus() });
    }
  }

  await prisma.attendance.createMany({ data: attendanceData });
  console.log(`Created ${attendanceData.length} attendance records`);

  // 12. Create sample announcements
  console.log('Creating announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to Virtual City School!',
        body: 'We are excited to have you here. Explore your courses, join live classes, and reach out to your tutors.',
        courseId: null,
        authorId: admin.id,
      },
      {
        title: 'Algebra Quiz Next Week',
        body: 'Reminder: the Geometry Quiz for Mathematics Grade 10 is due next week. Please review chapters 3–5.',
        courseId: mathCourse.id,
        authorId: sarah.id,
      },
    ],
  });
  console.log('Created 2 announcements');

  console.log('\nSeed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin:   admin@virtualcity.edu / admin123');
  console.log('  Teacher: sarah@virtualcity.edu / teacher123');
  console.log('  Teacher: john@virtualcity.edu / teacher123');
  console.log('  Student: alice@student.edu / student123');
  console.log('  Student: bob@student.edu / student123');
  console.log('  Student: charlie@student.edu / student123');
  console.log('  Parent:  parent@virtualcity.edu / parent123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
