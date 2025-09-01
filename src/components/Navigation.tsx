import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleMenu = () => setIsOpen(!isOpen)
  
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              ODIADEV
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="btn-outline">
              Dashboard
            </Link>
            <Link to="/contact" className="btn-primary">
              Get Started
            </Link>
          </div>
          
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-primary">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-primary">
                Home
              </Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700 hover:text-primary">
                About
              </Link>
              <Link to="/services" className="block px-3 py-2 text-gray-700 hover:text-primary">
                Services
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-primary">
                Contact
              </Link>
              <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-primary">
                Dashboard
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-primary">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
