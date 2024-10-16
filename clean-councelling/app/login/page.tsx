'use client'
import { Loginform } from '@/components/Loginform';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        // Store user info or token in local storage or context
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/'); // Redirect to dashboard or user-specific page
      } else {
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <Loginform onSubmit={handleSubmit} onGoBack={handleGoBack} />
  );
}
