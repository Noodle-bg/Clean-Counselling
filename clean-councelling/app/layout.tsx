// app/layout.tsx
import './globals.css';
import { UserProvider } from './context/UserContext'; // Import the UserProvider

export const metadata = {
  title: 'Clean Counselling',
  description: 'Simplifying college counseling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
