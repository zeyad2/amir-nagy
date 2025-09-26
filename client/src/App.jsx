import { AuthProvider } from './utils/AuthContext'
import { ThemeProvider } from './utils/ThemeContext'
import { AppRouter } from './routes/AppRouter'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App