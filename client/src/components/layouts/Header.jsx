import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/utils/AuthContext'
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  BookOpen,
  BarChart3,
  Users,
  Home
} from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
  ]

  const studentNavItems = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'My Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Performance', href: '/student/performance', icon: BarChart3 },
  ]

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ]

  const getNavItems = () => {
    if (!isAuthenticated) return publicNavItems
    if (user?.role === 'admin') return adminNavItems
    if (user?.role === 'student') return studentNavItems
    return publicNavItems
  }

  const navItems = getNavItems()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sat-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-gray-900">
                SAT Platform
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="nav-link flex items-center space-x-1"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.firstName || 'User'}</span>
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button variant="sat" size="sm" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-sat-primary hover:bg-gray-50 rounded-md flex items-center space-x-2"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-sat-primary hover:bg-gray-50 rounded-md flex items-center space-x-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-sat-primary hover:bg-gray-50 rounded-md"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-sat-primary text-white rounded-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}