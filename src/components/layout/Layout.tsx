import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import LoadingIndicator from './LoadingIndicator';
import { supabase } from '@/lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Noor Tales - Islamic Stories for Kids' }: LayoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check current auth status
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Router events for loading state
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Noor Tales - Daily Islamic animated stories for children" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
    href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Nunito:wght@400;600;700&family=Scheherazade+New:wght@400;700&display=swap"
    rel="stylesheet"
  />

    {/* Optional: Add this CSS for better Arabic text rendering */}
    <style jsx global>{`
    .arabic-text {
      font-family: 'Amiri', 'Scheherazade New', serif;
      letter-spacing: 0.02em;
      line-height: 1.8;
      direction: rtl;
    }
  `}</style>
      </Head>

      <div className="flex flex-col min-h-screen bg-background">
        <Header user={user} />
        
        <main className="flex-grow">
          {isLoading ? <LoadingIndicator /> : children}
        </main>
        
        <Footer />
      </div>
    </>
  );
}