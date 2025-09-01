import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log("Form submitted:", formData)
    setIsSubmitting(false)
    // Reset form
    setFormData({ name: "", email: "", phone: "", company: "", message: "" })
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your business with AI voice technology? 
            Get in touch with our team today.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">info@odiadev.com</p>
                  <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600">+234 123 456 7890</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM WAT</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Office</h3>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                  <p className="text-sm text-gray-500">Visit us for a consultation</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-gray-500">Saturday: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-outline flex items-center justify-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Schedule a Demo</span>
                </button>
                <button className="w-full btn-outline flex items-center justify-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Request Quote</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card p-8">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input resize-none"
                    placeholder="Tell us about your project and how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-3">How quickly can you implement AI voice solutions?</h3>
              <p className="text-gray-600">
                Most solutions can be implemented within 2-4 weeks, depending on complexity. 
                We offer rapid deployment options for urgent projects.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-3">Do you provide ongoing support and maintenance?</h3>
              <p className="text-gray-600">
                Yes, we offer comprehensive support packages including 24/7 monitoring, 
                regular updates, and dedicated account management.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-3">Can you integrate with our existing systems?</h3>
              <p className="text-gray-600">
                Absolutely! We specialize in seamless integrations with CRM systems, 
                databases, and other business applications you already use.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-3">What makes your AI voice technology different?</h3>
              <p className="text-gray-600">
                Our technology is specifically optimized for Nigerian accents and business contexts, 
                with local language support and network optimization for African conditions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
