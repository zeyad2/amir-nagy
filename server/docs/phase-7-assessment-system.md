# Phase 7: Assessment System - Complete API Documentation

## Overview
The Assessment System provides a unified API for creating, managing, and taking assessments (tests and homework). It supports both timed assessments (with duration limits) and untimed assessments, with automatic grading and detailed submission tracking.

## Table of Contents
1. [Admin Endpoints](#admin-endpoints)
2. [Student Endpoints](#student-endpoints)
3. [Data Models](#data-models)
4. [Auto-Grading Logic](#auto-grading-logic)
5. [Authentication & Authorization](#authentication--authorization)
6. [Testing Results](#testing-results)

---

## Admin Endpoints

All admin endpoints require authentication and admin role.

### 1. Create Assessment
**POST** `/api/admin/assessments`

Creates a new assessment with nested passages, questions, and choices.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "SAT Reading Practice Test 1",
  "instructions": "Read the passage carefully and answer all questions",
  "duration": 60,
  "passages": [
    {
      "title": "The History of Space Exploration",
      "content": "Space exploration has been one of humanity's greatest achievements...",
      "imageURL": "https://example.com/image.jpg",
      "order": 0,
      "questions": [
        {
          "questionText": "What is the main idea of this passage?",
          "order": 0,
          "choices": [
            { "choiceText": "Space is big", "isCorrect": false, "order": 0 },
            { "choiceText": "Space exploration is important", "isCorrect": true, "order": 1 },
            { "choiceText": "Rockets are fast", "isCorrect": false, "order": 2 },
            { "choiceText": "NASA was founded", "isCorrect": false, "order": 3 }
          ]
        }
      ]
    }
  ]
}
```

**Validation Rules:**
- `title`: Required, 3-255 characters
- `instructions`: Optional, max 2000 characters
- `duration`: Optional (null for untimed), 1-480 minutes
- `passages`: Required, min 1 passage
- `questions`: Required, min 1 question per passage
- `choices`: Required, exactly 4 choices per question
- **Important:** Exactly ONE choice must have `isCorrect: true`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Assessment created successfully",
  "data": {
    "id": "1",
    "title": "SAT Reading Practice Test 1",
    "instructions": "Read the passage carefully...",
    "duration": 60,
    "type": "timed",
    "createdAt": "2025-09-30T10:00:00.000Z",
    "passages": [...]
  }
}
```

---

### 2. Get All Assessments
**GET** `/api/admin/assessments`

Retrieve all assessments with pagination, filtering, and usage information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search by title (case-insensitive) |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (1-100) |
| `sortBy` | string | createdAt | Sort field: `createdAt`, `title`, `duration` |
| `sortOrder` | string | desc | Sort order: `asc` or `desc` |
| `type` | string | all | Filter by type: `timed`, `untimed`, `all` |

**Example:**
```
GET /api/admin/assessments?type=timed&page=1&limit=10&sortBy=title&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessments fetched successfully",
  "data": {
    "assessments": [
      {
        "id": "1",
        "title": "SAT Reading Practice Test 1",
        "instructions": "Read the passage carefully...",
        "duration": 60,
        "type": "timed",
        "createdAt": "2025-09-30T10:00:00.000Z",
        "passageCount": 2,
        "usageCount": 3,
        "submissionCount": 15,
        "usedInCourses": [
          { "id": "5", "title": "SAT Prep Course", "status": "published" }
        ],
        "canDelete": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 3. Get Assessment By ID
**GET** `/api/admin/assessments/:id`

Retrieve complete assessment structure including all passages, questions, and choices with correct answers.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment fetched successfully",
  "data": {
    "id": "1",
    "title": "SAT Reading Practice Test 1",
    "duration": 60,
    "type": "timed",
    "passages": [
      {
        "id": "1",
        "title": "The History of Space Exploration",
        "content": "Space exploration...",
        "imageURL": null,
        "order": 0,
        "questions": [
          {
            "id": "1",
            "questionText": "What is the main idea?",
            "order": 0,
            "choices": [
              {
                "id": "1",
                "choiceText": "Space is big",
                "isCorrect": false,
                "order": 0
              },
              {
                "id": "2",
                "choiceText": "Space exploration is important",
                "isCorrect": true,
                "order": 1
              }
            ]
          }
        ]
      }
    ],
    "usageCount": 3,
    "submissionCount": 15,
    "canDelete": false
  }
}
```

---

### 4. Update Assessment
**PUT** `/api/admin/assessments/:id`

Update an existing assessment. **Note:** Cannot update assessments that have submissions.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "SAT Reading Practice Test 1 (Updated)",
  "duration": 65,
  "passages": [...]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment updated successfully",
  "data": {
    "id": "1",
    "title": "SAT Reading Practice Test 1 (Updated)",
    "duration": 65,
    ...
  }
}
```

**Response (400 Bad Request) - If has submissions:**
```json
{
  "success": false,
  "message": "Cannot update assessment that has submissions. Create a new version instead."
}
```

---

### 5. Delete Assessment
**DELETE** `/api/admin/assessments/:id`

Delete an assessment. **Note:** Cannot delete assessments assigned to courses or with submissions.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment deleted successfully",
  "data": {
    "id": "1",
    "title": "SAT Reading Practice Test 1"
  }
}
```

**Response (400 Bad Request) - If used in courses:**
```json
{
  "success": false,
  "message": "Cannot delete assessment. It is assigned to 3 course(s)."
}
```

**Response (400 Bad Request) - If has submissions:**
```json
{
  "success": false,
  "message": "Cannot delete assessment. It has 15 submission(s)."
}
```

---

### 6. Get Assessment Submissions
**GET** `/api/admin/assessments/:id/submissions`

Get all student submissions for a specific assessment.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment submissions fetched successfully",
  "data": {
    "assessment": {
      "id": "1",
      "title": "SAT Reading Practice Test 1"
    },
    "submissions": [
      {
        "id": "45",
        "studentId": "12",
        "studentName": "John Michael Doe",
        "score": 18,
        "submittedAt": "2025-09-30T11:30:00.000Z"
      }
    ],
    "totalSubmissions": 15
  }
}
```

---

## Student Endpoints

All student endpoints require authentication and student role.

### 1. Start Assessment Attempt
**POST** `/api/student/assessments/:id/attempt`

Start an assessment attempt. Returns the assessment structure **without correct answers**.

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Assessment attempt started successfully",
  "data": {
    "assessment": {
      "id": "1",
      "title": "SAT Reading Practice Test 1",
      "instructions": "Read the passage carefully...",
      "duration": 60,
      "type": "timed",
      "passages": [
        {
          "id": "1",
          "title": "The History of Space Exploration",
          "content": "Space exploration...",
          "order": 0,
          "questions": [
            {
              "id": "1",
              "questionText": "What is the main idea?",
              "order": 0,
              "choices": [
                {
                  "id": "1",
                  "choiceText": "Space is big",
                  "order": 0
                  // NOTE: isCorrect is NOT included in student view
                },
                {
                  "id": "2",
                  "choiceText": "Space exploration is important",
                  "order": 1
                }
              ]
            }
          ]
        }
      ],
      "totalQuestions": 10
    },
    "startedAt": "2025-09-30T12:00:00.000Z",
    "message": "You have 60 minutes to complete this assessment"
  }
}
```

**Response (400 Bad Request) - If already submitted:**
```json
{
  "success": false,
  "message": "You have already submitted this assessment. Each assessment can only be attempted once."
}
```

---

### 2. Get Assessment Attempt Status
**GET** `/api/student/assessments/:id/attempt`

Check if student has already submitted the assessment.

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK) - Not started:**
```json
{
  "success": true,
  "message": "Assessment not yet attempted",
  "data": {
    "status": "not_started",
    "assessment": {
      "id": "1",
      "title": "SAT Reading Practice Test 1",
      "duration": 60
    }
  }
}
```

**Response (200 OK) - Already submitted:**
```json
{
  "success": true,
  "message": "Assessment already submitted",
  "data": {
    "status": "submitted",
    "submittedAt": "2025-09-30T12:45:00.000Z",
    "score": 18,
    "submissionId": "45"
  }
}
```

---

### 3. Submit Assessment
**POST** `/api/student/assessments/:id/submit`

Submit answers for grading. Can only be submitted once per student.

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": [
    { "questionId": "1", "choiceId": "2" },
    { "questionId": "2", "choiceId": "5" },
    { "questionId": "3", "choiceId": null }
  ]
}
```

**Notes:**
- `choiceId` can be `null` for unanswered questions
- All questions will be graded, even if unanswered (unanswered = incorrect)
- Grading is automatic based on `isCorrect` flag in choices

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "submissionId": "45",
    "score": 18,
    "totalQuestions": 20,
    "percentage": "90.00",
    "submittedAt": "2025-09-30T12:45:00.000Z",
    "message": "You scored 18 out of 20 (90.00%)"
  }
}
```

**Response (400 Bad Request) - If already submitted:**
```json
{
  "success": false,
  "message": "Assessment already submitted. Each assessment can only be attempted once."
}
```

---

### 4. Get Submission Details
**GET** `/api/student/assessments/:id/submission`

Get detailed submission results with question-by-question breakdown including correct answers.

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission details fetched successfully",
  "data": {
    "id": "45",
    "assessmentId": "1",
    "assessmentTitle": "SAT Reading Practice Test 1",
    "score": 18,
    "totalQuestions": 20,
    "percentage": "90.00",
    "submittedAt": "2025-09-30T12:45:00.000Z",
    "answers": [
      {
        "questionId": "1",
        "questionText": "What is the main idea?",
        "selectedChoiceId": "2",
        "selectedChoiceText": "Space exploration is important",
        "isCorrect": true,
        "allChoices": [
          {
            "id": "1",
            "text": "Space is big",
            "isCorrect": false,
            "isSelected": false
          },
          {
            "id": "2",
            "text": "Space exploration is important",
            "isCorrect": true,
            "isSelected": true
          }
        ]
      }
    ]
  }
}
```

**Response (404 Not Found) - If not submitted:**
```json
{
  "success": false,
  "message": "Submission not found. You have not submitted this assessment yet."
}
```

---

## Data Models

### Assessment (Test Table)
```
Test {
  id: BigInt (PK)
  title: String
  instructions: String?
  duration: Int? (minutes, null for untimed)
  createdAt: DateTime

  passages: TestPassage[]
  submissions: TestSubmission[]
  courseTests: CourseTest[]
}
```

### Test Passage
```
TestPassage {
  id: BigInt (PK)
  testId: BigInt (FK)
  title: String?
  content: String
  imageURL: String?
  order: Int?

  questions: TestQuestion[]
}
```

### Test Question
```
TestQuestion {
  id: BigInt (PK)
  passageId: BigInt (FK)
  questionText: String
  order: Int?

  choices: TestQuestionChoice[]
  answers: TestAnswer[]
}
```

### Test Question Choice
```
TestQuestionChoice {
  id: BigInt (PK)
  questionId: BigInt (FK)
  choiceText: String
  isCorrect: Boolean
  order: Int?
}
```

### Test Submission
```
TestSubmission {
  id: BigInt (PK)
  testId: BigInt (FK)
  studentId: BigInt (FK)
  score: Int
  submittedAt: DateTime

  answers: TestAnswer[]

  UNIQUE(testId, studentId) - One submission per student per test
}
```

### Test Answer
```
TestAnswer {
  id: BigInt (PK)
  submissionId: BigInt (FK)
  questionId: BigInt (FK)
  choiceId: BigInt? (FK, null if unanswered)
  isCorrect: Boolean?
}
```

---

## Auto-Grading Logic

The grading system automatically calculates scores based on student answers:

### Algorithm

1. **Build Question Map:** Create a mapping of all questions with their correct choice IDs
2. **Build Answer Map:** Create a mapping of student answers
3. **Compare & Grade:** For each question:
   - If student's `choiceId` matches the correct `choiceId`: `isCorrect = true`, increment score
   - If no match or `choiceId` is null: `isCorrect = false`
4. **Calculate Score:** Total correct answers / Total questions

### Example

Assessment has 3 questions:
- Q1: Correct choice = C2
- Q2: Correct choice = C5
- Q3: Correct choice = C9

Student answers:
- Q1: C2 → ✅ Correct (score++)
- Q2: C3 → ❌ Incorrect
- Q3: null → ❌ Unanswered

**Final Score: 1/3 (33.33%)**

### Implementation

The auto-grading logic is implemented in `/server/utils/grading.utils.js`:

```javascript
export const calculateAssessmentScore = (assessment, studentAnswers) => {
  // Build question map with correct answers
  const questionMap = new Map();
  assessment.passages.forEach(passage => {
    passage.questions.forEach(question => {
      const correctChoice = question.choices.find(c => c.isCorrect);
      questionMap.set(question.id.toString(), {
        questionId: question.id,
        correctChoiceId: correctChoice?.id || null
      });
    });
  });

  // Build student answer map
  const answerMap = new Map();
  studentAnswers.forEach(answer => {
    answerMap.set(answer.questionId.toString(), answer.choiceId?.toString() || null);
  });

  // Grade each question
  let score = 0;
  const answerRecords = [];

  questionMap.forEach((questionData, questionIdStr) => {
    const studentChoiceId = answerMap.get(questionIdStr);
    const correctChoiceId = questionData.correctChoiceId?.toString() || null;
    const isCorrect = studentChoiceId !== null && studentChoiceId === correctChoiceId;

    if (isCorrect) score++;

    answerRecords.push({
      questionId: questionIdStr,
      choiceId: studentChoiceId,
      isCorrect
    });
  });

  return { score, totalQuestions: questionMap.size, answerRecords };
};
```

---

## Authentication & Authorization

### Admin Endpoints
- Require valid JWT token with `role: admin`
- Applied via middleware chain: `requireUser` → `requireAdmin`
- Unauthorized access returns `403 Forbidden`

### Student Endpoints
- Require valid JWT token with `role: student`
- Applied via middleware chain: `requireUser` → `requireStudent`
- Unauthorized access returns `403 Forbidden`

### Token Format
```
Authorization: Bearer <jwt_token>
```

---

## Testing Results

### Test Summary
✅ **100% Success Rate** (15/15 tests passed)

### Tests Conducted

1. ✅ Admin Login
2. ✅ Create Assessment
3. ✅ Get All Assessments
4. ✅ Get Assessment By ID
5. ✅ Filter Assessments by Type
6. ✅ Create Student Account
7. ✅ Student Start Assessment Attempt
8. ✅ Get Assessment Attempt Status
9. ✅ Submit Assessment Answers
10. ✅ Get Submission Details
11. ✅ Try Duplicate Submission (correctly blocked)
12. ✅ Get Assessment Submissions (Admin)
13. ✅ Update Assessment with Submissions (correctly blocked)
14. ✅ Delete Assessment with Submissions (correctly blocked)
15. ✅ Unauthorized Access Test

### Key Validations Verified

- ✓ Correct answers hidden from student view during attempt
- ✓ Auto-grading working correctly (1/2 = 50%)
- ✓ Duplicate submissions blocked
- ✓ Updates blocked when assessment has submissions
- ✓ Deletes blocked when assessment has submissions
- ✓ Authorization working correctly (students blocked from admin endpoints)

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, business logic violation) |
| 401 | Unauthorized (invalid or missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Implementation Notes

### File Structure
```
server/
├── controllers/
│   ├── admin/
│   │   └── assessments.controller.js
│   └── student/
│       └── assessments.controller.js
├── routes/
│   ├── admin/
│   │   └── assessments.routes.js
│   └── student/
│       └── assessments.routes.js
├── schemas/
│   ├── assessment.schemas.js
│   └── student.schemas.js (updated)
├── utils/
│   └── grading.utils.js
└── tests/
    └── phase7-assessment-endpoints.test.js
```

### Subagents Used
- **API Engineer:** For all endpoint implementation and route handling
- **Database Architect:** For Prisma schema understanding and query optimization
- **Integration Test Orchestrator:** For comprehensive testing strategy

### Key Features
1. **Unified Assessment API:** Both tests and homework use the same endpoints
2. **Automatic Grading:** No manual intervention needed
3. **One Submission Per Student:** Enforced at database level with unique constraint
4. **Security:** Correct answers hidden from students during attempt
5. **Data Integrity:** Cannot update/delete assessments with submissions or course assignments

---

## Next Steps

### Phase 7D: Assessment Taking UI
- Create AssessmentViewer component
- Add question navigation
- Implement answer input
- Add progress indicator

### Phase 7E: Assessment Taking UI - Advanced
- Add assessment timer
- Implement auto-save functionality
- Create submission confirmation
- Add review interface

---

**Documentation Last Updated:** September 30, 2025
**Implementation Status:** ✅ Complete and Tested