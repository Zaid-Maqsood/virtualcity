const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function submit(req, res, next) {
  try {
    const { assignmentId, content, fileUrl } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: 'assignmentId is required' });
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: parseInt(assignmentId),
          studentId: req.user.id,
        },
      },
      update: {
        content: content || null,
        fileUrl: fileUrl || null,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: parseInt(assignmentId),
        studentId: req.user.id,
        content: content || null,
        fileUrl: fileUrl || null,
      },
      include: {
        assignment: { select: { id: true, title: true } },
        student: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
}

async function getForAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: parseInt(assignmentId) },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { id: true, title: true, dueDate: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });

    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

async function getMySubmissions(req, res, next) {
  try {
    const submissions = await prisma.submission.findMany({
      where: { studentId: req.user.id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

async function grade(req, res, next) {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: parseInt(id) },
      data: {
        ...(grade !== undefined && { grade }),
        ...(feedback !== undefined && { feedback }),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { id: true, title: true } },
      },
    });

    res.json(submission);
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, getForAssignment, getMySubmissions, grade };
