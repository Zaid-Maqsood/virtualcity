const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getForCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const liveClasses = await prisma.liveClass.findMany({
      where: { courseId: parseInt(courseId) },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(liveClasses);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const liveClass = await prisma.liveClass.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });
    if (!liveClass) return res.status(404).json({ error: 'Live class not found' });
    res.json(liveClass);
  } catch (err) {
    next(err);
  }
}

async function getMy(req, res, next) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);

    const liveClasses = await prisma.liveClass.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        createdBy: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(liveClasses);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { courseId, meetingLink, title, scheduledAt } = req.body;

    if (!courseId || !meetingLink) {
      return res.status(400).json({ error: 'courseId and meetingLink are required' });
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        courseId: parseInt(courseId),
        meetingLink,
        title: title || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });

    // Auto-announce to enrolled students
    const sessionTitle = liveClass.title || 'Live Session';
    const courseName = liveClass.course?.title || 'your course';
    const when = liveClass.scheduledAt
      ? new Date(liveClass.scheduledAt).toLocaleString()
      : 'soon';
    await prisma.announcement.create({
      data: {
        title: `Live Class Scheduled: ${sessionTitle}`,
        body: `A new live class "${sessionTitle}" has been scheduled for ${courseName} on ${when}. Click Join in your dashboard to attend.`,
        courseId: liveClass.courseId,
        authorId: req.user.id,
      },
    });

    res.status(201).json(liveClass);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.liveClass.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Live class deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getForCourse, getMy, getOne, create, remove };
