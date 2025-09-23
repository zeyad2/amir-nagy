import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import Footer from '../common/Footer'
import {
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Menu,
  User,
  LogOut,
  Settings
} from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'Courses',
      href: '/admin/courses',
      icon: BookOpen,
      description: 'Manage courses and curriculum'
    },
    {
      name: 'Resources',
      href: '/admin/resources',
      icon: FileText,
      description: 'Lessons, homework, and tests'
    },
    {
      name: 'Students',
      href: '/admin/students',
      icon: Users,
      description: 'Student management and enrollment'
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      description: 'Analytics and performance reports'
    }
  ]

  const isActiveRoute = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  const SidebarContent = ({ onItemClick = () => {} }) => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <Link
          to="/admin"
          className="flex items-center space-x-2"
          onClick={onItemClick}
        >
          <div className="w-8 h-8 bg-sat-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">SAT Platform</h2>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = isActiveRoute(item.href)
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-sat-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-sat-primary'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-sat-primary'}`} />
              <div className="flex-1">
                <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-sat-primary font-medium">
              Administrator
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-700 hover:text-sat-primary hover:bg-gray-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col lg:z-40">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-sat-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </div>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
          </div>
        </div>

        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-80 flex flex-col">
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}