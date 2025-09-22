import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminResources() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>Create lessons, homework and tests</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Resource management will be available in Phase 3!</p>
        </CardContent>
      </Card>
    </div>
  )
}