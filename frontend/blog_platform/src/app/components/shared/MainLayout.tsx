// components/shared/MainLayout.tsx
import Navbar from "./Navbar";

import Footer from "./Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        
        <main className="flex-1 p-4">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
