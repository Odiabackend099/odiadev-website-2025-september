import { Link } from 'react-router-dom'
import { HelpCircle, Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/" className="btn-primary flex items-center justify-center space-x-2">
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className="text-left bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Helpful Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/" className="text-primary hover:underline">Home</Link>
              <Link to="/about" className="text-primary hover:underline">About Us</Link>
              <Link to="/services" className="text-primary hover:underline">Our Services</Link>
              <Link to="/contact" className="text-primary hover:underline">Contact Us</Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Still Need Help?</h4>
            <p className="text-blue-700">
              If you believe this is an error, please contact our support team.
            </p>
            <Link to="/contact" className="text-blue-700 hover:underline font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
