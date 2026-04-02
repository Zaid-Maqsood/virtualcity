const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enroll(req, res, next) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId: parseInt(courseId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: req.user.id,
        courseId: parseInt(courseId),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(enrollment);
  } catch (err) {
    next(err);
  }
}

async function unenroll(req, res, next) {
  try {
    const { courseId } = req.params;

    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId: parseInt(courseId),
        },
      },
    });

    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    next(err);
  }
}

async function getMyEnrollments(req, res, next) {
  try {
    if (req.user.role === 'parent') {
      // Return enrollments for all children of this parent
      const children = await prisma.user.findMany({
        where: { parentId: req.user.id },
        select: { id: true, name: true, email: true },
      });

      const childIds = children.map((c) => c.id);

      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: { in: childIds } },
        include: {
          course: {
            include: {
              instructor: { select: { id: true, name: true } },
            },
          },
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      return res.json(enrollments);
    }

    // For student role
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
  } catch (err) {
    next(err);
  }
}

async function getCourseStudents(req, res, next) {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true } },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    res.json(enrollments);
  } catch (err) {
    next(err);
  }
}

module.exports = { enroll, unenroll, getMyEnrollments, getCourseStudents };
