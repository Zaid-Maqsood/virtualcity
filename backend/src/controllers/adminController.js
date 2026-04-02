const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers(req, res, next) {
  try {
    const { role, search } = req.query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        isActive: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function toggleUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [totalUsers, totalCourses, totalEnrollments, totalStudents, totalTeachers, coursesWithPrice] =
      await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.user.count({ where: { role: 'student' } }),
        prisma.user.count({ where: { role: 'teacher' } }),
        prisma.course.findMany({
          select: {
            price: true,
            _count: { select: { enrollments: true } },
          },
        }),
      ]);

    const revenue = coursesWithPrice.reduce(
      (sum, c) => sum + c.price * c._count.enrollments,
      0
    );

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalStudents,
      totalTeachers,
      revenue: Math.round(revenue * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
}

async function assignTeacher(req, res, next) {
  try {
    const { id } = req.params;
    const { instructorId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ error: 'instructorId is required' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: parseInt(instructorId) },
      select: { id: true, name: true, role: true },
    });

    if (!teacher || !['teacher', 'admin'].includes(teacher.role)) {
      return res.status(400).json({ error: 'User is not a teacher' });
    }

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { instructorId: parseInt(instructorId) },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });

    res.json(course);
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, toggleUser, getStats, assignTeacher };
