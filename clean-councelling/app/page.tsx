// app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';  // Import the useUser hook

export default function Home() {
  const router = useRouter();
  const { setUser } = useUser();  // Destructure setUser from the context
  const [userType, setUserType] = useState<'student' | 'college' | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    if (!loginId || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType, loginId, password }),
      });

      const result = await response.json();
      console.log(result.data)
      if (result && userType === 'student') {
        // Set the user context with the received data
        setUser(result.data?.[0]);

        // Redirect to student dashboard
        router.push('/student_dashboard');
      } else if (result && userType === 'college') {
        // Set the user context with college data and redirect to college dashboard
        setUser(result.data?.[0]);
        router.push('/college_dashboard');
      } else {
        setError('Invalid login credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-center items-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-teal-400">Clean Counselling</h1>
        <p className="text-lg text-gray-300">Simplifying the college counseling experience.</p>

        {!userType ? (
          <>
            <p className="text-lg text-gray-300">Login as..</p>
            <div className="mt-8 space-x-4">
              <button
                className="px-6 py-3 bg-teal-500 text-gray-900 font-semibold rounded-full"
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                className="px-6 py-3 bg-teal-500 text-gray-900 font-semibold rounded-full"
                onClick={() => setUserType('college')}
              >
                College
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-300">{userType === 'student' ? 'Student Login' : 'College Login'}</p>
            <input
              type="text"
              placeholder={`${userType === 'student' ? 'Student ID' : 'College ID'}`}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-teal-500 text-gray-900 font-semibold rounded-full"
            >
              Login
            </button>
            <button
              onClick={() => setUserType(null)}
              className="px-6 py-2 text-gray-300 underline"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
