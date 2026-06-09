"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="drawer min-h-screen bg-base-100 text-base-content lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <header className="w-full border-b border-base-300 bg-base-100">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-1">
              <button onClick={handleLogoClick} className="btn btn-ghost text-xl font-bold hover:bg-base-200 px-2">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-content">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-silver-gradient">Trimly</span>
              </button>
            </div>
            <div className="flex-none flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-full border border-base-300 bg-base-200/60 py-1 pl-1 pr-3">
                    <div className="avatar placeholder">
                      <div className="flex items-center justify-center w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content">
                        <span className="text-sm font-semibold leading-none">
                          {user.username?.[0]?.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <div className="text-sm font-semibold text-silver-gradient">
                        {user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                      </div>
                      <div className="text-[11px] text-base-content/60 max-w-[160px] truncate">
                        {user.emailAddresses[0]?.emailAddress}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-circle hover:bg-base-200"
                    title="Sign Out"
                  >
                    <LogOutIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link href="/sign-in" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-grow bg-base-100">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      <div className="drawer-side z-50">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" onClick={() => setSidebarOpen(false)}></label>
        <aside className="flex min-h-screen w-72 flex-col border-r border-base-300 bg-base-200">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between border-b border-base-300 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-content">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-silver-gradient">Trimly</h2>
                <p className="text-xs opacity-60">Cloudinary Powered</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-ghost btn-sm lg:hidden"
              title="Close Sidebar"
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-3">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-4 py-3 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-content shadow-lg shadow-primary/30"
                          : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
                      }`}
                    >
                      {/* Animated background for hover effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-primary/0 transition-all duration-300 group-hover:bg-primary/10" />
                      )}
                      <item.icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-125 ${isActive ? '' : 'group-hover:rotate-6'} relative z-10`} />
                      <span className="relative z-10 font-medium">{item.label}</span>
                      {/* Animated underline effect */}
                      {!isActive && (
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-base-300 p-4">
            {user ? (
              <div className="rounded-lg border border-base-300 bg-base-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar placeholder">
                    <div className="flex items-center justify-center w-10 rounded-full bg-primary text-primary-content">
                      <span className="text-sm font-semibold leading-none">
                        {user.username?.[0]?.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                    </p>
                    <p className="text-xs opacity-60 truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-error btn-sm w-full hover:scale-105 transition-transform"
                >
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/sign-in" className="btn btn-primary w-full hover:scale-105 transition-transform">
                Sign In
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
