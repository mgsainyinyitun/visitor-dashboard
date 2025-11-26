'use client';

// import { useIPTracker } from '@/hooks/useIPTracker';
import { Globe, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // useIPTracker();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Globe className="w-20 h-20 text-blue-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Visitor Analytics
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your visit is being tracked for analytics purposes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-xl p-6">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-sm text-gray-600">Monitor visitors as they arrive</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <Globe className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-sm text-gray-600">Track visitors from anywhere</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <BarChart3 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-600">Visualize your data</p>
            </div>
          </div>

          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            View Admin Dashboard
          </Link>

          <p className="text-sm text-gray-500 mt-8">
            This demo tracks visitor IP addresses and geolocation data
          </p>
        </div>
      </div>
    </div>
  );
}