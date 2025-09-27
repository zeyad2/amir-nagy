import { useState, useEffect } from 'react'
import { Bell, Check, X, AlertTriangle, DollarSign, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mock notification data - in real app, this would come from API
const mockNotifications = [
  {
    id: 1,
    type: 'enrollment_request',
    title: 'New Enrollment Request',
    message: 'Ahmed Mohamed requested enrollment in SAT Math Course',
    time: '2 minutes ago',
    read: false,
    icon: UserPlus,
    action: 'Review enrollment requests'
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    message: 'Sarah Ali completed payment for English Writing Course',
    time: '15 minutes ago',
    read: false,
    icon: DollarSign,
    action: 'View payment details'
  },
  {
    id: 3,
    type: 'system',
    title: 'System Alert',
    message: 'Server backup completed successfully',
    time: '1 hour ago',
    read: true,
    icon: AlertTriangle,
    action: 'View system logs'
  },
  {
    id: 4,
    type: 'enrollment_request',
    title: 'New Enrollment Request',
    message: 'Mona Hassan requested enrollment in SAT Reading Course',
    time: '3 hours ago',
    read: true,
    icon: UserPlus,
    action: 'Review enrollment requests'
  }
]

const getNotificationIcon = (type) => {
  switch (type) {
    case 'enrollment_request':
      return UserPlus
    case 'payment':
      return DollarSign
    case 'system':
      return AlertTriangle
    default:
      return Bell
  }
}

const getNotificationColor = (type) => {
  switch (type) {
    case 'enrollment_request':
      return 'text-blue-600'
    case 'payment':
      return 'text-green-600'
    case 'system':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-sat-primary"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-sat-primary hover:text-sat-primary/80"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type)
                const iconColor = getNotificationColor(notification.type)

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "p-4 cursor-pointer focus:bg-gray-50 border-b border-gray-100 last:border-0",
                      !notification.read && "bg-blue-50/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className={cn("mt-1", iconColor)}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm",
                            !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {notification.time}
                          </span>
                          <span className="text-xs text-sat-primary hover:underline">
                            {notification.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sat-primary hover:text-sat-primary/80 hover:bg-sat-primary/10"
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}