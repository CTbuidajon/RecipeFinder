'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createUserDocument = async (userId: string, userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date().toISOString(),
        favorites: [],
      });
    } catch (err) {
      console.error('Error creating user document:', err);
      throw err;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await createUserDocument(user.uid, {
        firstName,
        lastName,
        email,
      });

      router.push('/recipes');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await createUserDocument(user.uid, {
        firstName,
        lastName,
        email: user.email || '',
      });

      router.push('/recipes');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-10 p-[120]">
      <div className="flex-1 flex sm:justify-center items-center bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="mb-[40]">
              <Image src="/logo.svg" alt="RecipeFinder" width={184} height={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Get started</h1>
            <p className="text-dark">Welcome! We're thrilled to have you</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none "
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
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
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none"
                  placeholder="Password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-dark placeholder-grey text-foreground rounded-lg focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-400 rounded-lg text-black bg-yellow hover:bg-yellow-hover focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
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
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-dark text-lg font-medium rounded-2xl text-half-transparent bg-background focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
               <Image src="/google-icon.svg" alt="Google" width={24} height={24} className="mr-3" />
                Sign up with Google
              </button>
            </div>
          </form>

          <p className="text-center text-lg text-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-yellow hover:text-yellow-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1 relative bg-background">
        <div className="absolute inset-0 flex items-center justify-center h-auto w-auto ">
          <Image src="/cake-photo.png" alt="Cake Photo" width={675} height={900} className="object-cover h-full w-full rounded-3xl"></Image>
        </div>
      </div>
    </div>
  );
}

