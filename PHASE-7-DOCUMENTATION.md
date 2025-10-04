# Phase 7: Assessment System - Complete Documentation

## Overview
Phase 7 implements a comprehensive assessment system for creating, managing, and delivering homework and tests. The system includes:
- **Admin Builder Interfaces**: Rich UI for creating homework and tests with passages, questions, and choices
- **Backend APIs**: Full CRUD operations with validation, nested structure management, and usage tracking
- **Database Integration**: Prisma-based models with proper relationships and cascading deletes
- **SAT-Style Formatting**: Support for passages, questions, and multiple-choice answers

---

## 🎯 Features Implemented

### ✅ Homework System
- Create/Edit/Delete homework with nested structure
- Rich passage editor with optional images
- Question builder with exactly 4 choices per question
- Validation for correct answer selection
- Usage tracking (which courses use this homework)
- Submission tracking (prevent deletion if students have submitted)

### ✅ Test System
- Create/Edit/Delete tests with nested structure
- Duration field (in minutes) for timed tests
- Rich passage editor with optional images
- Question builder with exactly 4 choices per question
- Validation for correct answer selection
- Usage tracking (which courses use this test)
- Submission tracking (prevent deletion if students have submitted)
- Active attempt monitoring

---

## 📊 Database Schema

### Homework Models
```prisma
model Homework {
  id          BigInt             @id @default(autoincrement())
  title       String             @db.VarChar(255)
  instructions String?           @db.Text
  passages    HomeworkPassage[]
  courseHomeworks CourseHomework[]
  submissions HomeworkSubmission[]
  createdAt   DateTime           @default(now())
}

model HomeworkPassage {
  id         BigInt              @id @default(autoincrement())
  homeworkId BigInt
  homework   Homework            @relation(fields: [homeworkId], references: [id], onDelete: Cascade)
  title      String?             @db.VarChar(255)
  content    String              @db.Text
  imageURL   String?             @db.VarChar(500)
  order      Int                 @default(1)
  questions  HomeworkQuestion[]
}

model HomeworkQuestion {
  id           BigInt           @id @default(autoincrement())
  passageId    BigInt
  passage      HomeworkPassage  @relation(fields: [passageId], references: [id], onDelete: Cascade)
  questionText String           @db.Text
  order        Int              @default(1)
  choices      QuestionChoice[]
}

model QuestionChoice {
  id         BigInt           @id @default(autoincrement())
  questionId BigInt
  question   HomeworkQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  choiceText String           @db.VarChar(500)
  isCorrect  Boolean          @default(false)
  order      Int              @default(1)
}
```

### Test Models
```prisma
model Test {
  id          BigInt          @id @default(autoincrement())
  title       String          @db.VarChar(255)
  instructions String?        @db.Text
  duration    Int             // Duration in minutes
  passages    TestPassage[]
  courseTests CourseTest[]
  submissions TestSubmission[]
  createdAt   DateTime        @default(now())
}

model TestPassage {
  id        BigInt         @id @default(autoincrement())
  testId    BigInt
  test      Test           @relation(fields: [testId], references: [id], onDelete: Cascade)
  title     String?        @db.VarChar(255)
  content   String         @db.Text
  imageURL  String?        @db.VarChar(500)
  order     Int            @default(1)
  questions TestQuestion[]
}

model TestQuestion {
  id           BigInt              @id @default(autoincrement())
  passageId    BigInt
  passage      TestPassage         @relation(fields: [passageId], references: [id], onDelete: Cascade)
  questionText String              @db.Text
  order        Int                 @default(1)
  choices      TestQuestionChoice[]
}

model TestQuestionChoice {
  id         BigInt       @id @default(autoincrement())
  questionId BigInt
  question   TestQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  choiceText String       @db.VarChar(500)
  isCorrect  Boolean      @default(false)
  order      Int          @default(1)
}
```

---

## 🔌 API Endpoints

### Homework Endpoints

#### Get All Homework
```http
GET /api/admin/homework
```

**Query Parameters:**
- `search` (optional): Search by title
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page
- `sortBy` (default: 'createdAt'): Sort field ('title' | 'createdAt')
- `sortOrder` (default: 'desc'): Sort order ('asc' | 'desc')

**Response:**
```json
{
  "success": true,
  "message": "Homework fetched successfully",
  "data": {
    "homework": [
      {
        "id": "1",
        "title": "Reading Comprehension - Chapter 1",
        "instructions": "Answer all questions based on the passage",
        "createdAt": "2025-01-15T10:30:00Z",
        "passageCount": 2,
        "usageCount": 3,
        "submissionCount": 45,
        "usedInCourses": [
          {
            "id": "5",
            "title": "SAT Reading Course",
            "status": "published"
          }
        ],
        "canDelete": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### Get Homework by ID
```http
GET /api/admin/homework/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Homework fetched successfully",
  "data": {
    "homework": {
      "id": "1",
      "title": "Reading Comprehension - Chapter 1",
      "instructions": "Answer all questions based on the passage",
      "createdAt": "2025-01-15T10:30:00Z",
      "passages": [
        {
          "id": "1",
          "title": "Passage 1: The American Dream",
          "content": "The concept of the American Dream...",
          "imageURL": null,
          "order": 1,
          "questions": [
            {
              "id": "1",
              "questionText": "What is the main idea of this passage?",
              "order": 1,
              "choices": [
                {
                  "id": "1",
                  "choiceText": "The American Dream is attainable",
                  "isCorrect": true,
                  "order": 1
                },
                {
                  "id": "2",
                  "choiceText": "The American Dream is a myth",
                  "isCorrect": false,
                  "order": 2
                },
                {
                  "id": "3",
                  "choiceText": "The American Dream has evolved",
                  "isCorrect": false,
                  "order": 3
                },
                {
                  "id": "4",
                  "choiceText": "The American Dream is outdated",
                  "isCorrect": false,
                  "order": 4
                }
              ]
            }
          ]
        }
      ],
      "usageCount": 3,
      "submissionCount": 45,
      "usedInCourses": [],
      "canDelete": false
    }
  }
}
```

#### Create Homework
```http
POST /api/admin/homework
```

**Request Body:**
```json
{
  "title": "Reading Comprehension - Chapter 1",
  "instructions": "Answer all questions based on the passage",
  "passages": [
    {
      "title": "Passage 1: The American Dream",
      "content": "The concept of the American Dream has been a cornerstone...",
      "imageURL": "https://example.com/image.jpg",
      "order": 1,
      "questions": [
        {
          "questionText": "What is the main idea of this passage?",
          "order": 1,
          "choices": [
            {
              "choiceText": "The American Dream is attainable",
              "isCorrect": true,
              "order": 1
            },
            {
              "choiceText": "The American Dream is a myth",
              "isCorrect": false,
              "order": 2
            },
            {
              "choiceText": "The American Dream has evolved",
              "isCorrect": false,
              "order": 3
            },
            {
              "choiceText": "The American Dream is outdated",
              "isCorrect": false,
              "order": 4
            }
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
- `passages`: Required, at least 1 passage
- `passage.content`: Required, min 10 characters
- `passage.questions`: Required, at least 1 question
- `question.questionText`: Required, 5-1000 characters
- `question.choices`: Required, exactly 4 choices
- **Exactly one choice must be marked as correct**

**Response:**
```json
{
  "success": true,
  "message": "Homework created successfully",
  "data": {
    "homework": {
      "id": "1",
      "title": "Reading Comprehension - Chapter 1",
      "instructions": "Answer all questions based on the passage",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### Update Homework
```http
PUT /api/admin/homework/:id
```

**Request Body:** Same structure as Create, but all fields are optional (at least one required)

**Note:** Updating passages completely replaces the existing structure (cascade delete + recreate)

**Response:**
```json
{
  "success": true,
  "message": "Homework updated successfully",
  "data": {
    "homework": {
      "id": "1",
      "title": "Reading Comprehension - Chapter 1 (Updated)",
      "instructions": "Updated instructions",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### Delete Homework
```http
DELETE /api/admin/homework/:id
```

**Validation:**
- Cannot delete if used in any courses
- Cannot delete if students have submitted

**Response:**
```json
{
  "success": true,
  "message": "Homework deleted successfully"
}
```

**Error Response (if blocked):**
```json
{
  "success": false,
  "message": "Cannot delete homework. It is currently used in the following course(s): SAT Reading Course, Advanced Reading"
}
```

---

### Test Endpoints

#### Get All Tests
```http
GET /api/admin/tests
```

**Query Parameters:**
- `search` (optional): Search by title
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page
- `sortBy` (default: 'createdAt'): Sort field ('title' | 'createdAt' | 'duration')
- `sortOrder` (default: 'desc'): Sort order ('asc' | 'desc')

**Response:** Same structure as homework list, with added `duration` field

#### Get Test by ID
```http
GET /api/admin/tests/:id
```

**Response:** Same structure as homework detail, with added `duration` field

#### Create Test
```http
POST /api/admin/tests
```

**Request Body:**
```json
{
  "title": "SAT Practice Test 1",
  "instructions": "Complete all questions within the time limit",
  "duration": 65,
  "passages": [
    // Same structure as homework passages
  ]
}
```

**Additional Validation:**
- `duration`: Required, 1-300 minutes

**Response:**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "test": {
      "id": "1",
      "title": "SAT Practice Test 1",
      "instructions": "Complete all questions within the time limit",
      "duration": 65,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### Update Test
```http
PUT /api/admin/tests/:id
```

**Request Body:** Same structure as Create, all fields optional (at least one required)

#### Delete Test
```http
DELETE /api/admin/tests/:id
```

**Validation:** Same as homework delete

#### Get Test Attempts
```http
GET /api/admin/tests/:id/attempts
```

**Response:**
```json
{
  "success": true,
  "message": "Test attempts fetched successfully",
  "data": {
    "test": {
      "id": "1",
      "title": "SAT Practice Test 1",
      "duration": 65
    },
    "attempts": [
      {
        "id": "12",
        "studentId": "34",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "submittedAt": "2025-01-15T14:30:00Z",
        "score": 45
      }
    ],
    "attemptCount": 1
  }
}
```

---

## 🎨 Frontend Implementation

### Components Structure

```
client/src/components/admin/
├── homework/
│   ├── HomeworkBuilder.jsx      # Main container component
│   ├── HomeworkList.jsx          # List view with search/filter
│   └── HomeworkEditor.jsx        # Create/Edit form
└── tests/
    ├── TestBuilder.jsx           # Main container component
    ├── TestList.jsx              # List view with search/filter
    ├── TestEditor.jsx            # Create/Edit form
    └── TestPreview.jsx           # Preview test before saving
```

### HomeworkBuilder Component

**State Management:**
```jsx
const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
const [selectedHomework, setSelectedHomework] = useState(null)
const [homework, setHomework] = useState([])
const [loading, setLoading] = useState(false)
```

**Key Features:**
- Automatic data loading on mount and view change
- Error handling with toast notifications
- Lazy loading of full homework data when editing
- Delete confirmation and validation

### HomeworkEditor Component

**Features:**
- Rich text editor for passage content
- Image URL support for passages
- Dynamic question and choice management
- Drag-and-drop reordering (if implemented)
- Real-time validation
- Save/Cancel actions
- Auto-save (if implemented)

**Form Structure:**
```jsx
{
  title: "",
  instructions: "",
  passages: [
    {
      title: "",
      content: "",
      imageURL: "",
      order: 1,
      questions: [
        {
          questionText: "",
          order: 1,
          choices: [
            { choiceText: "", isCorrect: false, order: 1 },
            { choiceText: "", isCorrect: false, order: 2 },
            { choiceText: "", isCorrect: false, order: 3 },
            { choiceText: "", isCorrect: false, order: 4 }
          ]
        }
      ]
    }
  ]
}
```

### TestBuilder Component

**Same structure as HomeworkBuilder, with additional:**
- Duration field (number input, 1-300 minutes)
- Timer display in preview
- Active attempt monitoring

---

## 🔧 Backend Implementation

### Controller Logic

**Transaction Management:**
All create/update operations use Prisma transactions to ensure data consistency:
```javascript
await Prisma.$transaction(async (tx) => {
  // 1. Create/Update main entity
  // 2. Delete old nested data (on update)
  // 3. Create new nested data
}, {
  maxWait: 15000,  // 15 seconds
  timeout: 20000   // 20 seconds
})
```

**BigInt Handling:**
All IDs are converted to strings in responses to prevent JSON serialization issues:
```javascript
id: homework.id.toString()
```

**Cascade Deletes:**
Deleting a passage automatically deletes its questions and choices (defined in Prisma schema)

### Validation Layers

**1. Joi Schema Validation** (Request validation)
- Type checking
- Length constraints
- Required fields
- Format validation

**2. Business Logic Validation** (utils/validation.utils.js)
```javascript
export const validateHomeworkStructure = (data) => {
  const errors = [];

  // Must have at least one passage
  if (!data.passages || data.passages.length === 0) {
    errors.push('Homework must have at least one passage');
  }

  // Each passage must have questions
  data.passages?.forEach((passage, index) => {
    if (!passage.questions || passage.questions.length === 0) {
      errors.push(`Passage ${index + 1} must have at least one question`);
    }

    // Each question must have exactly 4 choices with one correct
    passage.questions?.forEach((question, qIndex) => {
      if (!question.choices || question.choices.length !== 4) {
        errors.push(`Question ${qIndex + 1} in passage ${index + 1} must have exactly 4 choices`);
      }

      const correctCount = question.choices?.filter(c => c.isCorrect).length;
      if (correctCount !== 1) {
        errors.push(`Question ${qIndex + 1} in passage ${index + 1} must have exactly one correct answer`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

**3. Database Constraints**
- Foreign key constraints
- Cascade rules
- Index optimization

---

## 🧪 Testing

### Test Files Created
- `server/tests/phase7-assessment-endpoints.test.js`
- `server/tests/comprehensive-api-tests.spec.js`
- `server/tests/targeted-api-tests.spec.js`
- `server/tests/final-validation-tests.spec.js`

### Test Coverage
✅ Create homework with nested structure
✅ Get all homework with pagination
✅ Get homework by ID with full structure
✅ Update homework (metadata only)
✅ Update homework with passages (full replace)
✅ Delete homework (with usage validation)
✅ Create test with duration
✅ Get all tests with pagination
✅ Get test by ID with full structure
✅ Update test
✅ Delete test
✅ Get test attempts
✅ Validation error handling
✅ BigInt serialization

---

## 📋 Validation Rules Summary

### Homework Validation
| Field | Rules |
|-------|-------|
| title | Required, 3-255 chars |
| instructions | Optional, max 2000 chars |
| passages | Required, min 1 |
| passage.content | Required, min 10 chars |
| passage.title | Optional, max 255 chars |
| passage.imageURL | Optional, valid URI |
| passage.questions | Required, min 1 |
| question.questionText | Required, 5-1000 chars |
| question.choices | Required, exactly 4 |
| choice.choiceText | Required, 1-500 chars |
| choice.isCorrect | Required, exactly 1 true per question |

### Test Validation
All homework validation rules **PLUS:**
| Field | Rules |
|-------|-------|
| duration | Required, 1-300 minutes (integer) |

---

## 🚀 Usage Examples

### Creating Homework (Frontend)
```javascript
import { adminService } from '@/services/admin.service'

const createHomework = async () => {
  const homeworkData = {
    title: "Reading Comprehension Practice",
    instructions: "Read each passage and answer the questions",
    passages: [
      {
        title: "The Evolution of Technology",
        content: "Technology has transformed society...",
        imageURL: "",
        order: 1,
        questions: [
          {
            questionText: "What is the main argument of the passage?",
            order: 1,
            choices: [
              { choiceText: "Technology is harmful", isCorrect: false, order: 1 },
              { choiceText: "Technology has improved lives", isCorrect: true, order: 2 },
              { choiceText: "Technology is neutral", isCorrect: false, order: 3 },
              { choiceText: "Technology is inevitable", isCorrect: false, order: 4 }
            ]
          }
        ]
      }
    ]
  }

  try {
    const response = await adminService.createHomework(homeworkData)
    toast.success('Homework created successfully')
    return response.data.data.homework
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create homework')
    throw error
  }
}
```

### Fetching Homework with Filters
```javascript
const fetchHomework = async (page = 1, search = '') => {
  const params = {
    page,
    limit: 20,
    search,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }

  const response = await adminService.getAllHomework(params)
  return response.data.data.homework
}
```

### Deleting with Validation
```javascript
const deleteHomework = async (homeworkId) => {
  try {
    await adminService.deleteHomework(homeworkId)
    toast.success('Homework deleted successfully')
  } catch (error) {
    if (error.response?.status === 400) {
      // Cannot delete - show specific reason
      toast.error(error.response.data.message)
    } else {
      toast.error('Failed to delete homework')
    }
  }
}
```

---

## ⚠️ Important Notes

### BigInt Handling
All database IDs are BigInt type but must be converted to strings for JSON serialization:
```javascript
// ❌ Wrong - causes serialization error
return { id: homework.id }

// ✅ Correct
return { id: homework.id.toString() }
```

### Cascade Deletes
When deleting passages, questions and choices are automatically deleted due to `onDelete: Cascade` in Prisma schema. No need to manually delete children.

### Transaction Timeouts
Large homework/tests with many passages may timeout. Increase transaction timeout if needed:
```javascript
await Prisma.$transaction(async (tx) => {
  // operations
}, {
  maxWait: 15000,  // Increase if needed
  timeout: 20000   // Increase if needed
})
```

### Update Behavior
Updating passages **replaces the entire structure**:
1. Old passages are deleted (cascade handles questions/choices)
2. New passages are created from request body
3. This ensures clean state but means partial updates aren't possible

---

## 🔜 Next Steps (Phase 7D)

### Admin Assessment Creator UI
- [ ] Integrate production-ready rich text editor (Tiptap)
- [ ] Add SAT-style formatting (bold, italic, underline, quotes)
- [ ] Implement passage line-numbering view
- [ ] Add autosave functionality
- [ ] Add media upload support
- [ ] Create full-screen preview mode
- [ ] Add accessibility features (keyboard navigation, ARIA labels)

### Integration Tasks
- [ ] Connect homework/tests to CourseBuilder
- [ ] Implement assignment to courses (CourseHomework/CourseTest tables)
- [ ] Add due date management
- [ ] Create student-facing assessment viewer
- [ ] Implement submission system
- [ ] Add auto-grading logic

---

## 📚 Related Files

### Backend
- `server/routes/admin/homework.routes.js`
- `server/routes/admin/tests.routes.js`
- `server/controllers/admin/homework.controller.js`
- `server/controllers/admin/tests.controller.js`
- `server/schemas/homework.schemas.js`
- `server/schemas/test.schemas.js`
- `server/utils/validation.utils.js`
- `server/prisma/schema.prisma`

### Frontend
- `client/src/components/admin/homework/HomeworkBuilder.jsx`
- `client/src/components/admin/homework/HomeworkList.jsx`
- `client/src/components/admin/homework/HomeworkEditor.jsx`
- `client/src/components/admin/tests/TestBuilder.jsx`
- `client/src/components/admin/tests/TestList.jsx`
- `client/src/components/admin/tests/TestEditor.jsx`
- `client/src/components/admin/tests/TestPreview.jsx`
- `client/src/services/admin.service.js`

### Tests
- `server/tests/phase7-assessment-endpoints.test.js`
- `server/tests/comprehensive-api-tests.spec.js`
- `server/tests/targeted-api-tests.spec.js`
- `server/tests/final-validation-tests.spec.js`

---

## ✅ Completion Checklist

- [x] Database schema created with proper relationships
- [x] Prisma migrations applied
- [x] Homework CRUD endpoints implemented
- [x] Test CRUD endpoints implemented
- [x] Joi validation schemas created
- [x] Business logic validation implemented
- [x] BigInt serialization handled
- [x] Cascade delete configured
- [x] Usage tracking implemented
- [x] Submission tracking implemented
- [x] Transaction management implemented
- [x] Error handling implemented
- [x] Frontend list components created
- [x] Frontend editor components created
- [x] Admin service integration
- [x] Toast notifications
- [x] Loading states
- [x] Comprehensive API tests written
- [x] All endpoints tested and validated
- [x] Documentation completed

---

**Phase 7 Status:** ✅ **COMPLETE**

All core assessment management functionality is implemented, tested, and documented. Ready for Phase 7D (Admin UI enhancements) and Phase 8 (Student-facing assessment taking).
