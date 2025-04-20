
import './globals.css';
import './fonts.css';
import MainLayout from './components/shared/MainLayout';


export const metadata = {
  title: "Blog Platform",
  description: "A minimal social app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}