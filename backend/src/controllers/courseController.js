const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const { search, category, featured } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        liveClasses: {
          include: { createdBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function getMyCourses(req, res, next) {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.user.id },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = courses.map((c) => ({
      ...c,
      enrollmentCount: c._count.enrollments,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, price, rating, whatsappGroupLink, imageUrl, instructorId } = req.body;

    const resolvedInstructorId =
      req.user.role === 'admin' && instructorId ? parseInt(instructorId) : req.user.id;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId: resolvedInstructorId,
        price: price !== undefined ? parseFloat(price) : 0,
        rating: rating !== undefined ? parseFloat(rating) : 4.5,
        whatsappGroupLink: whatsappGroupLink || null,
        imageUrl: imageUrl || null,
      },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, price, rating, whatsappGroupLink, imageUrl } = req.body;

    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(whatsappGroupLink !== undefined && { whatsappGroupLink }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });

    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.course.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, getMyCourses, create, update, remove };
