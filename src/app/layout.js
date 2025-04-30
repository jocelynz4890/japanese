import { Geist, Geist_Mono } from "next/font/google";
import Provider from "./provider";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Japanese Learning Website",
  description: "AI-assisted Japanese Learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-screen w-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full overflow-hidden`}
      >
        <Provider>
          <Header></Header>
          <div className="h-[calc(100vh-4rem)]">
              {children}
          </div>
        </Provider>
      </body>
    </html>
  );
}
