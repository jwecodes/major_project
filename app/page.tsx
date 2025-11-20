// import Link from 'next/link'
// import { GraduationCap, BookOpen, Users, Shield, Upload, Download, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       {/* Modern Header */}
//       <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
//                   <GraduationCap className="h-7 w-7 text-white transform -rotate-3" />
//                 </div>
//                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                   TCMS Pro
//                 </h1>
//                 <p className="text-xs text-gray-600 font-medium">Teaching Content Management</p>
//               </div>
//             </div>
//             <nav className="hidden md:flex items-center gap-8">
//               <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//                 Features
//               </a>
//               <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//                 How It Works
//               </a>
//               <a href="#portals" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
//                 Get Started
//               </a>
//             </nav>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section - Enhanced */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
//             <Sparkles className="h-4 w-4 text-blue-600" />
//             <span className="text-sm font-semibold text-blue-600">Modern Education Platform</span>
//           </div>
          
//           <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
//             Transform Your
//             <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Academic Content
//             </span>
//             <span className="block text-5xl md:text-6xl mt-2">Management</span>
//           </h2>
          
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
//             A powerful, intuitive platform designed for educational institutions to manage, 
//             share, and track teaching materials seamlessly across faculty and students.
//           </p>
          
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <a 
//               href="#portals" 
//               className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
//             >
//               Get Started Now
//               <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
//             </a>
//             <a 
//               href="#features" 
//               className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
//             >
//               Learn More
//             </a>
//           </div>
//         </div>

//         {/* Stats - Enhanced */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
//           {[
//             { value: '100%', label: 'Digital', color: 'blue' },
//             { value: '24/7', label: 'Access', color: 'purple' },
//             { value: 'Secure', label: 'Storage', color: 'pink' },
//             { value: 'Fast', label: 'Performance', color: 'indigo' }
//           ].map((stat, index) => (
//             <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
//               <div className={`text-4xl font-bold bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-700 bg-clip-text text-transparent mb-2`}>
//                 {stat.value}
//               </div>
//               <div className="text-gray-600 font-medium">{stat.label}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* How It Works Section - NEW */}
//       <section id="how-it-works" className="bg-white py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
//             <p className="text-xl text-gray-600">Simple, efficient workflow for everyone</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 step: '1',
//                 title: 'Admin Sets Up',
//                 description: 'Create programmes, courses, and add faculty & students to the system',
//                 icon: Shield,
//                 color: 'blue'
//               },
//               {
//                 step: '2',
//                 title: 'Faculty Uploads',
//                 description: 'Teachers upload lectures, assignments, and materials for coordinator approval',
//                 icon: Upload,
//                 color: 'purple'
//               },
//               {
//                 step: '3',
//                 title: 'Students Access',
//                 description: 'Students instantly access approved materials anytime, anywhere',
//                 icon: Download,
//                 color: 'pink'
//               }
//             ].map((item, index) => (
//               <div key={index} className="relative">
//                 <div className="flex flex-col items-center text-center">
//                   <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl`}>
//                     <item.icon className="h-10 w-10 text-white" />
//                   </div>
//                   <div className={`absolute top-0 -right-4 w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center font-bold text-${item.color}-600 text-xl`}>
//                     {item.step}
//                   </div>
//                   <h4 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h4>
//                   <p className="text-gray-600 leading-relaxed">{item.description}</p>
//                 </div>
//                 {index < 2 && (
//                   <div className="hidden md:block absolute top-10 right-0 w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section - Enhanced */}
//       <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h3 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h3>
//             <p className="text-xl text-gray-600">Everything you need in one platform</p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: Upload,
//                 title: 'Easy Upload',
//                 description: 'Drag & drop interface for quick content uploads with progress tracking',
//                 gradient: 'from-blue-500 to-blue-600'
//               },
//               {
//                 icon: CheckCircle,
//                 title: 'Smart Approval',
//                 description: 'Coordinators review and approve content with comments and feedback',
//                 gradient: 'from-purple-500 to-purple-600'
//               },
//               {
//                 icon: Download,
//                 title: 'Instant Access',
//                 description: 'Students download materials instantly with search and filters',
//                 gradient: 'from-pink-500 to-pink-600'
//               },
//               {
//                 icon: Shield,
//                 title: 'Secure Storage',
//                 description: 'Cloud storage with encryption and automatic backups',
//                 gradient: 'from-green-500 to-green-600'
//               },
//               {
//                 icon: Users,
//                 title: 'Role Management',
//                 description: 'Different access levels for admin, faculty, and students',
//                 gradient: 'from-indigo-500 to-indigo-600'
//               },
//               {
//                 icon: BookOpen,
//                 title: 'Analytics Dashboard',
//                 description: 'Track uploads, downloads, and engagement metrics',
//                 gradient: 'from-orange-500 to-orange-600'
//               }
//             ].map((feature, index) => (
//               <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
//                 <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                   <feature.icon className="h-8 w-8 text-white" />
//                 </div>
//                 <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
//                 <p className="text-gray-600 leading-relaxed">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Portals Section - Enhanced */}
//       <section id="portals" className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h3 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Portal</h3>
//             <p className="text-xl text-gray-600">Select your role to get started</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 href: '/admin/dashboard',
//                 icon: Shield,
//                 title: 'Admin Portal',
//                 subtitle: 'Complete System Control',
//                 gradient: 'from-blue-600 to-blue-700',
//                 features: [
//                   'Manage programmes & courses',
//                   'Add faculty & students',
//                   'Review content approvals',
//                   'View analytics & reports'
//                 ]
//               },
//               {
//                 href: '/faculty/login',
//                 icon: BookOpen,
//                 title: 'Faculty Portal',
//                 subtitle: 'Content Management',
//                 gradient: 'from-purple-600 to-purple-700',
//                 features: [
//                   'Upload teaching materials',
//                   'View assigned courses',
//                   'Track approval status',
//                   'Manage course content'
//                 ]
//               },
//               {
//                 href: '/student/login',
//                 icon: GraduationCap,
//                 title: 'Student Portal',
//                 subtitle: 'Learning Resources',
//                 gradient: 'from-pink-600 to-pink-700',
//                 features: [
//                   'View enrolled courses',
//                   'Download materials',
//                   'Access lecture notes',
//                   'Get assignments & resources'
//                 ]
//               }
//             ].map((portal, index) => (
//               <Link key={index} href={portal.href}>
//                 <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-3 cursor-pointer group h-full">
//                   <div className={`bg-gradient-to-br ${portal.gradient} p-8 text-white relative overflow-hidden`}>
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
//                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
//                     <div className="relative z-10">
//                       <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//                         <portal.icon className="h-10 w-10" />
//                       </div>
//                       <h4 className="text-3xl font-bold mb-2">{portal.title}</h4>
//                       <p className="text-white/90 font-medium">{portal.subtitle}</p>
//                     </div>
//                   </div>
                  
//                   <div className="p-8">
//                     <ul className="space-y-4 mb-8">
//                       {portal.features.map((feature, idx) => (
//                         <li key={idx} className="flex items-start gap-3 text-gray-700">
//                           <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
//                           <span>{feature}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center gap-2 group">
//                       Access Portal
//                       <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
//                     </button>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer - Enhanced */}
//       <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid md:grid-cols-4 gap-12 mb-12">
//             <div className="md:col-span-2">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
//                   <GraduationCap className="h-7 w-7 text-white" />
//                 </div>
//                 <span className="text-2xl font-bold text-white">TCMS Pro</span>
//               </div>
//               <p className="text-gray-400 leading-relaxed mb-6">
//                 Modern Teaching Content Management System designed to streamline academic content 
//                 delivery and enhance the learning experience.
//               </p>
//               <div className="flex gap-4">
//                 {/* Social media icons placeholder */}
//               </div>
//             </div>
            
//             <div>
//               <h5 className="font-bold text-white mb-6 text-lg">Quick Links</h5>
//               <ul className="space-y-3">
//                 <li><a href="#features" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Features</a></li>
//                 <li><a href="#how-it-works" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />How It Works</a></li>
//                 <li><a href="#portals" className="hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Portals</a></li>
//               </ul>
//             </div>
            
//             <div>
//               <h5 className="font-bold text-white mb-6 text-lg">Support</h5>
//               <p className="text-gray-400 leading-relaxed">
//                 For support and inquiries, please contact your system administrator.
//               </p>
//             </div>
//           </div>
          
//           <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-gray-400">© 2025 TCMS Pro. All rights reserved.</p>
//             <p className="text-gray-400 text-sm">Built for educational excellence</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

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
