import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, FileText, BarChart3, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const quickActionItems = [
  {
    label: 'New Course',
    href: '/admin/courses/create',
    icon: Plus,
    description: 'Create a new course',
    color: 'text-green-600'
  },
  {
    label: 'Add Lesson',
    href: '/admin/resources',
    icon: FileText,
    description: 'Create new lesson content',
    color: 'text-blue-600'
  },
  {
    label: 'Enrollment Requests',
    href: '/admin/students',
    icon: Users,
    description: 'Review pending requests',
    color: 'text-orange-600',
    badge: '3' // This would come from API
  },
  {
    label: 'Weekly Reports',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Generate student reports',
    color: 'text-purple-600'
  }
]

export default function QuickActions() {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-sat-primary text-sat-primary hover:bg-sat-primary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-sat-primary"
          aria-label="Quick actions menu"
        >
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-base font-semibold">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {quickActionItems.map((item, index) => {
          const IconComponent = item.icon

          return (
            <DropdownMenuItem key={index} asChild className="cursor-pointer">
              <Link
                to={item.href}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 focus:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <div className={`p-2 rounded-lg bg-gray-100 ${item.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {item.description}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            to="/admin"
            className="flex items-center justify-center p-2 text-sm text-sat-primary hover:text-sat-primary/80"
            onClick={() => setOpen(false)}
          >
            View Dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}