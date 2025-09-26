import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ChevronRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Route configuration for breadcrumb generation
const routeConfig = {
  '/admin': {
    label: 'Dashboard',
    icon: Home
  },
  '/admin/courses': {
    label: 'Courses',
    parent: '/admin'
  },
  '/admin/courses/new': {
    label: 'New Course',
    parent: '/admin/courses'
  },
  '/admin/courses/edit': {
    label: 'Edit Course',
    parent: '/admin/courses'
  },
  '/admin/resources': {
    label: 'Resources',
    parent: '/admin'
  },
  '/admin/resources/lessons': {
    label: 'Lessons',
    parent: '/admin/resources'
  },
  '/admin/resources/homework': {
    label: 'Homework',
    parent: '/admin/resources'
  },
  '/admin/resources/tests': {
    label: 'Tests',
    parent: '/admin/resources'
  },
  '/admin/students': {
    label: 'Students',
    parent: '/admin'
  },
  '/admin/students/enrollment-requests': {
    label: 'Enrollment Requests',
    parent: '/admin/students'
  },
  '/admin/reports': {
    label: 'Reports & Analytics',
    parent: '/admin'
  },
  '/admin/settings': {
    label: 'Settings',
    parent: '/admin'
  }
}

// Helper function to generate breadcrumb items from current path
const generateBreadcrumbs = (pathname) => {
  const breadcrumbs = []

  // Handle dynamic routes (e.g., /admin/courses/123)
  let currentPath = pathname

  // Check if it's a dynamic route and map to static route config
  const pathSegments = pathname.split('/').filter(Boolean)

  if (pathSegments.length > 2) {
    // Check for patterns like /admin/courses/[id]
    if (pathSegments[1] === 'courses' && pathSegments[2] && !['new', 'edit'].includes(pathSegments[2])) {
      // It's a course detail page
      breadcrumbs.push({ path: '/admin', ...routeConfig['/admin'] })
      breadcrumbs.push({ path: '/admin/courses', ...routeConfig['/admin/courses'] })
      breadcrumbs.push({
        path: pathname,
        label: 'Course Details',
        parent: '/admin/courses'
      })
      return breadcrumbs
    }

    // Check for patterns like /admin/students/[id]
    if (pathSegments[1] === 'students' && pathSegments[2] && pathSegments[2] !== 'enrollment-requests') {
      breadcrumbs.push({ path: '/admin', ...routeConfig['/admin'] })
      breadcrumbs.push({ path: '/admin/students', ...routeConfig['/admin/students'] })
      breadcrumbs.push({
        path: pathname,
        label: 'Student Profile',
        parent: '/admin/students'
      })
      return breadcrumbs
    }
  }

  // Build breadcrumbs from route config
  while (currentPath && routeConfig[currentPath]) {
    const route = routeConfig[currentPath]
    breadcrumbs.unshift({
      path: currentPath,
      ...route
    })
    currentPath = route.parent
  }

  return breadcrumbs
}

export default function AdminBreadcrumb() {
  const location = useLocation()

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(location.pathname)
  }, [location.pathname])

  // Don't show breadcrumbs on dashboard
  if (location.pathname === '/admin' || breadcrumbs.length <= 1) {
    return null
  }

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            const IconComponent = breadcrumb.icon

            return (
              <div key={breadcrumb.path} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={breadcrumb.path}
                        className="flex items-center gap-1 hover:text-sat-primary transition-colors"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}