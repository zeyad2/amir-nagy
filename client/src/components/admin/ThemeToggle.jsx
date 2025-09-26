import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from '@/utils/ThemeContext'

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Light theme'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dark theme'
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follow system preference'
  }
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const currentThemeOption = themeOptions.find(option => option.value === theme) || themeOptions[0]
  const CurrentIcon = currentThemeOption.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-sat-primary"
          aria-label={`Theme: ${currentThemeOption.label}`}
        >
          <CurrentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        {themeOptions.map((option) => {
          const IconComponent = option.icon
          const isActive = theme === option.value

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <IconComponent className={`h-4 w-4 ${
                  isActive ? 'text-sat-primary' : 'text-gray-500'
                }`} />
                <span className={isActive ? 'font-medium text-sat-primary' : ''}>
                  {option.label}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}