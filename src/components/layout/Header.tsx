// src/components/layout/Header.tsx
import React, { useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { supabase } from '@/lib/supabase';

// Icons
import { FaHome, FaBook, FaUser, FaMoon, FaPrayingHands, 
         FaBookOpen, FaUserFriends, FaBars, FaTimes } from 'react-icons/fa';

interface HeaderProps {
  user: any;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    const checkUser = async () => {
      // If user is already passed as prop, use that
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      setLocalUser(currentUser);
      
      if (currentUser) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        // If profile doesn't exist, try to create it
        if (profileError && profileError.code === 'PGRST116') {
          const username = currentUser.user_metadata?.username || 
                          currentUser.email?.split('@')[0] || 
                          'User';
          
          await supabase
            .from('profiles')
            .insert([
              { id: currentUser.id, username, points: 0 }
            ]);
        }
      }
    };
    
    checkUser();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Stories', href: '/stories', icon: FaBook },
    { name: 'Prophets', href: '/prophets', icon: FaPrayingHands },
    { name: 'Companions', href: '/companions', icon: FaUserFriends },
    { name: 'Duas & Hadiths', href: '/duas', icon: FaBookOpen },
    { name: 'Ramadan', href: '/ramadan', icon: FaMoon },
  ];

  return (
    <Disclosure as="nav" className="bg-primary shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center">
                    <span className="text-white font-title text-xl md:text-2xl font-bold">Noor Tales</span>
                  </Link>
                </div>
                
                {/* Desktop nav links */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'border-accent text-white'
                            : 'border-transparent text-gray-200 hover:border-gray-300 hover:text-white'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        <item.icon className="mr-1 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Profile dropdown or Sign In/Up buttons */}
                {localUser ? (
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                          {localUser.user_metadata?.name 
                            ? localUser.user_metadata.name.charAt(0).toUpperCase() 
                            : localUser.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/favorites"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Favorites
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/auth/signin"
                      className="text-white hover:bg-accent hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-accent text-primary hover:bg-opacity-90 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <FaTimes className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <FaBars className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-dark text-white'
                        : 'text-gray-200 hover:bg-primary-light hover:text-white'
                    } block pl-3 pr-4 py-2 border-l-4 ${
                      isActive ? 'border-accent' : 'border-transparent'
                    } text-base font-medium flex items-center`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
            
            {/* Mobile profile section */}
            <div className="pt-4 pb-3 border-t border-primary-light">
              {localUser ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                        {localUser.user_metadata?.name 
                          ? localUser.user_metadata.name.charAt(0).toUpperCase() 
                          : localUser.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{localUser.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light"
                    >
                      Your Profile
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      href="/favorites"
                      className="block px-4 py-2 text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light"
                    >
                      Favorites
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/auth/signin"
                    className="block px-4 py-2 text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light"
                  >
                    Sign in
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/auth/signup"
                    className="block px-4 py-2 text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light"
                  >
                    Sign up
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}