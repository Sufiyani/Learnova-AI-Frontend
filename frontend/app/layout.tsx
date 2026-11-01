"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Learnova AI — AI-Powered Learning Management System</title>
        <meta name="description" content="Learnova AI is a modern, AI-powered Learning Management System for students, instructors, and administrators." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='32' y2='32' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='7' fill='url(%23g)'/%3E%3Cpath d='M23 6L24 9L27 10L24 11L23 14L22 11L19 10L22 9Z' fill='white' opacity='0.9'/%3E%3Crect x='7' y='8' width='3' height='14' rx='1.5' fill='white'/%3E%3Crect x='7' y='19' width='10' height='3' rx='1.5' fill='white'/%3E%3C/svg%3E" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class">
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1e293b",
                  color: "#f1f5f9",
                  borderRadius: "8px",
                  fontSize: "14px",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
