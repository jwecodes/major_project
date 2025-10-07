'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('admin')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AcadeX</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">LIVE</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#demo" className="text-gray-600 hover:text-blue-600 transition-colors">Demo</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link>
            <div className="flex items-center space-x-2">
              <Link href="#contact" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-6">
            🎉 <span className="ml-2 font-semibold">New: AI-Powered Course Recommendations</span>
          </div> */}
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AcadeX -  Structured
            <span className="text-blue-600"> Smart Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your educational institution with the complete management solution that 
            <span className="font-semibold text-gray-900"> increases efficiency by 100%</span> and 
            <span className="font-semibold text-gray-900"> reduces admin workload by 75%</span>.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Trusted by 500+ Universities</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">GDPR Compliant</span>
            </div>
          </div>

          {/* Video Demo Section */}
          <div className="relative max-w-3xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-2xl border border-white/30">
              {!isVideoPlaying ? (
                <div 
                  className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl aspect-video flex items-center justify-center cursor-pointer group"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                  <div className="relative z-10 text-white text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">See AcadeX in Action</h3>
                    <p className="text-white/80">2-minute product demo</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                  <p className="text-white">Video Demo Playing...</p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">10x Faster Setup</h3>
              <p className="text-gray-600 text-sm">Deploy in under 30 minutes with automated workflows</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600 text-sm">With end-to-end encryption</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 text-sm">Smart analytics that predict student success</p>
            </div>
          </div>

          {/* Customer Logos
          <div className="mb-16">
            <p className="text-gray-500 text-sm mb-8">Trusted by leading educational institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'].map((logo) => (
                <div key={logo} className="bg-white px-6 py-3 rounded-lg shadow text-gray-600 font-semibold">
                  {logo}
                </div>
              ))}
            </div>
          </div> */}

          {/* Role Selection with Enhanced Design */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Role to Get Started
            </h2>
            <p className="text-gray-600 mb-8">
              Access tailored dashboards designed for your specific workflow
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/admin" 
                className="group bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Full Control
                </div>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔧</div>
                <h3 className="text-2xl font-semibold mb-3">Admin Panel</h3>
                <p className="text-blue-100 mb-4">Complete control over programmes, faculties, and students</p>
                <div className="flex items-center justify-center text-blue-200 text-sm">
                  <span>Enter Admin Portal</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              
              <Link 
                href="/faculty" 
                className="group bg-green-600 hover:bg-green-700 text-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Teaching Tools
                </div>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</div>
                <h3 className="text-2xl font-semibold mb-3">Faculty Panel</h3>
                <p className="text-green-100 mb-4">Manage courses, upload content, and track progress</p>
                <div className="flex items-center justify-center text-green-200 text-sm">
                  <span>Enter Faculty Portal</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              
              <Link 
                href="/student" 
                className="group bg-purple-600 hover:bg-purple-700 text-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Smart Learning
                </div>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                <h3 className="text-2xl font-semibold mb-3">Student Panel</h3>
                <p className="text-purple-100 mb-4">Access courses, materials, and track academic journey</p>
                <div className="flex items-center justify-center text-purple-200 text-sm">
                  <span>Enter Student Portal</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Features Deep Dive */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Everything You Need to Run Your Institution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: '📚', title: 'Programme Management', desc: 'Create and manage academic programmes with automated credit tracking' },
                { icon: '👥', title: 'Faculty Allocation', desc: 'Smart assignment of courses to faculty with workload optimization' },
                { icon: '📅', title: 'Timetable Management', desc: 'Automated scheduling with conflict detection and room allocation' },
                { icon: '📄', title: 'Content Management', desc: 'Upload, approve, and distribute academic materials seamlessly' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time insights into academic performance and trends' },
                { icon: '🔐', title: 'Role-Based Access', desc: 'Secure permissions system for different user types' }
              ].map((feature, index) => (
                <div key={index} className="text-center group hover:bg-white/40 p-6 rounded-xl transition-all">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "AcadeX reduced our administrative time by 70%. The automated timetabling alone saved us weeks of manual work.",
                  author: "Dr. Sarah Chen",
                  title: "Academic Director, Tech University",
                  rating: 5
                },
                {
                  quote: "The faculty dashboard is incredibly intuitive. I can manage all my courses and track student progress in one place.",
                  author: "Prof. Michael Rodriguez",
                  title: "Computer Science Faculty",
                  rating: 5
                },
                {
                  quote: "Students love the clean interface and easy access to materials. Our engagement rates increased by 40%.",
                  author: "Lisa Thompson",
                  title: "Student Affairs Manager",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">"{testimonial.quote}"</blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 mb-12 text-center">Choose the plan that fits your institution's size</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  period: '/month',
                  description: 'Perfect for small colleges',
                  features: ['Up to 500 students', 'Basic analytics', 'Email support', '5GB storage'],
                  popular: false
                },
                {
                  name: 'Professional',
                  price: '$149',
                  period: '/month',
                  description: 'Most popular for universities',
                  features: ['Up to 5,000 students', 'Advanced analytics', 'Priority support', '50GB storage', 'API access'],
                  popular: true
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  description: 'For large institutions',
                  features: ['Unlimited students', 'Custom integrations', 'Dedicated support', 'Unlimited storage', 'On-premise option'],
                  popular: false
                }
              ].map((plan, index) => (
                <div key={index} className={`relative rounded-xl p-6 ${plan.popular ? 'bg-blue-600 text-white' : 'bg-white/40'} border ${plan.popular ? 'border-blue-400' : 'border-white/30'} shadow-lg`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <div className="mb-4">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                      <span className={`${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{plan.period}</span>
                    </div>
                    <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{plan.description}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={`flex items-center ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                          <span className={`mr-2 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular 
                        ? 'bg-white text-blue-600 hover:bg-gray-100' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: "How quickly can we get started?",
                  answer: "Most institutions are up and running within 24-48 hours. Our team handles the setup and data migration."
                },
                {
                  question: "Is our data secure?",
                  answer: "Yes! Your data is stored in secure, compliant data centers."
                },
                {
                  question: "Can we integrate with existing systems?",
                  answer: "Absolutely. AcadeX connects with 200+ popular education tools and student information systems."
                },
                {
                  question: "What kind of support do you provide?",
                  answer: "We offer 24/7 support via chat, email, and phone. Plus dedicated customer success managers for Enterprise clients."
                }
              ].map((faq, index) => (
                <div key={index} className="p-6 bg-white/40 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Institution?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join 500+ educational institutions already using AcadeX</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <span className="mr-2">🚀</span>
                Start 14-Day Free Trial
              </button>
              <button className="border border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                <span className="mr-2">📞</span>
                Schedule Demo Call
              </button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 text-blue-200 text-sm">
              <span>✓ No credit card required</span>
              <span>✓ Setup in under 1 hour</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
              <div className="text-gray-600 text-sm">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">50K+</div>
              <div className="text-gray-600 text-sm">Faculty Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">1M+</div>
              <div className="text-gray-600 text-sm">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">99.9%</div>
              <div className="text-gray-600 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold">AcadeX</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Empowering educational institutions with smart, structured learning management solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm">t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status Page</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} AcadeX. All rights reserved. Built with ❤️ for education.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-4.48 1.12c-.28.07-.566-.04-.723-.25A.734.734 0 015 19.75l1.12-4.48A8.955 8.955 0 015 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
