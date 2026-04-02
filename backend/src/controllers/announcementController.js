const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const { courseId } = req.query;

    let where = {};

    if (req.user.role === 'student') {
      // student sees: global announcements + announcements for courses they're enrolled in
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.user.id },
        select: { courseId: true },
      });
      const courseIds = enrollments.map((e) => e.courseId);
      where = {
        OR: [
          { courseId: null },
          { courseId: { in: courseIds } },
        ],
      };
    } else if (req.user.role === 'parent') {
      const child = await prisma.user.findFirst({
        where: { parentId: req.user.id },
        select: { id: true },
      });
      if (child) {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: child.id },
          select: { courseId: true },
        });
        const courseIds = enrollments.map((e) => e.courseId);
        where = {
          OR: [
            { courseId: null },
            { courseId: { in: courseIds } },
          ],
        };
      }
    } else if (req.user.role === 'teacher') {
      // teacher sees global + announcements for their courses
      const courses = await prisma.course.findMany({
        where: { instructorId: req.user.id },
        select: { id: true },
      });
      const courseIds = courses.map((c) => c.id);
      where = {
        OR: [
          { courseId: null },
          { courseId: { in: courseIds } },
        ],
      };
    }
    // admin sees all (no where filter)

    if (courseId) {
      where = { courseId: parseInt(courseId) };
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, role: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(announcements);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, body, courseId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        courseId: courseId ? parseInt(courseId) : null,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, remove };
