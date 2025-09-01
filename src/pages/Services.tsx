import { Link } from 'react-router-dom'
import { Brain, Check, Zap, Shield, Users, Headphones, MessageCircle } from 'lucide-react'

const Services = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI voice solutions designed specifically for Nigerian businesses and network conditions.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">AI Voice Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">WhatsApp AI Agent</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Intelligent AI that handles customer inquiries on WhatsApp with natural Nigerian English understanding.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>24/7 availability</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Multi-language support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Integration with existing systems</span>
                </div>
              </div>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>

            <div className="card p-8">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">Web Chat Widget</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Embeddable chat widget for your website with AI-powered customer support.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Easy integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Customizable design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Analytics dashboard</span>
                </div>
              </div>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>

            <div className="card p-8">
              <div className="flex items-center mb-4">
                <Headphones className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">Voice AI Phone System</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete phone system replacement with AI receptionist and intelligent call routing.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Call handling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Voice recognition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Integration with CRM</span>
                </div>
              </div>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>

            <div className="card p-8">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">Custom AI Training</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Tailored AI models trained on your business data and industry-specific terminology.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Industry-specific knowledge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom responses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Continuous learning</span>
                </div>
              </div>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Implementation</h3>
              <p className="text-gray-600">
                Get up and running in days, not months, with our pre-built solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Enterprise-grade security with 99.9% uptime guarantee.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Support</h3>
              <p className="text-gray-600">
                Nigerian-based support team that understands your business needs.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="text-4xl font-bold text-primary mb-6">
                50,000<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-2 mb-8 text-left">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic AI chat widget</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>100 conversations/month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Email support</span>
                </li>
              </ul>
              <Link to="/contact" className="btn-primary w-full">Get Started</Link>
            </div>

            <div className="card p-8 text-center border-2 border-primary">
              <h3 className="text-2xl font-bold mb-4">Professional</h3>
              <div className="text-4xl font-bold text-primary mb-6">
                150,000<span className="text-lg text-gray-500">/month</span>
              </div>
              <ul className="space-y-2 mb-8 text-left">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>1000 conversations/month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Link to="/contact" className="btn-primary w-full">Get Started</Link>
            </div>

            <div className="card p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-primary mb-6">Custom</div>
              <ul className="space-y-2 mb-8 text-left">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Full customization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited conversations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>On-premise options</span>
                </li>
              </ul>
              <Link to="/contact" className="btn-primary w-full">Contact Sales</Link>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the AI revolution and give your customers the experience they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Get Started Today
            </Link>
            <Link to="/about" className="btn-primary text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Services
