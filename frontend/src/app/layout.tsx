"use client";

import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>StoreChain – Decentralized File Storage & Sharing</title>
        <meta
          name="description"
          content="StoreChain is a decentralized application for secure, private, and user-controlled file storage and sharing on IPFS and Polygon."
        />
      </head>
      <body className="min-h-screen bg-gray-100 flex flex-col items-center">
        <main className="w-full max-w-4xl p-6">{children}</main>
      </body>
    </html>
  );
}
