const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getForCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const assignments = await prisma.assignment.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function getMyAssignments(req, res, next) {
  try {
    if (req.user.role === 'student') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.user.id },
        select: { courseId: true },
      });

      const courseIds = enrollments.map((e) => e.courseId);

      const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { id: true, title: true } },
          createdBy: { select: { id: true, name: true } },
          submissions: {
            where: { studentId: req.user.id },
            select: { id: true, grade: true, feedback: true, submittedAt: true, content: true, fileUrl: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      const result = assignments.map((a) => {
        const sub = a.submissions?.[0];
        return {
          ...a,
          courseName: a.course?.title || '-',
          status: sub ? (sub.grade != null ? 'graded' : 'submitted') : 'pending',
          grade: sub?.grade ?? null,
        };
      });

      return res.json(result);
    } else {
      // teacher / admin: assignments for their courses
      const courses = await prisma.course.findMany({
        where: { instructorId: req.user.id },
        select: { id: true },
      });
      const courseIds = courses.map((c) => c.id);

      const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { id: true, title: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'asc' },
      });

      const result = assignments.map((a) => ({
        ...a,
        courseName: a.course?.title || '-',
        submissionCount: a._count?.submissions ?? 0,
      }));

      return res.json(result);
    }
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { courseId, title, description, dueDate } = req.body;

    if (!courseId || !title || !description || !dueDate) {
      return res.status(400).json({ error: 'courseId, title, description, and dueDate are required' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: parseInt(courseId),
        title,
        description,
        dueDate: new Date(dueDate),
        createdById: req.user.id,
      },
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      },
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.assignment.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getForCourse, getMyAssignments, create, update, remove };
