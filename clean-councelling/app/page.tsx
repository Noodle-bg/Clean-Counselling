// app/page.tsx
'use client';

import { useState } from 'react';
import React from 'react';

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
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 animate-bounce">
        Clean Counselling
      </h1>
      <p className="text-lg text-gray-400 mb-12">Your one-stop platform for college seat counseling</p>

      <div className="flex space-x-4">
        <a href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110">
          Student Login
        </a>
        <a href="/admin-login" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110">
          Admin Login
        </a>
        <a href="/college-login" className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out transform hover:scale-110">
          College Login
        </a>
      </div>
      <button
        onClick={fetchColleges}
        className="px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 rounded transition-all duration-300 ease-in-out transform hover:scale-110"
      >
        Get Colleges
      </button>
      <ul className="mt-4 space-y-2">
        {colleges.map((college) => (
          <li key={college.College_Name} className="text-lg">
            {college.College_Name} - ${college.Seat_Freezing_Price}
          </li>
        ))}
      </ul>

      <footer className="mt-20 text-gray-500">
        &copy; 2024 Clean Counselling. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
