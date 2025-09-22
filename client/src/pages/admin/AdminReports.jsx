import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminReports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
          <CardDescription>Performance reports and WhatsApp messaging</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Reports and analytics will be available in Phase 11!</p>
        </CardContent>
      </Card>
    </div>
  )
}