const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDashboard(req, res, next) {
  try {
    const children = await prisma.user.findMany({
      where: { parentId: req.user.id },
      select: {
        id: true,
        name: true,
        grade: true,
        enrollments: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        attendance: {
          select: { status: true },
        },
        submissions: {
          select: { grade: true, assignment: { select: { title: true, dueDate: true, course: { select: { title: true } } } } },
        },
      },
    });

    const rows = [];
    let totalAssignments = 0;

    for (const child of children) {
      for (const enrollment of child.enrollments) {
        const childSubmissions = child.submissions.filter(
          (s) => s.assignment?.course?.title === enrollment.course.title
        );
        const graded = childSubmissions.filter((s) => s.grade != null);
        const avgGrade =
          graded.length > 0
            ? Math.round(graded.reduce((sum, s) => sum + Number(s.grade), 0) / graded.length)
            : null;

        rows.push({
          studentName: child.name,
          courseName: enrollment.course.title,
          grade: avgGrade != null ? `${avgGrade}%` : 'N/A',
          attendance: child.attendance.length > 0
            ? `${Math.round((child.attendance.filter((a) => a.status === 'present').length / child.attendance.length) * 100)}%`
            : 'N/A',
        });
      }
      totalAssignments += child.submissions.length;
    }

    const totalCourses = children.reduce((sum, c) => sum + c.enrollments.length, 0);

    res.json({
      childrenCount: children.length,
      totalCourses,
      totalAssignments,
      children: children.map((c) => ({ id: c.id, name: c.name, grade: c.grade })),
      rows,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
