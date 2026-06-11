import Link from 'next/link'
import { FileText, Scissors, Link as LinkIcon, FileType, RotateCw, Package, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PDF Tool Pro</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">Features</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">Pricing</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">About</a>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">
                Sign In
              </Link>
              <Link href="/dashboard" className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition">
                Try Free →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                🚀 Trusted by 10,000+ teams worldwide
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Transform Your PDF Workflow{' '}
                <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                  With Enterprise Tools
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Split, merge, convert, and optimize PDFs with lightning speed. 
                No software installation required. Start in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  href="/dashboard" 
                  className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition text-center"
                >
                  Start Free Trial
                </Link>
                <a 
                  href="#demo" 
                  className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold hover:border-primary-500 transition flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM8 14V6l6 4-6 4z"/>
                  </svg>
                  Watch Demo
                </a>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">1M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">PDFs Processed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">PDF Tool Pro</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg flex items-center gap-3">
                    <Scissors className="w-5 h-5 text-primary-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Split PDF</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Merge Files</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center gap-3">
                    <FileType className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Convert Format</span>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg flex items-center gap-3">
                    <Lock className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Add Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Work with PDFs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful tools designed for professionals and teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <FeatureCard
              icon={<Scissors className="w-8 h-8" />}
              title="Smart Split"
              description="Split PDFs by pages, size, or bookmarks. Extract exactly what you need instantly."
            />
            <FeatureCard
              icon={<LinkIcon className="w-8 h-8" />}
              title="Merge & Combine"
              description="Merge multiple PDFs into one. Reorder pages with drag & drop interface."
            />
            <FeatureCard
              icon={<FileType className="w-8 h-8" />}
              title="Format Conversion"
              description="Convert to Word, Excel, Markdown, HTML, or plain text with perfect formatting."
            />
            <FeatureCard
              icon={<RotateCw className="w-8 h-8" />}
              title="Rotate & Reorder"
              description="Rotate pages, delete unwanted pages, and reorganize your PDFs effortlessly."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="Smart Compression"
              description="Reduce file size up to 70% without losing quality. Perfect for email attachments."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Enterprise Security"
              description="Password protect PDFs, set permissions, and add watermarks for document control."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <PricingCard
              name="Free"
              price="$0"
              period="/month"
              description="Perfect for trying out"
              features={[
                '✓ 10 PDFs per month',
                '✓ Max 10 MB file size',
                '✓ Basic features',
                '✓ Email support',
                '✗ Advanced features',
                '✗ Batch processing',
              ]}
              ctaText="Get Started"
              ctaLink="/dashboard"
            />
            
            {/* Pro Plan */}
            <PricingCard
              name="Professional"
              price="$19"
              period="/month"
              description="For professionals"
              features={[
                '✓ Unlimited PDFs',
                '✓ Max 100 MB file size',
                '✓ All features included',
                '✓ Priority support',
                '✓ Batch processing',
                '✓ API access',
              ]}
              ctaText="Start Free Trial"
              ctaLink="/dashboard"
              featured
            />
            
            {/* Team Plan */}
            <PricingCard
              name="Team"
              price="$49"
              period="/month"
              description="For growing teams"
              features={[
                '✓ Everything in Pro',
                '✓ 5 team members',
                '✓ Shared workspace',
                '✓ Admin dashboard',
                '✓ 24/7 support',
                '✓ Custom branding',
              ]}
              ctaText="Contact Sales"
              ctaLink="#contact"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your PDF Workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who trust PDF Tool Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="bg-white text-primary-500 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Free Trial
            </Link>
            <a 
              href="#contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block hover:text-primary-400">Features</a>
                <a href="#pricing" className="block hover:text-primary-400">Pricing</a>
                <a href="#" className="block hover:text-primary-400">API</a>
                <a href="#" className="block hover:text-primary-400">Integrations</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#about" className="block hover:text-primary-400">About Us</a>
                <a href="#" className="block hover:text-primary-400">Careers</a>
                <a href="#" className="block hover:text-primary-400">Blog</a>
                <a href="#" className="block hover:text-primary-400">Press Kit</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block hover:text-primary-400">Documentation</a>
                <a href="#" className="block hover:text-primary-400">Help Center</a>
                <a href="#" className="block hover:text-primary-400">Community</a>
                <a href="#" className="block hover:text-primary-400">Status</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block hover:text-primary-400">Privacy Policy</a>
                <a href="#" className="block hover:text-primary-400">Terms of Service</a>
                <a href="#" className="block hover:text-primary-400">Security</a>
                <a href="#" className="block hover:text-primary-400">GDPR</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2026 PDF Tool Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-primary-400">Twitter</a>
              <a href="#" className="hover:text-primary-400">LinkedIn</a>
              <a href="#" className="hover:text-primary-400">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  ctaText, 
  ctaLink, 
  featured 
}: { 
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaText: string
  ctaLink: string
  featured?: boolean
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 ${featured ? 'border-primary-500 relative' : 'border-gray-200 dark:border-gray-700'}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
        <div className="flex items-baseline mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">{period}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-600 dark:text-gray-300">{feature}</li>
        ))}
      </ul>
      
      <Link 
        href={ctaLink}
        className={`block text-center py-3 rounded-lg font-semibold transition ${
          featured 
            ? 'bg-primary-500 text-white hover:bg-primary-600' 
            : 'border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-primary-500'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  )
}
