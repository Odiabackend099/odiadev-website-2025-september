import { Eye, Users, TrendingUp, Globe, Heart, Zap, Shield } from 'lucide-react'

const About = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">About ODIADEV</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are a Nigerian technology company dedicated to bringing cutting-edge AI voice solutions 
            to businesses across Africa.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">Mission</h3>
              </div>
              <p className="text-gray-600">
                To democratize AI voice technology for Nigerian businesses, making advanced conversational 
                AI accessible and affordable for companies of all sizes.
              </p>
            </div>
            <div className="card p-8">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold">Vision</h3>
              </div>
              <p className="text-gray-600">
                To become the leading AI voice technology provider in Africa, empowering businesses 
                with intelligent, culturally-aware conversational AI solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer First</h3>
              <p className="text-gray-600">
                Everything we do is centered around our customers success and satisfaction.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                Constantly pushing the boundaries of what AI voice technology can achieve.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliability</h3>
              <p className="text-gray-600">
                Building robust, scalable solutions that businesses can depend on.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Engineers</h3>
              <p className="text-gray-600">
                Experts in machine learning and natural language processing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security Specialists</h3>
              <p className="text-gray-600">
                Ensuring your data and conversations remain secure and private.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Analysts</h3>
              <p className="text-gray-600">
                Understanding your business needs and optimizing solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Company Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-gray-600">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
