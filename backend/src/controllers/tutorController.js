const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const { search } = req.query;

    const teachers = await prisma.user.findMany({
      where: {
        role: 'teacher',
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        taughtCourses: { select: { title: true, category: true } },
      },
      orderBy: { name: 'asc' },
    });

    const tutors = teachers.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.taughtCourses.map((c) => c.title).join(', ') || 'General',
      rating: 5.0,
      bio: `Teacher at Virtual City School. Teaches ${t.taughtCourses.map((c) => c.title).join(', ') || 'various subjects'}.`,
      imageUrl: null,
    }));

    res.json(tutors);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll };
