// app/suggestion/page.tsx
'use client';

import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SuggestionForm from '@/components/SuggestionForm';

export default function SuggestionPage() {
  return (
    <main className="bg-gray-100 font-yekan">
      <Header />
      <Navbar />
      <div className="container mx-auto px-4 py-5 bg-white shadow-md">
        <SuggestionForm />
      </div>
      <Footer />
    </main>
  );
}
