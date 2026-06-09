"use client"

import Link from "next/link"
import { Mail, Linkedin } from 'lucide-react'; // Or your respective icon package
import { motion } from "framer-motion"
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Gauge,
  Image as ImageIcon,
  Layers,
  Play,
  Sparkles,
  Zap,
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const stats = [
  { label: "Compression Ratio", value: "Up to 80%", icon: Gauge },
  { label: "AI Processing", value: "Smart Crop", icon: Brain },
  { label: "Supported Formats", value: "50+", icon: Layers },
]

const modes = [
  {
    title: "Smart Video Compression",
    description:
      "Upload videos up to 80MB and automatically compress them while keeping quality sharp for web streaming, social media, and storage savings.",
    icon: Zap,
    href: "/sign-up",
    action: "Try Video Compression",
    features: [
      "Intelligent compression up to 80%",
      "Auto quality optimization",
      "MP4, MOV, WebM support",
      "Preview and download compressed files",
    ],
  },
  {
    title: "AI Image Resizer",
    description:
      "Crop and resize images for social platforms with automatic subject-aware framing and production-ready export sizes.",
    icon: ImageIcon,
    href: "/sign-up",
    action: "Try Image Resizer",
    features: [
      "One-click smart cropping",
      "Platform-specific formats",
      "Instagram, Twitter, LinkedIn ready",
      "Automatic subject detection",
    ],
  },
]

const steps = [
  {
    step: "01",
    title: "Create Account",
    description: "Sign up and unlock the media tools in your workspace.",
  },
  {
    step: "02",
    title: "Upload Media",
    description: "Choose video compression or social image resizing.",
  },
  {
    step: "03",
    title: "Download & Share",
    description: "Export optimized media with useful size details.",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.03 }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-content">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold">Trimly</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="badge badge-outline badge-lg mb-8 gap-2 border-base-300 bg-base-200">
            <Sparkles className="h-4 w-4 text-primary" />
            Powered by AI and Cloudinary
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Professional media optimization for videos and social images
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-base-content/70">
            Compress large videos and resize images for every social format from one
            black-theme workspace built with DaisyUI.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/sign-in" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="rounded-lg border border-base-300 bg-base-200 p-5 shadow-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-base-content/60">Workspace</p>
              <h2 className="text-xl font-bold">Media Queue</h2>
            </div>
            <div className="badge badge-primary">Black Theme</div>
          </div>
          <div className="space-y-4">
            {[
              ["Campaign Reel.mp4", "80MB", "16MB", 80],
              ["Product Story.mov", "42MB", "13MB", 69],
              ["Launch Banner.png", "Social", "Ready", 100],
            ].map(([name, original, result, progress]) => (
              <div key={name} className="rounded-lg border border-base-300 bg-base-100 p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-sm text-base-content/60">
                      {original} to {result}
                    </p>
                  </div>
                  <div className="badge badge-outline">{progress}%</div>
                </div>
                <progress className="progress progress-primary w-full" value={Number(progress)} max="100" />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-base-300 bg-base-200">
        <div className="mx-auto grid max-w-5xl gap-4 px-6 py-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="stat rounded-lg border border-base-300 bg-base-100">
              <div className="stat-figure text-primary">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="stat-title">{stat.label}</div>
              <div className="stat-value text-2xl">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold">Two Powerful Modes</h2>
          <p className="text-base-content/70">
            Pick the workflow you need and keep everything inside the same black DaisyUI interface.
          </p>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="card border border-base-300 bg-base-200 shadow-xl"
            >
              <div className="card-body gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <mode.icon className="h-7 w-7" />
                </div>
                <h3 className="card-title text-2xl">{mode.title}</h3>
                <p className="text-base-content/70">{mode.description}</p>
                <ul className="space-y-3">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="card-actions pt-2">
                  <Link href={mode.href} className="btn btn-primary">
                    {mode.action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-base-300 bg-base-200">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-base-content/70">Get from upload to optimized export in three steps.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="rounded-lg border border-base-300 bg-base-100 p-6">
                <div className="mb-4 text-4xl font-bold text-primary">{item.step}</div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="text-base-content/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="rounded-lg border border-base-300 bg-base-200 p-10">
          <h2 className="mb-5 text-4xl font-bold">Ready to Optimize Your Media?</h2>
          <p className="mx-auto mb-8 max-w-xl text-base-content/70">
            Start with video compression or social image resizing and keep your exports ready for sharing.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Sign Up Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/sign-in" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-base-300 bg-base-200 py-10">
     <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Play className="h-4 w-4 fill-current" />
        </div>
        <span className="font-bold">Trimly</span>
      </div>

      {/* Copyright & Info */}
      <p className="text-sm text-base-content/50 text-center md:text-left">
        (c) Ayush Singh 2026 Trimly. Powered by Cloudinary and AI technology.
      </p>

      {/* Contact Links */}
      <div className="flex items-center gap-4">
        <a 
          href="mailto:ayush72350@gmail.com" 
          className="text-base-content/70 hover:text-primary transition-colors"
          aria-label="Gmail"
        >
          <Mail className="h-5 w-5" />
        </a>
        <a 
          href="https://www.linkedin.com/in/ayush-singh-8b90572b4/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-base-content/70 hover:text-primary transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
</main>
  )
}
