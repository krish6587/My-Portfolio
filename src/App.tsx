import { useState, useEffect, useRef } from "react";
import { X, Mail, Copy, Check, Send, ArrowUpRight, Loader2 } from "lucide-react";

/* ── assets ── */
const PORTRAIT = "/krish.png";

/* ── data ── */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/krish6587" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/krish-ukande/" },
  { label: "Resume", href: "/resume.pdf" },
];

const SKILLS = {
  Frontend: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Next.js"],
  Backend: ["Node.js", "Express.js", "ASP.NET Core", "C#", "REST APIs", "GraphQL"],
  Database: ["MongoDB", "SQL Server", "PostgreSQL", "Firebase"],
  "Tools & DevOps": ["Git", "GitHub", "Docker", "Postman", "VS Code", "Figma"],
};

/* ── project types & defaults ── */
interface Project {
  id: string;
  title: string;
  desc: string;
  tech: string[];
  link: string;  // GitHub
  live: string;  // Live demo URL
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "pickleball-tournament",
    title: "Pickleball Tournament Management System",
    desc: "Full-stack tournament management application using React.js, Node.js, Express.js, and MongoDB. Implemented JWT authentication, Admin/Viewer roles, OTP verification, REST APIs, and a live ScoreSheet with serving rules, server rotation, and receiver calculations.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "JWT"],
    link: "https://github.com/krish6587",
    live: "",
  },
  {
    id: "data-analyzer",
    title: "Data Analyzer Web Application",
    desc: "Developed a web-based Data Analyzer using HTML, CSS, and JavaScript for CSV/Excel data analysis. Implemented data parsing, statistical analysis, and interactive visualizations using Chart.js, PapaParse, and XLSX.js.",
    tech: ["JavaScript", "HTML5", "CSS3", "Chart.js", "PapaParse", "XLSX.js"],
    link: "https://github.com/krish6587",
    live: "",
  },
  {
    id: "portfolio-website",
    title: "Editorial Portfolio Website",
    desc: "Personal portfolio featuring dark editorial aesthetic, dynamic marquee, custom project manager with live preview links, and interactive resume viewer.",
    tech: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    link: "https://github.com/krish6587",
    live: "",
  },
];

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem("portfolio_projects_v3");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PROJECTS;
}

function saveProjects(projects: Project[]) {
  localStorage.setItem("portfolio_projects_v3", JSON.stringify(projects));
}

/* ── intersection observer hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ════════════════════════════════════════════════════════════════ */
export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ── project management state ── */
  const [projectList, setProjectList] = useState<Project[]>(loadProjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", desc: "", tech: "", link: "", live: "" });

  const addProject = () => {
    if (!newProject.title.trim()) return;
    const p: Project = {
      id: Date.now().toString(),
      title: newProject.title.trim(),
      desc: newProject.desc.trim(),
      tech: newProject.tech.split(",").map((t) => t.trim()).filter(Boolean),
      link: newProject.link.trim() || "https://github.com/krish6587",
      live: newProject.live.trim(),
    };
    const updated = [p, ...projectList];
    setProjectList(updated);
    saveProjects(updated);
    setNewProject({ title: "", desc: "", tech: "", link: "", live: "" });
    setShowAddModal(false);
  };

  const removeProject = (id: string) => {
    const updated = projectList.filter((p) => p.id !== id);
    setProjectList(updated);
    saveProjects(updated);
  };

  const updateProjectLive = (id: string, liveUrl: string) => {
    const updated = projectList.map((p) => (p.id === id ? { ...p, live: liveUrl } : p));
    setProjectList(updated);
    saveProjects(updated);
  };

  /* ── contact form & copy state ── */
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("krishukande9@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://formsubmit.co/ajax/krishukande9@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email || "Not provided",
          message: contactForm.message,
          _subject: `New Portfolio Message from ${contactForm.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      const data = await response.json();
      if (response.ok && (data.success === "true" || data.success === true || response.status === 200)) {
        setSubmitStatus("success");
        setContactForm({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 8000);
      } else {
        throw new Error(data.message || "Failed to submit");
      }
    } catch (err) {
      console.error("Form submit error, falling back to mailto:", err);
      const subject = encodeURIComponent(`Portfolio Inquiry from ${contactForm.name}`);
      const body = encodeURIComponent(
        `Hi Krish,\n\n${contactForm.message}\n\n---\nFrom: ${contactForm.name}\nEmail: ${contactForm.email || "Not provided"}`
      );
      window.location.href = `mailto:krishukande9@gmail.com?subject=${subject}&body=${body}`;
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* reveal refs for each section */
  const about = useReveal();
  const skills = useReveal();
  const projects = useReveal();
  const contact = useReveal();

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="bg-black font-hn text-cream selection:bg-accent selection:text-[#0b0d10]">
      {/* ═══════════════  HERO  ═══════════════ */}
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0b0d10] flex flex-col">
        {/* Right Light Grey Polygon (Desktop) */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 hidden lg:block bg-[#d8d8d8]"
          style={{ clipPath: "polygon(46% 0, 100% 0, 100% 100%, 34% 100%)" }}
        />
        {/* Mobile / Tablet split */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 lg:hidden bg-[#d8d8d8]"
          style={{ clipPath: "polygon(0 52%, 100% 44%, 100% 100%, 0 100%)" }}
        />

        {/* ── Navbar ── */}
        <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 lg:px-16 pt-7 sm:pt-9 w-full select-none">
          {/* K.U Logo */}
          <a href="#" className="text-white font-black text-2xl tracking-tight hover:text-accent transition-colors duration-200">
            K<span className="text-accent">.</span>U
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px]">
            <a href="#about" className="nav-link text-neutral-800 font-semibold hover:text-black transition-colors">About</a>
            <a href="#skills" className="nav-link text-neutral-800 font-semibold hover:text-black transition-colors">Skills</a>
            <a href="#projects" className="nav-link text-neutral-800 font-semibold hover:text-black transition-colors">Portfolio</a>
            <a href="#contact" className="rounded-xl border-2 border-neutral-800 text-neutral-900 font-bold text-sm px-6 py-2.5 transition-all duration-200 hover:bg-black hover:text-white hover:border-black">
              Get in touch
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="lg:hidden z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none"
          >
            <div className="relative flex h-4 w-6 flex-col justify-between">
              <span className={`h-[2.5px] w-full bg-white transform transition-all duration-300 origin-center ${drawerOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-[2.5px] w-full bg-white transition-opacity duration-200 ${drawerOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`h-[2.5px] w-full bg-white transform transition-all duration-300 origin-center ${drawerOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </div>
          </button>
        </header>

        {/* ── Hero Grid ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 items-center">
          {/* Left: Text Content */}
          <div className="lg:col-span-5 flex flex-col justify-center py-10 lg:py-0 z-20">
            <h1 className="text-[2.8rem] sm:text-6xl xl:text-[4.5rem] font-black text-white tracking-tight leading-[1.18] pt-2 pb-1 anim-fade-up">
              Krish Kumar<br />Ukande<span className="text-accent">.</span>
            </h1>

            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mt-5 sm:mt-6 max-w-md anim-fade-up" style={{ animationDelay: "150ms" }}>
              B.Tech IT student building full-stack web applications across the MERN stack and .NET&nbsp;&mdash; from pixel-level UI to database architecture.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-8 sm:mt-10 anim-fade-up" style={{ animationDelay: "250ms" }}>
              <a
                href="#projects"
                className="btn-glow rounded-xl bg-accent text-[#06231a] font-bold text-sm px-7 py-3.5 transition-all duration-200 hover:bg-[#93edcf] hover:shadow-[0_0_24px_rgba(127,231,196,0.25)] hover:scale-[1.03] active:scale-95"
              >
                View my work
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Krish_Kumar_Ukande_Resume.pdf"
                className="rounded-xl border-2 border-neutral-700 text-white font-bold text-sm px-7 py-3.5 transition-all duration-200 hover:border-neutral-500 hover:bg-white/5 active:scale-95"
              >
                Download r&eacute;sum&eacute;
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mt-10 sm:mt-14 pt-8 border-t border-neutral-800/80 anim-fade-up" style={{ animationDelay: "400ms" }}>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-accent tracking-tight">2+</span>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">Full-stack projects shipped</p>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">2</span>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">Stacks&nbsp;&mdash; MERN &amp; .NET</p>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-accent tracking-tight">15+</span>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-snug">Technologies used</p>
              </div>
            </div>
          </div>

          {/* Right: Portrait */}
          <div className="lg:col-span-7 relative flex items-end justify-center lg:justify-center h-[52vh] sm:h-[62vh] lg:h-[86vh] overflow-hidden lg:overflow-visible">
            <img
              src={PORTRAIT}
              alt="Krish Kumar Ukande"
              className="h-[95%] sm:h-[98%] lg:h-[100%] w-auto max-w-full object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] select-none pointer-events-none anim-rise-in"
            />
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════  01 — ABOUT  ═══════════════ */}
      <section
        id="about"
        ref={about.ref}
        className="relative bg-[#0b0d10] px-6 sm:px-12 lg:px-16 py-24 sm:py-32"
      >
        <div className={`max-w-5xl mx-auto w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${about.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="font-mono text-xs text-accent tracking-wider mb-8">
            <span className="text-neutral-500">// </span>01 &mdash; About
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Bio */}
            <div className="lg:col-span-7 flex flex-col gap-5 text-neutral-400 text-[15px] sm:text-base leading-relaxed">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-sans">
                I build things for the <span className="text-accent">web</span>.
              </h2>
              <p>
                I'm a <strong className="text-white font-semibold">B.Tech Information Technology</strong> student who builds web applications that are both functional and considered &mdash; clean interfaces backed by solid architecture underneath.
              </p>
              <p>
                My work spans the <strong className="text-white font-semibold">MERN stack</strong> (MongoDB, Express, React, Node.js) and the <strong className="text-white font-semibold">.NET ecosystem</strong> (ASP.NET Core, C#, Entity Framework). I care equally about how an app looks and how it holds up under real use.
              </p>
              <p>
                Outside of coursework, I contribute to open-source and sharpen problem-solving on LeetCode.
              </p>

              <div className="flex gap-4 mt-3">
                <a
                  href="#contact"
                  className="btn-glow inline-flex items-center gap-2 rounded-lg bg-accent text-[#06231a] px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-[#93edcf] hover:scale-[1.03]"
                >
                  Get in touch
                </a>
                <a
                  href="/resume.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#22262c] text-white px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-[#14171c] hover:border-neutral-600"
                >
                  Download r&eacute;sum&eacute;
                </a>
              </div>
            </div>

            {/* Right Focus List */}
            <div className="lg:col-span-5 flex flex-col justify-center border-t border-[#22262c]">
              <div className="py-4 border-b border-[#22262c] flex justify-between items-center text-sm">
                <span className="font-semibold text-white">Frontend</span>
                <span className="text-neutral-400 text-xs sm:text-sm text-right font-mono">React, Next.js, TS</span>
              </div>
              <div className="py-4 border-b border-[#22262c] flex justify-between items-center text-sm">
                <span className="font-semibold text-white">Backend</span>
                <span className="text-neutral-400 text-xs sm:text-sm text-right font-mono">Node.js, Express, .NET</span>
              </div>
              <div className="py-4 border-b border-[#22262c] flex justify-between items-center text-sm">
                <span className="font-semibold text-white">Data</span>
                <span className="text-neutral-400 text-xs sm:text-sm text-right font-mono">MongoDB, PostgreSQL, SQL</span>
              </div>
              <div className="py-4 border-b border-[#22262c] flex justify-between items-center text-sm">
                <span className="font-semibold text-white">Currently</span>
                <span className="text-accent text-xs sm:text-sm text-right font-mono">Open to internships</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════  02 — STACK  ═══════════════ */}
      <section
        id="skills"
        ref={skills.ref}
        className="relative bg-[#0b0d10] px-6 sm:px-12 lg:px-16 py-24 sm:py-32"
      >
        <div className={`max-w-5xl mx-auto w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${skills.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="flex items-baseline justify-between mb-10 flex-wrap gap-2">
            <span className="font-mono text-xs text-accent tracking-wider">
              <span className="text-neutral-500">// </span>02 &mdash; Stack
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Skills &amp; technologies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#22262c] border border-[#22262c] rounded-xl overflow-hidden">
            {Object.entries(SKILLS).map(([category, items], ci) => (
              <div
                key={category}
                className="bg-[#0b0d10] p-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transitionDelay: skills.visible ? `${ci * 100}ms` : "0ms",
                  opacity: skills.visible ? 1 : 0,
                  transform: skills.visible ? "translateY(0)" : "translateY(16px)",
                }}
              >
                <h3 className="font-mono text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-4">
                  {category}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {items.map((skill) => (
                    <li key={skill} className="text-sm text-neutral-300 flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/80 shrink-0" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════  03 — SELECTED WORK  ═══════════════ */}
      <section
        id="projects"
        ref={projects.ref}
        className="relative bg-[#0b0d10] px-6 sm:px-12 lg:px-16 py-24 sm:py-32"
      >
        <div className={`max-w-5xl mx-auto w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${projects.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <div className="flex items-baseline justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="font-mono text-xs text-accent tracking-wider block mb-2">
                <span className="text-neutral-500">// </span>03 &mdash; Selected work
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Featured projects
              </h2>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg border border-[#22262c] px-4 py-2 text-xs font-semibold text-neutral-300 transition-all duration-200 hover:border-accent hover:text-accent flex items-center gap-1.5"
            >
              <span>+</span> Add Project
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {projectList.map((project, pi) => (
              <div
                key={project.id}
                className="card-hover group relative border border-[#22262c] rounded-xl p-6 sm:p-8 bg-[#14171c] transition-all duration-500 hover:border-neutral-700"
                style={{
                  transitionDelay: projects.visible ? `${pi * 120}ms` : "0ms",
                  opacity: projects.visible ? 1 : 0,
                  transform: projects.visible ? "translateY(0)" : "translateY(24px)",
                }}
              >
                {/* Delete Project */}
                <button
                  onClick={() => removeProject(project.id)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-md border border-neutral-800 bg-[#101317] text-neutral-500 hover:text-red-400 hover:border-red-900 transition-all flex items-center justify-center text-xs"
                  title="Remove project"
                >
                  ✕
                </button>

                {/* Header: Title and Index */}
                <div className="flex justify-between items-start gap-4 mb-3 pr-8">
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white group-hover:text-accent transition-colors duration-200">
                    {project.title}
                  </h3>
                  <span className="font-mono text-xs text-neutral-500 shrink-0">
                    0{pi + 1}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-[15px] text-neutral-400 leading-relaxed max-w-3xl mb-5">
                  {project.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs text-neutral-400 border border-[#22262c] px-2.5 py-1 rounded-md bg-[#0b0d10]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3">
                  {project.link && project.link !== "#" && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-4 py-2 rounded-lg border border-[#22262c] text-white transition-all duration-200 hover:border-accent hover:text-accent flex items-center gap-1"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {project.live ? (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-4 py-2 rounded-lg bg-accent/15 border border-accent/30 text-accent transition-all duration-200 hover:bg-accent hover:text-[#06231a]"
                    >
                      Live demo ↗
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        const url = prompt("Enter live demo URL:");
                        if (url) updateProjectLive(project.id, url);
                      }}
                      className="text-xs font-semibold px-4 py-2 rounded-lg border border-dashed border-[#22262c] text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition-all"
                    >
                      + Add live link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Add Project Modal ── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <div className="bg-[#14171c] border border-[#22262c] rounded-xl p-8 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold tracking-tight text-white mb-6">Add New Project</h3>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-[#0b0d10] border border-[#22262c] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                />
                <textarea
                  placeholder="Description"
                  value={newProject.desc}
                  onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0b0d10] border border-[#22262c] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors resize-none"
                />
                <input
                  type="text"
                  placeholder="Tech (comma separated, e.g. React, Node.js)"
                  value={newProject.tech}
                  onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                  className="w-full bg-[#0b0d10] border border-[#22262c] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                />
                <input
                  type="text"
                  placeholder="GitHub URL (optional)"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  className="w-full bg-[#0b0d10] border border-[#22262c] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                />
                <input
                  type="text"
                  placeholder="Live Demo URL (optional)"
                  value={newProject.live}
                  onChange={(e) => setNewProject({ ...newProject, live: e.target.value })}
                  className="w-full bg-[#0b0d10] border border-[#22262c] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-[#22262c] py-2.5 text-sm text-neutral-400 transition-all hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={addProject}
                  className="flex-1 rounded-lg bg-accent text-[#06231a] py-2.5 text-sm font-semibold transition-all hover:bg-[#93edcf]"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════  04 — CONTACT  ═══════════════ */}
      <footer
        id="contact"
        ref={contact.ref}
        className="relative bg-[#0b0d10] px-6 sm:px-12 lg:px-16 pt-24 sm:pt-28 pb-14"
      >
        <div className={`max-w-6xl mx-auto w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${contact.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
          <span className="font-mono text-xs text-accent tracking-wider block mb-3">
            <span className="text-neutral-500">// </span>04 &mdash; Contact
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
            {/* Left: Info & Quick Action Buttons */}
            <div className="lg:col-span-6 flex flex-col">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 font-sans leading-tight">
                Let's build something worth shipping.
              </h2>
              <p className="text-neutral-400 text-base sm:text-lg leading-relaxed mb-6">
                Open to internships, full-stack roles, freelance work, and collaborations. Whether you have a project in mind or just want to say hi, my inbox is always open.
              </p>

              {/* Status pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit mb-8">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for internships &amp; new opportunities (2026)
              </div>

              {/* Email CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 mb-6">
                <a
                  href="mailto:krishukande9@gmail.com"
                  className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-[#06231a] px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:bg-[#93edcf] hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(127,231,196,0.2)]"
                >
                  <Mail size={16} />
                  Email me
                </a>

                {/* Quick copy email button */}
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#22262c] bg-[#121519] text-white px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:border-neutral-600 hover:bg-[#181c22] active:scale-95"
                  title="Click to copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={16} className="text-accent" />
                      <span className="text-accent">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="text-neutral-400" />
                      <span className="font-mono text-xs sm:text-sm text-neutral-300">krishukande9@gmail.com</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social links row */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#22262c]/60">
                <span className="text-xs text-neutral-500 font-mono mr-2">Profiles:</span>
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#22262c] text-neutral-300 px-3.5 py-2 text-xs font-semibold transition-all duration-200 hover:text-white hover:border-neutral-500 hover:bg-[#14171c]"
                  >
                    {item.label}
                    <ArrowUpRight size={13} className="text-neutral-500" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Quick Direct Contact Form */}
            <div className="lg:col-span-6 bg-[#111418] border border-[#22262c] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">Send a direct message</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">I'll get back to you as soon as possible.</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Send size={14} />
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Sharma"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-[#22262c] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Your Email (optional)</label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-[#22262c] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Hi Krish, let's connect regarding a project..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-[#0b0d10] border border-[#22262c] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glow w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-[#06231a] py-3 text-sm font-bold transition-all duration-200 hover:bg-[#93edcf] hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:pointer-events-none shadow-[0_0_16px_rgba(127,231,196,0.15)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending directly to Krish...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send message</span>
                    </>
                  )}
                </button>

                {submitStatus === "success" && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 anim-fade-in">
                    <Check size={16} className="flex-shrink-0 mt-0.5 text-accent" />
                    <div>
                      <p className="font-semibold text-white">Message sent directly to Krish's Gmail!</p>
                      <p className="text-neutral-400 text-xs mt-0.5">Thank you for reaching out. I'll get back to you shortly.</p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 anim-fade-in">
                    <span>Opened your mail client as fallback! Or copy email directly from the button on the left.</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="border-t border-[#22262c] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
            <span>&copy; 2026 Krish Kumar Ukande. All rights reserved.</span>
            <span>Built with React, TypeScript &amp; a lot of coffee.</span>
          </div>
        </div>
      </footer>

      {/* ═══════════════  MOBILE DRAWER  ═══════════════ */}
      {/* Backdrop */}
      <div
        className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-500 bg-black/40 backdrop-blur-sm ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />

      {/* Panel */}
      <aside
        className={`sm:hidden fixed top-0 right-0 bottom-0 z-40 flex flex-col justify-between w-[80%] max-w-sm bg-[#141414] px-8 py-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeDrawer}
          className={`absolute right-6 top-6 text-cream focus:outline-none transition-all duration-300 ${
            drawerOpen
              ? "rotate-0 opacity-100 delay-[300ms]"
              : "rotate-90 opacity-0 pointer-events-none"
          }`}
        >
          <X size={26} strokeWidth={1.5} />
        </button>

        {/* Site Index */}
        <div className="mt-12 flex flex-col">
          <span
            className={`font-hn uppercase tracking-[0.2em] text-cream/50 text-xs mb-6 transform transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              drawerOpen
                ? "translate-y-0 opacity-100 delay-[250ms]"
                : "translate-y-4 opacity-0"
            }`}
          >
            Site Index
          </span>
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((item, i) => {
              const delay = 300 + i * 80;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeDrawer}
                  className={`font-hn text-4xl font-normal text-cream transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-60 ${
                    drawerOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                  style={{
                    transitionDelay: drawerOpen ? `${delay}ms` : "0ms",
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Find Me */}
        <div className="flex flex-col pt-8">
          <span
            className={`font-hn uppercase tracking-[0.2em] text-cream/50 text-xs mb-4 transform transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              drawerOpen
                ? "translate-y-0 opacity-100 delay-[500ms]"
                : "translate-y-4 opacity-0"
            }`}
          >
            Find Me
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {SOCIAL_LINKS.map((item, i) => {
              const delay = 550 + i * 60;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeDrawer}
                  className={`font-hn text-sm font-normal text-cream transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:opacity-60 ${
                    drawerOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: drawerOpen ? `${delay}ms` : "0ms",
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
