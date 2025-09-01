import { Link } from 'react-router-dom'
import { Wifi, Clock, MessageCircle } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI Voice Technology for Nigerian Businesses
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
            Transform your business with intelligent voice AI that understands Nigerian accents and business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="btn-white text-lg px-8 py-4">
              Explore Services
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose ODIADEV?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nigerian Network Optimized</h3>
              <p className="text-gray-600">
                Built specifically for Nigerian network conditions and mobile usage patterns.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
              <p className="text-gray-600">
                Always available to serve your customers, even outside business hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
              <p className="text-gray-600">
                AI that understands Nigerian English and local business terminology.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of Nigerian businesses already using ODIADEV AI voice technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Start Your Free Trial
            </Link>
            <Link to="/about" className="btn-outline text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
