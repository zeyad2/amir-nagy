# Code Style and Conventions

## General Principles
- **NO TypeScript** - Use JavaScript/JSX only
- **NO unnecessary packages** - Must justify each package installation
- **Follow existing patterns** - Mimic existing code structure and naming
- **NO comments** unless explicitly requested
- **Security first** - Never expose secrets, use proper validation

## JavaScript/JSX Style

### Import/Export Style
```javascript
// Named imports with destructuring
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'

// Default exports
export default ComponentName

// Named exports  
export { ComponentName, helperFunction }
```

### Component Structure (React)
```javascript
// Functional components only
function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue)
  
  useEffect(() => {
    // effect logic
  }, [dependencies])
  
  const handleEvent = () => {
    // handler logic
  }
  
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  )
}

export default ComponentName
```

### Backend API Structure (Express)
```javascript
// Controller pattern
export const controllerName = async (req, res) => {
  try {
    // business logic
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Route pattern  
import express from 'express'
const router = express.Router()

router.get('/endpoint', middlewareFunction, controllerName)
export default router
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (`AdminDashboard.jsx`)
- **Pages**: PascalCase with "Page" suffix (`LoginPage.jsx`)
- **Services**: camelCase with ".service.js" (`auth.service.js`)
- **Utilities**: camelCase (`helpers.js`)
- **Routes**: camelCase with ".routes.js" (`auth.routes.js`)
- **Controllers**: camelCase with ".controller.js" (`admin.controller.js`)

### Variables and Functions
- **camelCase** for variables and functions
- **PascalCase** for React components
- **UPPER_CASE** for constants and environment variables
- **Descriptive names** - avoid abbreviations

### Database (Prisma)
- **PascalCase** for model names (`User`, `Student`, `Course`)
- **camelCase** for field names (`firstName`, `createdAt`)
- **Descriptive** relation names

## CSS/Styling Conventions

### TailwindCSS Usage
- Use utility classes exclusively
- Prefer `className` combinations over custom CSS
- Use shadcn/ui components for consistent UI
- Responsive design with mobile-first approach

### shadcn/ui Integration
- Import components from `@/components/ui/`
- Use provided component APIs and props
- Customize through className prop when needed
- Follow shadcn/ui design system patterns

## Error Handling Patterns

### Frontend
```javascript
// API calls with try/catch
try {
  const response = await api.call()
  // handle success
} catch (error) {
  toast.error(error.message)
  // handle error
}
```

### Backend
```javascript
// Controller error handling
try {
  // business logic
  res.json({ success: true, data })
} catch (error) {
  console.error('Error details:', error)
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  })
}
```

## Validation Patterns

### Frontend (react-hook-form)
```javascript
import { useForm } from 'react-hook-form'

const { register, handleSubmit, formState: { errors } } = useForm()
```

### Backend (Joi)
```javascript
import Joi from 'joi'

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

const { error, value } = schema.validate(req.body)
```

## Security Conventions
- Always use parameterized queries (Prisma handles this)
- Hash passwords with bcrypt/bcryptjs
- Validate ALL inputs on both frontend and backend
- Use JWT with proper expiration
- Never log sensitive information
- Use HTTPS in production
- Implement rate limiting