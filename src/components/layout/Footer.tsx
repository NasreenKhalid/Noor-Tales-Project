import React from 'react';
import Link from 'next/link';
import { FaHeart, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold font-title mb-4">Noor Tales</h3>
            <p className="text-sm text-gray-200 mb-4">
              Daily Islamic animated stories for children, helping them understand key aspects of Islam through engaging and educational content.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-title mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-gray-300 hover:text-white">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/prophets" className="text-gray-300 hover:text-white">
                  Prophet Stories
                </Link>
              </li>
              <li>
                <Link href="/companions" className="text-gray-300 hover:text-white">
                  Companion Stories
                </Link>
              </li>
              <li>
                <Link href="/duas" className="text-gray-300 hover:text-white">
                  Duas & Hadiths
                </Link>
              </li>
              <li>
                <Link href="/ramadan" className="text-gray-300 hover:text-white">
                  Ramadan Special
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-title mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-300 hover:text-white">
                  Premium Subscription
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-primary-light text-center text-sm text-gray-300">
          <p>
            Made with <FaHeart className="inline text-accent mx-1" /> for Islamic education
          </p>
          <p className="mt-2">
            © {currentYear} Noor Tales. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}