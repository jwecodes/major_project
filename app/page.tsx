import Link from 'next/link'
import { GraduationCap, BookOpen, Users, Shield, Upload, Download, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                  <GraduationCap className="h-7 w-7 text-white transform -rotate-3" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TCMS Pro
                </h1>
                <p className="text-xs text-gray-600 font-medium">Teaching Content Management</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#portals" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">Modern Education Platform</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Academic Content
            </span>
            <span className="block text-5xl md:text-6xl mt-2">Management</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            A powerful, intuitive platform designed for educational institutions to manage, 
            share, and track teaching materials seamlessly across faculty and students.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#portals" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#features" 
              className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Stats - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { value: '100%', label: 'Digital', color: 'blue' },
            { value: '24/7', label: 'Access', color: 'purple' },
            { value: 'Secure', label: 'Storage', color: 'pink' },
            { value: 'Fast', label: 'Performance', color: 'indigo' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className={`text-4xl font-bold bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-700 bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section - NEW */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600">Simple, efficient workflow for everyone</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Admin Sets Up',
                description: 'Create programmes, courses, and add faculty & students to the system',
                icon: Shield,
                color: 'blue'
              },
              {
                step: '2',
                title: 'Faculty Uploads',
                description: 'Teachers upload lectures, assignments, and materials for coordinator approval',
                icon: Upload,
                color: 'purple'
              },
              {
                step: '3',
                title: 'Students Access',
                description: 'Students instantly access approved materials anytime, anywhere',
                icon: Download,
                color: 'pink'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl`}>
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className={`absolute top-0 -right-4 w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center font-bold text-${item.color}-600 text-xl`}>
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 right-0 w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600">Everything you need in one platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: 'Easy Upload',
                description: 'Drag & drop interface for quick content uploads with progress tracking',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: CheckCircle,
                title: 'Smart Approval',
                description: 'Coordinators review and approve content with comments and feedback',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: Download,
                title: 'Instant Access',
                description: 'Students download materials instantly with search and filters',
                gradient: 'from-pink-500 to-pink-600'
              },
              {
                icon: Shield,
                title: 'Secure Storage',
                description: 'Cloud storage with encryption and automatic backups',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: Users,
                title: 'Role Management',
                description: 'Different access levels for admin, faculty, and students',
                gradient: 'from-indigo-500 to-indigo-600'
              },
              {
                icon: BookOpen,
                title: 'Analytics Dashboard',
                description: 'Track uploads, downloads, and engagement metrics',
                gradient: 'from-orange-500 to-orange-600'
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section - Enhanced */}
      <section id="portals" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Portal</h3>
            <p className="text-xl text-gray-600">Select your role to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                href: '/admin/dashboard',
                icon: Shield,
                title: 'Admin Portal',
                subtitle: 'Complete System Control',
                gradient: 'from-blue-600 to-blue-700',
                features: [
                  'Manage programmes & courses',
                  'Add faculty & students',
                  'Review content approvals',
                  'View analytics & reports'
                ]
              },
              {
                href: '/faculty/login',
                icon: BookOpen,
                title: 'Faculty Portal',
                subtitle: 'Content Management',
                gradient: 'from-purple-600 to-purple-700',
                features: [
                  'Upload teaching materials',
                  'View assigned courses',
                  'Track approval status',
                  'Manage course content'
                ]
              },
              {
                href: '/student/login',
                icon: GraduationCap,
                title: 'Student Portal',
                subtitle: 'Learning Resources',
                gradient: 'from-pink-600 to-pink-700',
                features: [
                  'View enrolled courses',
                  'Download materials',
                  'Access lecture notes',
                  'Get assignments & resources'
                ]
              }
            ].map((portal, index) => (
              <Link key={index} href={portal.href}>
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-3 cursor-pointer group h-full">
                  <div className={`bg-gradient-to-br ${portal.gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <portal.icon className="h-10 w-10" />
                      </div>
                      <h4 className="text-3xl font-bold mb-2">{portal.title}</h4>
                      <p className="text-white/90 font-medium">{portal.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {portal.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center gap-2 group">
                      Access Portal
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">TCMS Pro</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Modern Teaching Content Management System designed to streamline academic content 
                delivery and enhance the learning experience.
              </p>
              <div className="flex gap-4">
                {/* Social media icons placeholder */}
              </div>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Quick Links</h5>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />How It Works</a></li>
                <li><a href="#portals" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Portals</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Support</h5>
              <p className="text-gray-400 leading-relaxed">
                For support and inquiries, please contact your system administrator.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© 2025 TCMS Pro. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Built for educational excellence</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
