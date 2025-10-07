/**
 * Admin Courses Controller
 * Handles CRUD operations for courses management
 */
import Prisma from "../../prisma/prisma.js";
import { createResponse, createErrorResponse } from "../../utils/response.utils.js";

/**
 * Get all courses with enrollment and usage information
 * GET /api/admin/courses
 */
export const getCourses = async (req, res) => {
  try {
    const {
      search,
      status,
      type,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const where = {
      deletedAt: null // Only show non-deleted courses
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Build order clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [courses, totalCount] = await Promise.all([
      Prisma.course.findMany({
        where,
        include: {
          enrollments: {
            where: { status: 'active' },
            select: { id: true }
          },
          courseLessons: {
            select: { id: true }
          },
          courseHomeworks: {
            select: { id: true }
          },
          courseTests: {
            select: { id: true }
          },
          enrollmentRequests: {
            where: { status: 'pending' },
            select: { id: true }
          }
        },
        orderBy,
        take: parseInt(limit),
        skip: offset
      }),
      Prisma.course.count({ where })
    ]);

    // Transform courses with additional information
    const coursesWithStats = courses.map(course => ({
      id: course.id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      type: course.type,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt,
      stats: {
        activeEnrollments: course.enrollments.length,
        pendingRequests: course.enrollmentRequests.length,
        totalLessons: course.courseLessons.length,
        totalHomework: course.courseHomeworks.length,
        totalTests: course.courseTests.length,
        totalContent: course.courseLessons.length + course.courseHomeworks.length + course.courseTests.length
      },
      canDelete: course.enrollments.length === 0 && course.enrollmentRequests.length === 0
    }));

    return createResponse(res, 200, 'Courses fetched successfully', {
      courses: coursesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return createErrorResponse(res, 500, 'Failed to fetch courses');
  }
};

/**
 * Get a single course by ID with detailed information
 * GET /api/admin/courses/:id
 */
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      },
      include: {
        enrollments: {
          where: { status: 'active' },
          include: {
            student: {
              select: {
                uuid: true,
                firstName: true,
                middleName: true,
                lastName: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        enrollmentRequests: {
          where: { status: 'pending' },
          include: {
            student: {
              select: {
                uuid: true,
                firstName: true,
                middleName: true,
                lastName: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        courseLessons: {
          include: {
            lesson: {
              select: { id: true, title: true }
            }
          },
          orderBy: { order: 'asc' }
        },
        courseHomeworks: {
          include: {
            homework: {
              select: { id: true, title: true }
            }
          },
          orderBy: { dueDate: 'asc' }
        },
        courseTests: {
          include: {
            test: {
              select: { id: true, title: true }
            }
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Transform course data
    const courseWithDetails = {
      id: course.id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      type: course.type,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt,
      stats: {
        activeEnrollments: course.enrollments.length,
        pendingRequests: course.enrollmentRequests.length,
        totalLessons: course.courseLessons.length,
        totalHomework: course.courseHomeworks.length,
        totalTests: course.courseTests.length,
        totalContent: course.courseLessons.length + course.courseHomeworks.length + course.courseTests.length
      },
      content: {
        lessons: course.courseLessons.map(cl => ({
          id: cl.lesson.id.toString(),
          title: cl.lesson.title,
          order: cl.order
        })),
        homework: course.courseHomeworks.map(ch => ({
          id: ch.homework.id.toString(),
          title: ch.homework.title,
          dueDate: ch.dueDate
        })),
        tests: course.courseTests.map(ct => ({
          id: ct.test.id.toString(),
          title: ct.test.title,
          dueDate: ct.dueDate
        }))
      },
      enrolledStudents: course.enrollments.map(enrollment => ({
        id: enrollment.student.uuid.toString(),
        name: `${enrollment.student.firstName} ${enrollment.student.middleName || ''} ${enrollment.student.lastName}`.trim(),
        email: enrollment.student.user.email,
        enrollmentDate: enrollment.createdAt
      })),
      pendingRequests: course.enrollmentRequests.map(request => ({
        id: request.id.toString(),
        studentName: `${request.student.firstName} ${request.student.middleName || ''} ${request.student.lastName}`.trim(),
        email: request.student.user.email,
        requestDate: request.requestedAt
      })),
      canDelete: course.enrollments.length === 0 && course.enrollmentRequests.length === 0
    };

    return createResponse(res, 200, 'Course fetched successfully', { course: courseWithDetails });
  } catch (error) {
    console.error('Error fetching course:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course');
  }
};

/**
 * Create a new course
 * POST /api/admin/courses
 */
export const createCourse = async (req, res) => {
  try {
    const courseData = req.body;

    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.type) {
      return createErrorResponse(res, 400, 'Title, description, and type are required');
    }

    // Validate type
    if (!['live', 'finished'].includes(courseData.type)) {
      return createErrorResponse(res, 400, 'Type must be either "live" or "finished"');
    }

    // Handle file upload
    if (req.file) {
      courseData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    // Convert price to float if present
    if (courseData.price) {
      courseData.price = parseFloat(courseData.price);
    }

    const course = await Prisma.course.create({
      data: courseData
    });

    // Convert BigInt to string for JSON serialization
    const courseResponse = {
      id: course.id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      type: course.type,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt
    };

    return createResponse(res, 201, 'Course created successfully', { course: courseResponse });
  } catch (error) {
    console.error('Error creating course:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A course with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to create course');
  }
};

/**
 * Update a course
 * PUT /api/admin/courses/:id
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...updateData } = req.body; // Strip status from update data

    // Check if course exists and is not deleted
    const existingCourse = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      }
    });

    if (!existingCourse) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Handle file upload
    if (req.file) {
      updateData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    // Convert price to float if present
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    const course = await Prisma.course.update({
      where: { id: BigInt(id) },
      data: updateData // Status is now excluded
    });

    // Convert BigInt to string for JSON serialization
    const courseResponse = {
      id: course.id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      type: course.type,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt
    };

    return createResponse(res, 200, 'Course updated successfully', { course: courseResponse });
  } catch (error) {
    console.error('Error updating course:', error);

    if (error.code === 'P2002') {
      return createErrorResponse(res, 400, 'A course with this title already exists');
    }

    return createErrorResponse(res, 500, 'Failed to update course');
  }
};

/**
 * Delete a course (soft delete with enrollment check)
 * DELETE /api/admin/courses/:id
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists and get enrollment information
    const course = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      },
      include: {
        enrollments: {
          where: { status: 'active' },
          select: { id: true }
        },
        enrollmentRequests: {
          where: { status: 'pending' },
          select: { id: true }
        }
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Check if course has active enrollments or pending requests
    if (course.enrollments.length > 0) {
      return createErrorResponse(res, 400,
        `Cannot delete course. It has ${course.enrollments.length} active enrollment(s)`
      );
    }

    if (course.enrollmentRequests.length > 0) {
      return createErrorResponse(res, 400,
        `Cannot delete course. It has ${course.enrollmentRequests.length} pending enrollment request(s)`
      );
    }

    // Soft delete the course
    await Prisma.course.update({
      where: { id: BigInt(id) },
      data: {
        deletedAt: new Date(),
        status: 'archived' // Archive when deleted
      }
    });

    return createResponse(res, 200, 'Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);
    return createErrorResponse(res, 500, 'Failed to delete course');
  }
};

/**
 * Update course status
 * PATCH /api/admin/courses/:id/status
 */
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if course exists
    const existingCourse = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      }
    });

    if (!existingCourse) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Validate status transition logic
    const validTransitions = {
      'draft': ['published', 'archived'],
      'published': ['archived'],
      'archived': ['published'] // Allow republishing archived courses
    };

    const currentStatus = existingCourse.status;
    if (!validTransitions[currentStatus]?.includes(status)) {
      return createErrorResponse(res, 400, `Cannot change status from "${currentStatus}" to "${status}"`);
    }

    // Update the status
    const updatedCourse = await Prisma.course.update({
      where: { id: BigInt(id) },
      data: { status }
    });

    // Convert BigInt to string for JSON serialization
    const courseResponse = {
      id: updatedCourse.id.toString(),
      title: updatedCourse.title,
      status: updatedCourse.status,
      type: updatedCourse.type,
      createdAt: updatedCourse.createdAt
    };

    return createResponse(res, 200, `Course status updated to ${status}`, { course: courseResponse });
  } catch (error) {
    console.error('Error updating course status:', error);
    return createErrorResponse(res, 500, 'Failed to update course status');
  }
};
/**
 * Get sessions for a specific course (for access window dropdowns)
 * GET /api/admin/courses/:courseId/sessions
 */
export const getCourseSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sortBy = 'date', sortOrder = 'asc' } = req.query;

    const courseIdBigInt = BigInt(courseId);

    // Verify course exists
    const course = await Prisma.course.findUnique({
      where: { id: courseIdBigInt, deletedAt: null },
      select: { id: true, title: true, type: true }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    // Build order clause
    const orderBy = {};
    if (sortBy === 'date') {
      orderBy.date = sortOrder;
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.id = sortOrder;
    }

    // Get sessions for the course
    const sessions = await Prisma.session.findMany({
      where: { courseId: courseIdBigInt },
      select: {
        id: true,
        title: true,
        date: true
      },
      orderBy
    });

    // Transform sessions with proper serialization
    const sessionsResponse = sessions.map(session => ({
      id: session.id.toString(),
      title: session.title || `Session ${session.id}`,
      date: session.date,
      formattedDate: session.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      })
    }));

    return createResponse(res, 200, 'Course sessions fetched successfully', {
      course: {
        id: course.id.toString(),
        title: course.title,
        type: course.type
      },
      sessions: sessionsResponse,
      totalSessions: sessionsResponse.length
    });
  } catch (error) {
    console.error('Error fetching course sessions:', error);
    return createErrorResponse(res, 500, 'Failed to fetch course sessions');
  }
};

/**
 * Assign content (lessons, homework, tests) to a course
 * POST /api/admin/courses/:id/content
 */
export const assignContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, contentIds, dueDates } = req.body;

    if (!type || !contentIds || !Array.isArray(contentIds)) {
      return createErrorResponse(res, 400, 'Invalid request. Expected type and contentIds array');
    }

    // Validate due dates for homework and tests
    if ((type === 'homework' || type === 'tests') && dueDates) {
      for (const contentId of contentIds) {
        if (dueDates[contentId]) {
          const dueDate = new Date(dueDates[contentId]);
          if (isNaN(dueDate.getTime()) || dueDate < new Date()) {
            return createErrorResponse(res, 400, `Invalid due date for ${type} ${contentId}. Date must be in the future.`);
          }
        }
      }
    }

    const validTypes = ['lessons', 'homework', 'tests'];
    if (!validTypes.includes(type)) {
      return createErrorResponse(res, 400, 'Invalid content type. Must be one of: lessons, homework, tests');
    }

    // Check if course exists
    const course = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    const courseId = BigInt(id);

    // Prepare data for creating associations
    let createData = [];

    if (type === 'lessons') {
      // Check if lessons exist
      const lessons = await Prisma.lesson.findMany({
        where: {
          id: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      if (lessons.length !== contentIds.length) {
        return createErrorResponse(res, 400, 'One or more lessons not found');
      }

      // Get existing associations to avoid duplicates
      const existing = await Prisma.courseLesson.findMany({
        where: {
          courseId,
          lessonId: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      const existingLessonIds = existing.map(cl => cl.lessonId.toString());
      const newLessonIds = contentIds.filter(id => !existingLessonIds.includes(id));

      createData = newLessonIds.map((lessonId, index) => ({
        courseId,
        lessonId: BigInt(lessonId),
        order: existing.length + index + 1
      }));

      if (createData.length > 0) {
        await Prisma.courseLesson.createMany({
          data: createData
        });
      }

    } else if (type === 'homework') {
      // Check if homework exists
      const homework = await Prisma.homework.findMany({
        where: {
          id: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      if (homework.length !== contentIds.length) {
        return createErrorResponse(res, 400, 'One or more homework not found');
      }

      // Get existing associations to avoid duplicates
      const existing = await Prisma.courseHomework.findMany({
        where: {
          courseId,
          homeworkId: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      const existingHomeworkIds = existing.map(ch => ch.homeworkId.toString());
      const newHomeworkIds = contentIds.filter(id => !existingHomeworkIds.includes(id));

      createData = newHomeworkIds.map(homeworkId => {
        const dueDate = dueDates && dueDates[homeworkId]
          ? new Date(dueDates[homeworkId])
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days from now

        return {
          courseId,
          homeworkId: BigInt(homeworkId),
          dueDate
        };
      });

      if (createData.length > 0) {
        await Prisma.courseHomework.createMany({
          data: createData
        });
      }

    } else if (type === 'tests') {
      // Check if tests exist
      const tests = await Prisma.test.findMany({
        where: {
          id: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      if (tests.length !== contentIds.length) {
        return createErrorResponse(res, 400, 'One or more tests not found');
      }

      // Get existing associations to avoid duplicates
      const existing = await Prisma.courseTest.findMany({
        where: {
          courseId,
          testId: { in: contentIds.map(id => BigInt(id)) }
        }
      });

      const existingTestIds = existing.map(ct => ct.testId.toString());
      const newTestIds = contentIds.filter(id => !existingTestIds.includes(id));

      createData = newTestIds.map(testId => {
        const dueDate = dueDates && dueDates[testId]
          ? new Date(dueDates[testId])
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Default: 14 days from now

        return {
          courseId,
          testId: BigInt(testId),
          dueDate
        };
      });

      if (createData.length > 0) {
        await Prisma.courseTest.createMany({
          data: createData
        });
      }
    }

    const assignedCount = createData.length;
    const skippedCount = contentIds.length - assignedCount;

    let message = `${assignedCount} ${type} assigned successfully`;
    if (skippedCount > 0) {
      message += ` (${skippedCount} already assigned)`;
    }

    return createResponse(res, 200, message, {
      assigned: assignedCount,
      skipped: skippedCount,
      total: contentIds.length
    });

  } catch (error) {
    console.error('Error assigning content:', error);
    return createErrorResponse(res, 500, 'Failed to assign content');
  }
};

/**
 * Remove content from a course
 * DELETE /api/admin/courses/:id/content/:contentId
 */
export const removeContent = async (req, res) => {
  try {
    const { id, contentId } = req.params;
    const { type } = req.query;

    console.log('Remove content request:', { courseId: id, contentId, type });

    if (!type) {
      return createErrorResponse(res, 400, 'Content type is required as a query parameter');
    }

    const validTypes = ['lesson', 'homework', 'test'];
    if (!validTypes.includes(type)) {
      return createErrorResponse(res, 400, 'Invalid content type. Must be one of: lesson, homework, test');
    }

    // Validate contentId can be converted to BigInt
    try {
      BigInt(contentId);
    } catch (err) {
      console.error('Invalid contentId format:', contentId, err);
      return createErrorResponse(res, 400, `Invalid contentId format: ${contentId}`);
    }

    // Check if course exists
    const course = await Prisma.course.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null
      }
    });

    if (!course) {
      return createErrorResponse(res, 404, 'Course not found');
    }

    const courseIdBigInt = BigInt(id);
    const contentIdBigInt = BigInt(contentId);

    let deleteResult;

    if (type === 'lesson') {
      // First check if the association exists
      const existing = await Prisma.courseLesson.findFirst({
        where: {
          courseId: courseIdBigInt,
          lessonId: contentIdBigInt
        }
      });

      console.log('Existing courseLesson:', existing);

      if (!existing) {
        return createErrorResponse(res, 404, `Lesson ${contentId} not found in course ${id}`);
      }

      deleteResult = await Prisma.courseLesson.deleteMany({
        where: {
          courseId: courseIdBigInt,
          lessonId: contentIdBigInt
        }
      });
    } else if (type === 'homework') {
      // First check if the association exists
      const existing = await Prisma.courseHomework.findFirst({
        where: {
          courseId: courseIdBigInt,
          homeworkId: contentIdBigInt
        }
      });

      console.log('Existing courseHomework:', existing);

      if (!existing) {
        return createErrorResponse(res, 404, `Homework ${contentId} not found in course ${id}`);
      }

      deleteResult = await Prisma.courseHomework.deleteMany({
        where: {
          courseId: courseIdBigInt,
          homeworkId: contentIdBigInt
        }
      });
    } else if (type === 'test') {
      // First check if the association exists
      const existing = await Prisma.courseTest.findFirst({
        where: {
          courseId: courseIdBigInt,
          testId: contentIdBigInt
        }
      });

      console.log('Existing courseTest:', existing);

      if (!existing) {
        return createErrorResponse(res, 404, `Test ${contentId} not found in course ${id}`);
      }

      deleteResult = await Prisma.courseTest.deleteMany({
        where: {
          courseId: courseIdBigInt,
          testId: contentIdBigInt
        }
      });
    }

    console.log('Delete result:', deleteResult);

    if (deleteResult.count === 0) {
      return createErrorResponse(res, 404, `${type} not found in this course`);
    }

    return createResponse(res, 200, `${type} removed from course successfully`);

  } catch (error) {
    console.error('Error removing content:', error);
    return createErrorResponse(res, 500, 'Failed to remove content');
  }
};
