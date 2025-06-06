'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getUserFromDB, updateToken } from "../../../db/queries";

const ForgotPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setSuccess('');

  try {
    const res = await fetch('/api/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    console.log("Reset email response:", result);
    if (!res.ok || !result.success) {
      setError(result.error || "Something went wrong");
      return;
    }

    setSuccess("Password reset email sent!");
  } catch (error) {
    setError("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image 
            src="/login-anime.png" 
            alt="Anime Login Illustration" 
            width={64} 
            height={64} 
            priority 
          />
        </div>
        
        <h1 className="text-1xl font-bold text-center text-gray-800 mb-6">
          Type your email to reset your password !!!
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Email address"
            />
          </div>

          <div>
            <Button variant="blueBtn" size="lg" className="w-full"> 
              {isLoading ? 'Send ...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPage;