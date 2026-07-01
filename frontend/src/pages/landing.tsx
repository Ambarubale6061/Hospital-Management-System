import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import {
  Stethoscope,
  Menu,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  UserCheck2,
  CalendarCheck,
  Brain,
  Bone,
  Baby,
  Microscope,
  Syringe,
  Star,
  CheckCircle2,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: "15,000+", label: "Patients Treated" },
  { value: "120+", label: "Specialist Doctors" },
  { value: "18", label: "Departments" },
  { value: "24/7", label: "Emergency Care" },
];

const WHY_US = [
  {
    icon: HeartPulse,
    title: "24/7 Emergency Care",
    desc: "A dedicated emergency team, staffed around the clock.",
  },
  {
    icon: UserCheck2,
    title: "Expert Specialists",
    desc: "Board-certified doctors across 18 departments.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Hygiene",
    desc: "Hospital-grade protocols, audited every quarter.",
  },
  {
    icon: CalendarCheck,
    title: "Effortless Scheduling",
    desc: "Book or queue for a specialist in under a minute.",
  },
];

const SERVICES = [
  { icon: HeartPulse, name: "Cardiology", desc: "Heart health & cardiac care." },
  { icon: Brain, name: "Neurology", desc: "Brain & nervous system care." },
  { icon: Bone, name: "Orthopedics", desc: "Joint & sports injury care." },
  { icon: Baby, name: "Pediatrics", desc: "Newborn to adolescent care." },
  { icon: Microscope, name: "Oncology", desc: "Cancer screening & treatment." },
  { icon: Syringe, name: "General Medicine", desc: "Everyday family care." },
];

const PORTALS = [
  {
    role: "Administrator",
    icon: ShieldCheck,
    desc: "Oversee staff, departments, billing and hospital-wide operations.",
    accent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    role: "Doctor",
    icon: Stethoscope,
    desc: "Review your schedule, patient records and prescriptions.",
    accent: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    role: "Receptionist",
    icon: UserCheck2,
    desc: "Register patients, manage appointments and the front-desk queue.",
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    role: "Patient",
    icon: HeartPulse,
    desc: "Book appointments and view your records, prescriptions & bills.",
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "From check-in to discharge, everything felt organized and clearly explained.",
    name: "Priya Sharma",
    role: "Patient, Cardiology",
  },
  {
    quote:
      "Booking a specialist took less than a minute, and I never missed a follow-up.",
    name: "Daniel Reyes",
    role: "Patient, Orthopedics",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------------- */}
      {/* Utility bar                                                  */}
      {/* ---------------------------------------------------------- */}
      <div className="hidden md:block bg-foreground text-background text-xs">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Emergency: +1 (555) 019-2400
          </span>
          <span className="opacity-80">18 Departments · 120+ Specialists · 24/7 Care</span>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Navbar                                                       */}
      {/* ---------------------------------------------------------- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-card/95 backdrop-blur border-b border-border shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-lg tracking-tight">MediCore</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Hospital Management System</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <a href="#portal">
              <Button size="sm">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </a>
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-10">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="h-px bg-border my-3" />
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start mb-2">Sign In</Button>
                </Link>
                <a href="#portal" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-start">Get Started</Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/* Hero                                                         */}
      {/* ---------------------------------------------------------- */}
      <section id="home" className="relative isolate overflow-hidden bg-linear-to-b from-primary/5 to-background">
        {/* Signature: ECG pulse line, subtle, as the visual accent instead of a photo */}
        <svg
          className="absolute top-1/2 left-0 -translate-y-1/2 w-full text-primary/10 -z-10"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 100 H460 L495 100 L515 40 L540 160 L562 70 L580 100 H1200"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="max-w-2xl"
          >
            <Badge variant="secondary" className="mb-5">
              Trusted hospital network since 2004
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Care that moves at the speed of a heartbeat.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              Specialists, diagnostics and emergency response, connected in
              one system — so care teams never lose the thread.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#portal">
                <Button size="lg">
                  Book an Appointment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
              <a href="tel:+15550192400">
                <Button size="lg" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Line
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl"
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* About / Why choose us                                       */}
      {/* ---------------------------------------------------------- */}
      <section id="about" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="max-w-2xl mb-16"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Why MediCore</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              One system, built around the patient's timeline.
            </h2>
            <p className="mt-4 text-muted-foreground text-base">
              Every department runs on the same connected record, so nothing
              gets lost between a referral and a follow-up.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 hover-elevate"
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Services / Departments                                      */}
      {/* ---------------------------------------------------------- */}
      <section id="services" className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
          >
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Departments</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-xl">
                Specialist care, organized by department.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm">
              Six of 18 departments — the full directory is available once
              you're signed in.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl bg-card border border-border p-6 hover-elevate"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{s.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Portal / Login entry points                                 */}
      {/* ---------------------------------------------------------- */}
      <section id="portal" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Access Your Portal</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              One system, four ways in.
            </h2>
            <p className="mt-4 text-muted-foreground text-base">
              Every role gets a workspace built for their day — sign in below
              with your account to reach it.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTALS.map((p, i) => (
              <motion.div
                key={p.role}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
              >
                <Link href="/login">
                  <div className="h-full rounded-xl border border-border bg-card p-6 hover-elevate cursor-pointer flex flex-col">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center mb-5 ${p.accent}`}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-base mb-1.5">{p.role}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Sign in
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Testimonials                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="max-w-xl mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Patient Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Heard around the wards.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl bg-card border border-border p-6 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed flex-1">"{t.quote}"</p>
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CTA band                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
              Ready when you are.
            </h2>
            <p className="text-primary-foreground/80 mt-2 max-w-md">
              Register as a patient or sign in to an existing account to book
              your next visit.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Register as Patient
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Contact                                                      */}
      {/* ---------------------------------------------------------- */}
      <section id="contact" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="max-w-xl mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Get in Touch</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Visit, call or write to us.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: MapPin,
                title: "Location",
                lines: ["221B Wellness Avenue", "Piscataway, NJ 08854"],
              },
              {
                icon: Phone,
                title: "Phone",
                lines: ["Emergency: +1 (555) 019-2400", "Front Desk: +1 (555) 019-2100"],
              },
              {
                icon: Mail,
                title: "Email",
                lines: ["care@medicore-hms.com", "support@medicore-hms.com"],
              },
              {
                icon: Clock,
                title: "OPD Hours",
                lines: ["Mon – Sat: 8:00 AM – 8:00 PM", "Emergency: 24/7"],
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <c.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm text-muted-foreground leading-relaxed">{l}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Designer credit band                                        */}
      {/* ---------------------------------------------------------- */}
      <div className="border-t border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            Designed &amp; Built by{" "}
            <span className="font-semibold text-foreground">Ambar Ubale</span> — Software Engineer
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Footer                                                       */}
      {/* ---------------------------------------------------------- */}
      <footer className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">MediCore</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              A connected hospital management system for patients, doctors,
              receptionists and administrators — all in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                  {l.label}
                </a>
              ))}
              <Link href="/register" className="text-sm text-background/70 hover:text-background transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Departments</h4>
            <div className="flex flex-col gap-2.5">
              {SERVICES.slice(0, 5).map((s) => (
                <span key={s.name} className="text-sm text-background/70">{s.name}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-2.5 text-sm text-background/70">
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />Piscataway, NJ 08854</span>
              <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />+1 (555) 019-2400</span>
              <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />care@medicore-hms.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/60">
            <span>© {new Date().getFullYear()} MediCore Hospital Management System. All rights reserved.</span>
            <span>Emergency hotline available 24/7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}