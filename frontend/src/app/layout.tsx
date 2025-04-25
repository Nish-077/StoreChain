"use client";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 flex flex-col items-center">
        <main className="w-full max-w-4xl p-6">{children}</main>
      </body>
    </html>
  );
}
