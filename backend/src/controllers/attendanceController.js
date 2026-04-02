const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function joinClass(req, res, next) {
  try {
    const { liveClassId } = req.params;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: parseInt(liveClassId) },
    });

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    const { courseId } = liveClass;

    // Check if attendance already marked today for this student and course
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: req.user.id,
        courseId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Attendance already marked for today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: req.user.id,
        courseId,
        status: 'present',
      },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
}

async function getForCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const where = {
      courseId: parseInt(courseId),
      ...(req.user.role === 'student' && { studentId: req.user.id }),
    };

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
      },
    });

    res.json(attendance);
  } catch (err) {
    next(err);
  }
}

async function getMyAttendance(req, res, next) {
  try {
    let studentId = req.user.id;

    // parent: get child's attendance
    if (req.user.role === 'parent') {
      const child = await prisma.user.findFirst({
        where: { parentId: req.user.id },
        select: { id: true },
      });
      if (!child) return res.json([]);
      studentId = child.id;
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (err) {
    next(err);
  }
}

module.exports = { joinClass, getForCourse, update, getMyAttendance };
