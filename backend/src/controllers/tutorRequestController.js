const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function requestTutor(req, res, next) {
  try {
    const { tutorId, message } = req.body;

    if (!tutorId) {
      return res.status(400).json({ error: 'tutorId is required' });
    }

    // Verify the target is a teacher
    const teacher = await prisma.user.findFirst({
      where: { id: parseInt(tutorId), role: 'teacher' },
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutorRequest = await prisma.tutorRequest.create({
      data: {
        studentId: req.user.id,
        tutorId: parseInt(tutorId),
        message: message || null,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(tutorRequest);
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const requests = await prisma.tutorRequest.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Normalise shape for frontend (tutorName, subject)
    const mapped = requests.map((r) => ({
      ...r,
      tutor: {
        ...r.tutor,
        subject: 'Teaching',
      },
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    const updated = await prisma.tutorRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        student: { select: { id: true, name: true, email: true } },
        tutor: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { requestTutor, getAll, updateStatus };
