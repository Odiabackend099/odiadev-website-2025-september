import { TrendingUp, Clock, BarChart3, Settings, Download, Plus, Users, MessageCircle, Phone } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex space-x-4">
            <button className="btn-outline">Export Data</button>
            <button className="btn-primary">New Project</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-3xl font-bold">2,847</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last month
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">1,234</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% from last month
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-3xl font-bold">1.2s</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              -15% from last month
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-3xl font-bold">4.8/5</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5% from last month
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New conversation started</p>
                  <p className="text-sm text-gray-600">Customer inquiry about pricing</p>
                </div>
                <div className="text-sm text-gray-500">2 min ago</div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-600">Business account created</p>
                </div>
                <div className="text-sm text-gray-500">15 min ago</div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Voice call completed</p>
                  <p className="text-sm text-gray-600">Customer support resolved</p>
                </div>
                <div className="text-sm text-gray-500">1 hour ago</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Bot</span>
              </button>
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Download Report</span>
              </button>
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configure Settings</span>
              </button>
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">AI Voice Service</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Database</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">API Gateway</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
