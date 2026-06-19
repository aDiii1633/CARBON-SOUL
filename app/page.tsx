'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Globe,
  ArrowRight,
  Brain,
  Flame,
  Award,
  Car,
  PlayCircle
} from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();

  // Simulated global emissions ticking counter (approx. 1100 tons CO2 per second)
  const [globalEmissions, setGlobalEmissions] = useState(1450000000);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalEmissions((prev) => prev + 128.7);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 bg-background/80 backdrop-blur-md z-50 h-16 flex items-center justify-between px-6 lg:px-12"
      >
        <div className="flex items-center space-x-2">
          <div className="p-2 neo-flat-sm rounded-full">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <span className="font-extrabold text-xl tracking-widest text-primary uppercase">EcoTrack</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Demo Details
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="neo-flat text-primary font-bold text-sm px-5 py-2.5 rounded-xl hover:neo-pressed active:neo-pressed transition-all flex items-center space-x-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-foreground hover:text-primary transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="neo-flat text-primary font-bold text-sm px-5 py-2.5 rounded-xl hover:neo-pressed active:neo-pressed transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/30 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 neo-pressed-sm px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-wider mb-8">
              <SproutIcon className="h-4 w-4" />
              <span>Version 1.0 Live</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
              Know your impact. <br />
              <span className="text-primary">Reduce it today.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg font-medium">
              EcoTrack is an AI-powered personal carbon footprint tracker designed to help you monitor, understand, and reduce your daily environmental footprint in a beautifully soft UI.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href={session ? '/dashboard' : '/register'}
                className="neo-flat text-primary text-center font-extrabold px-8 py-4 rounded-[2rem] hover:neo-pressed active:neo-pressed transition-all flex items-center justify-center space-x-3 text-lg"
              >
                <span>Track My Footprint</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="neo-pressed text-foreground text-center font-bold px-8 py-4 rounded-[2rem] hover:neo-flat active:neo-flat transition-all flex items-center justify-center space-x-3 text-lg"
              >
                <PlayCircle className="h-5 w-5 text-primary" />
                <span>Start Demo</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Simulated Live Counter */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="neo-flat rounded-[3rem] p-10 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="neo-pressed-sm p-4 rounded-full mb-6">
              <Globe className="h-12 w-12 text-primary animate-[spin_10s_linear_infinite]" />
            </div>
            
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
              Global CO₂ Emissions This Year (Tons)
            </p>
            
            <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono text-foreground tracking-tight mb-4 select-all tabular-nums drop-shadow-sm">
              {globalEmissions.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            
            <p className="text-xs text-destructive font-bold flex items-center gap-2 neo-pressed-sm px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping inline-block" />
              Ticking up by ~1,100 tons every second
            </p>
            
            <div className="mt-10 pt-10 border-t border-border/50 w-full grid grid-cols-2 gap-6 text-left">
              <div className="neo-pressed p-4 rounded-2xl">
                <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Your target</p>
                <p className="text-xl font-black text-primary font-mono">2.0 T/yr</p>
              </div>
              <div className="neo-pressed p-4 rounded-2xl">
                <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Global Avg</p>
                <p className="text-xl font-black text-destructive font-mono">4.7 T/yr</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-foreground mb-4 drop-shadow-sm">How EcoTrack Works</h2>
            <p className="text-muted-foreground font-medium text-lg">Three simple steps to transition into a net-zero carbon lifestyle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { num: 1, title: 'Track Footprint', desc: 'Log daily activities across transport, food, energy, shopping, and waste.' },
              { num: 2, title: 'Understand Impact', desc: 'Analyze trends. Speak with EcoBot, our AI advisor, to find major impact areas.' },
              { num: 3, title: 'Act & Improve', desc: 'Take recommended actions, earn badges, and maintain streaks for green habits.' }
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="neo-flat p-10 rounded-[2.5rem] text-center flex flex-col items-center hover:neo-pressed transition-all duration-500"
              >
                <div className="w-16 h-16 neo-pressed text-primary font-black rounded-full flex items-center justify-center text-2xl mb-8">
                  {step.num}
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-20">
            <h2 className="text-4xl font-extrabold text-foreground mb-4 drop-shadow-sm">Engineered For Impact</h2>
            <p className="text-muted-foreground font-medium text-lg">Equipped with state-of-the-art tools to reduce your footprint.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Car, color: 'text-blue-500', title: 'Detailed Calculator', desc: 'Supports car travel, flights, meals, energy, and recycling.' },
              { icon: Brain, color: 'text-purple-500', title: 'AI Expert Advice', desc: 'EcoBot provides contextual, data-rich recommendations.' },
              { icon: Flame, color: 'text-amber-500', title: 'Gamified Streaks', desc: 'Level up from Seedling to EcoHero and progress weekly challenges.' },
              { icon: Award, color: 'text-emerald-500', title: 'Badges & Rewards', desc: 'Earn badges by meeting streak and activity milestones.' }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="neo-flat p-8 rounded-[2rem] flex flex-col items-start hover:neo-pressed transition-all duration-300"
              >
                <div className={`neo-pressed-sm p-4 rounded-2xl mb-6 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center neo-flat p-12 lg:p-20 rounded-[3rem]">
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6 tracking-tight drop-shadow-sm">
            Ready to test <span className="text-primary">EcoTrack?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
            Jump into our live demo account to experience the neomorphic design, gamification, and AI Insights firsthand without creating an account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/login"
              className="neo-flat text-primary font-black px-10 py-5 rounded-[2rem] hover:neo-pressed active:neo-pressed transition-all flex items-center space-x-3 text-lg w-full sm:w-auto justify-center"
            >
              <PlayCircle className="h-6 w-6" />
              <span>Launch Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="neo-pressed mt-12 py-12 px-6 lg:px-12 text-center text-muted-foreground text-sm font-bold">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
          <div className="flex items-center space-x-2 neo-flat-sm px-4 py-2 rounded-full">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-black text-foreground uppercase tracking-widest">EcoTrack</span>
          </div>
          <div className="flex space-x-8">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="mailto:support@ecotrack.org" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
          <p>© 2026 EcoTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SproutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5 8-6.4 8-12a4 4 0 0 0-8 0c0 5.6 2.5 9.5 8 12Z" />
      <path d="M14 20c-5.5-2.5-8-6.4-8-12a4 4 0 0 1 8 0c0 5.6-2.5 9.5-8 12Z" />
    </svg>
  );
}
