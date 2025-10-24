'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
}
