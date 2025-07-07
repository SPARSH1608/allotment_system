import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

const SettingsPage = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue="Universal Network" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="inr">INR (₹)</option>
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="ist">IST (UTC+5:30)</option>
                <option value="utc">UTC</option>
                <option value="est">EST (UTC-5)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email alerts for important events</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Overdue Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when rentals are overdue</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Monthly Reports</Label>
                <p className="text-sm text-gray-500">Receive monthly summary reports</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-rental-period">Default Rental Period (days)</Label>
              <Input id="default-rental-period" type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late-fee">Late Fee (%)</Label>
              <Input id="late-fee" type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-deposit">Security Deposit (%)</Label>
              <Input id="security-deposit" type="number" defaultValue="20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" type="email" defaultValue="admin@laptoprent.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default SettingsPage