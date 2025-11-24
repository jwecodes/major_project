'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
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
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AcadeX - Structured
            <span className="text-blue-600"> Smart Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your educational institution with the complete management solution that 
            <span className="font-semibold text-gray-900"> increases efficiency by 100%</span> and 
            <span className="font-semibold text-gray-900"> reduces admin workload by 75%</span>.
          </p>
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
          {/* Features Deep Dive */}
          <div id="features" className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 mb-16">
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
