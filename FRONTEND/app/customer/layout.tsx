import * as React from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg text-gray-800">Customer Portal</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
