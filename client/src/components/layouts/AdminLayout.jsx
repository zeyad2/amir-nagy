import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import Footer from '../common/Footer'
import NotificationCenter from '../admin/NotificationCenter'
import AdminBreadcrumb from '../admin/AdminBreadcrumb'
import QuickActions from '../admin/QuickActions'
import ThemeToggle from '../admin/ThemeToggle'
import {
  Home,
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Menu,
  User,
  LogOut,
  Settings,
  MoreHorizontal,
  ArrowLeft,
  Plus
} from 'lucide-react'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard navigation support
  const sidebarRef = useRef(null)
  const mainContentRef = useRef(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + S to focus sidebar
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        if (sidebarRef.current) {
          const firstLink = sidebarRef.current.querySelector('a')
          if (firstLink) firstLink.focus()
        }
      }

      // Alt + M to focus main content
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        if (mainContentRef.current) {
          mainContentRef.current.focus()
        }
      }

      // Escape to close mobile sidebar
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

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

  // Mobile Bottom Tab Bar Component
  const MobileBottomTabs = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {/* Main navigation items (first 4) */}
        {sidebarItems.slice(0, 4).map((item) => {
          const isActive = isActiveRoute(item.href)
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 text-center transition-colors ${
                isActive
                  ? 'text-sat-primary bg-blue-50'
                  : 'text-gray-600 hover:text-sat-primary hover:bg-gray-50'
              }`}
              style={{ minHeight: '44px' }} // Touch-friendly minimum height
            >
              <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'text-sat-primary' : 'text-gray-500'}`} />
              <span className="text-xs font-medium truncate w-full">{item.name}</span>
            </Link>
          )
        })}

        {/* More menu for additional items */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-full text-center transition-colors ${
              showMoreMenu || location.pathname.startsWith('/admin/reports')
                ? 'text-sat-primary bg-blue-50'
                : 'text-gray-600 hover:text-sat-primary hover:bg-gray-50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <MoreHorizontal className="h-5 w-5 mb-1 text-gray-500" />
            <span className="text-xs font-medium">More</span>
          </button>

          {/* More menu dropdown */}
          {showMoreMenu && (
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              {/* Reports - if not in main tabs */}
              {sidebarItems.slice(4).map((item) => {
                const isActive = isActiveRoute(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center space-x-3 px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-sat-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-sat-primary'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <div>
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

              <Separator className="my-2" />

              {/* Settings */}
              <button className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-gray-100 hover:text-sat-primary transition-colors">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  logout()
                  setShowMoreMenu(false)
                }}
                className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const SidebarContent = ({ onItemClick = () => {} }) => (
    <div ref={sidebarRef} className="flex flex-col h-full">
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
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-sat-primary focus:ring-offset-2 ${
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
            className="w-full justify-start text-gray-700 hover:text-sat-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sat-primary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      {/* Click outside handler for mobile more menu */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMoreMenu(false)}
          aria-hidden="true"
        />
      )}
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col lg:z-40">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="lg:hidden">
          {/* Mobile Header - Touch Optimized */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sat-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">Admin</span>
                <div className="text-xs text-gray-500">SAT Platform</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Touch-friendly notification center */}
              <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors" style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NotificationCenter />
              </div>

              {/* Touch-friendly quick actions */}
              <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors" style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QuickActions />
              </div>

              {/* Touch-friendly menu button */}
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-3 focus:outline-none focus:ring-2 focus:ring-sat-primary hover:bg-gray-100"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
            </div>
          </div>
        </div>

        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Header */}
      <div className="hidden lg:block lg:pl-80">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {/* Keyboard shortcuts hint */}
              <span className="hidden xl:inline">
                Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Alt + S</kbd> to focus sidebar,
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">Alt + M</kbd> for main content
              </span>
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
              <ThemeToggle />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-80 flex flex-col">
        <main
          ref={mainContentRef}
          className="flex-1 focus:outline-none"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <div className="px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6">
            <AdminBreadcrumb />
            <Outlet />
          </div>
        </main>

        {/* Footer - hidden on mobile to make room for bottom tabs */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileBottomTabs />
    </div>
  )
}