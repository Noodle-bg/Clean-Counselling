// app/page.tsx
'use client';

import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';


type College = {
  College_Name: string;
  Seat_Freezing_Price: number;
};



const Home = () => {
  const [colleges, setColleges] = useState<College[]>([]);

  const fetchColleges = async () => {
    const response = await fetch('/api/colleges');
    const data = await response.json();
    setColleges(data.colleges);
  };
  return (
    <div>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 animate-bounce">
        Clean Counselling
      </h1>
      <p className="text-lg text-gray-400 mb-12">
        Your one-stop platform for college seat counseling
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild>
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110"
          >
            Student Login
          </a>
        </Button>
        {/* <Button asChild>
          <a
            href="/admin-login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110"
          >
            Admin Login
          </a>
        </Button> */}
        <Button asChild>
          <a
            href="/college-login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110"
          >
            College Login
          </a>
        </Button>
      </div>

      <Button
        onClick={fetchColleges}
        className="mt-8 px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 rounded transition-all duration-300 ease-in-out transform hover:scale-110"
      >
        Get Colleges
      </Button>

      <ul className="mt-4 space-y-2">
        {colleges.map((college) => (
          <li key={college.College_Name} className="text-lg">
            {college.College_Name} - ${college.Seat_Freezing_Price}
          </li>
        ))}
      </ul>
    </div>
    

      <footer className="mt-20 text-gray-500">
        &copy; 2024 Clean Counselling. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
