'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/recipes');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/recipes');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-10 p-[120]">
      <div className="flex-1 sm:justify-center items-center flex">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="mb-[40]">
              <Image src="/logo.svg" alt="RecipeFinder" width={184} height={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
            <p className="text-dark text-lg">We're thrilled to have you</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-8 space-y-6">
            <div className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-sm text-foreground mb-4">
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
                  className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none"
                  placeholder="Email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-color-foreground mb-4">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-lg font-medium text-yellow hover:text-yellow-hover">
                Forgot password?
              </Link>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-400 rounded-lg text-black bg-yellow hover:bg-yellow-hover focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-half-transparent">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-dark text-lg font-medium rounded-2xl text-half-transparent bg-background focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="mr-3" />
                Sign in with Google
              </button>
            </div>
          </form>

          <p className="text-center text-lg text-foreground">
            Don&apos;t have account yet?{' '}
            <Link href="/auth/signup" className="text-lg font-medium text-yellow hover:text-yellow-hover">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1 bg-background w-auto h-auto">
        <Image src="/cake-photo.png" alt="Cake Photo" width={675} height={900} className="object-cover h-full w-full rounded-3xl"></Image>
      </div>
    </div>
  );
}

