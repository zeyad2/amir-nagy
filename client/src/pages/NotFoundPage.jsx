import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sat-light to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-gray-400">404</span>
            </div>
            <CardTitle className="text-3xl">Page not found</CardTitle>
            <CardDescription>
              Sorry, we couldn't find the page you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="sat" className="flex-1" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go home
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}