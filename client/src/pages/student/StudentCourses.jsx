import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentCourses() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Your enrolled courses and learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your course list will be available in Phase 7!</p>
        </CardContent>
      </Card>
    </div>
  )
}