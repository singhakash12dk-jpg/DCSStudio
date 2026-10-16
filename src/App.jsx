import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import emailjs from "@emailjs/browser";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const IMG_BASE = `${import.meta.env.BASE_URL}images/`;

/* Smart Image helper: automatically tries .png, .jpg, .jpeg so no image ever breaks */
function SmartImg({ name, alt = "", className = "", style = {}, onLoad, draggable = false }) {
  const cleanName = name.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  const extensions = [".png", ".jpg", ".jpeg", ".jpg.jpeg", ".webp"];
  const [extIndex, setExtIndex] = useState(0);

  const src = `${IMG_BASE}${cleanName}${extensions[extIndex]}`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
      onLoad={onLoad}
      onError={() => {
        if (extIndex < extensions.length - 1) {
          setExtIndex(extIndex + 1);
        }
      }}
    />
  );
}

/* Multi-Candidate Image Helper for Process Panels */
function SmartProcessImg({ candidates, alt = "", className = "", onResolved }) {
  const extensions = [".png", ".jpg", ".jpeg", ".webp"];
  const allUrls = useMemo(() => {
    const list = [];
    candidates.forEach((base) => {
      const clean = base.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      extensions.forEach((ext) => {
        list.push(`${IMG_BASE}${clean}${ext}`);
      });
    });
    return list;
  }, [candidates]);

  const [idx, setIdx] = useState(0);
  const currentSrc = encodeURI(allUrls[idx] || allUrls[0]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      draggable={false}
      onLoad={() => {
        if (onResolved) onResolved(currentSrc);
      }}
      onError={() => {
        if (idx < allUrls.length - 1) {
          setIdx(idx + 1);
        }
      }}
    />
  );
}

/* NAVBAR */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-container">
        <a href="#hero" className="nav-brand">Dreamcatcher Studios</a>
        <button
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#process" onClick={() => setMenuOpen(false)}>Process</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#team" onClick={() => setMenuOpen(false)}>Team</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      </div>
    </nav>
  );
}

/* HERO (CLEAN FULLSCREEN BACKGROUND VIDEO) */
function Hero() {
  const sectionRef = useRef();
  const videoWrapRef = useRef();

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = sectionRef.current;
        const vwrap = videoWrapRef.current;
        if (!el) return;
        const scroll = Math.max(0, window.scrollY);
        const fadeFactor = Math.max(0.15, window.innerHeight * 0.33);
        const progress = Math.min(1, scroll / fadeFactor);
        const opacity = String(1 - progress);
        try {
          el.style.opacity = opacity;
          if (vwrap) vwrap.style.opacity = opacity;
        } catch (e) {}
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div
        ref={videoWrapRef}
        className="hero-video-wrap"
        style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
      >
        <video
          src="./videos/facade.mp4"
          poster={`${IMG_BASE}facade.png`}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          controlsList="nodownload"
          disablePictureInPicture
          className="hero-bg-video"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onCanPlay={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
        />
      </div>
    </section>
  );
}

/* ABOUT */
function About() {
  const ref = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".about-inner > *", { clearProps: "all" });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="about-section" id="about" ref={ref}>
      <div className="about-inner">
        <div className="about-copy">
          <span className="section-label section-label-about">About Us</span>
          <h2 className="about-heading">
            Crafting Immersive<br />Digital Experiences
          </h2>
          <p className="about-text">
            At Dreamcatcher Studios, we are pioneers in the art of projection mapping,
            immersive installations, and interactive experiences. Founded with a passion for
            blending technology and creativity, we transform ordinary spaces into extraordinary
            visual spectacles that captivate audiences worldwide.
          </p>
          <p className="about-text">
            From large-scale building facades to intimate brand activations, our multidisciplinary
            team of artists, engineers, and storytellers works hand-in-hand with clients to bring
            bold visions to life. We harness the latest in real-time rendering, spatial computing,
            and audiovisual design to deliver experiences that leave lasting impressions.
          </p>
          <p className="about-text">
            Whether it&#39;s a product launch that demands the wow factor, an immersive room that
            transports visitors to another world, or a live event that fuses light, sound, and motion &mdash;
            Dreamcatcher Studios is where imagination meets execution.
          </p>
        </div>
        <div className="about-team-photo" aria-label="Dreamcatcher Studios team">
          <div className="about-team-photo-header">
            <span>OUR TEAM</span>
            <span>DREAMCATCHER STUDIOS</span>
          </div>
          <div className="about-team-collage">
            <div className="about-team-placeholder">
              <span>TEAM PHOTO</span>
              <small>IMAGE GOES HERE</small>
            </div>
          </div>
          <p className="about-team-caption">A space reserved for the people behind the work.</p>
        </div>
      </div>
    </div>
  );
}

/* SCROLLING IMAGE MARQUEE */
function ImageMarquee() {
  const row1 = [
    "facade",
    "PH3_4191",
    "Projection mapping",
    "WhatsApp Image 2026-04-08 at 1.50.34 PM",
    "Work01",
    "WhatsApp Image 2026-04-08 at 1.50.35 PM (1)",
    "product",
    "Work03",
    "WhatsApp Image 2026-04-08 at 1.50.36 PM",
    "Work",
    "Work05",
  ];

  const row2 = [
    "WhatsApp Image 2026-04-08 at 1.50.35 PM",
    "WhatsApp Image 2026-04-08 at 1.50.35 PM (2)",
    "Work02",
    "PH3_5237",
    "WhatsApp Image 2026-04-08 at 1.50.36 PM (1)",
    "Work04",
    "WhatsApp Image 2026-04-08 at 1.50.36 PM (2)",
    "Work06",
    "WhatsApp Image 2026-04-08 at 1.50.35 PM (3)",
    "Work08",
    "WhatsApp Image 2026-04-08 at 1.50.37 PM",
    "Work02",
  ];

  const renderRow = (images, direction) => {
    const doubled = [...images, ...images];
    return (
      <div className={`marquee-track marquee-${direction}`}>
        {doubled.map((name, i) => (
          <div key={i} className="marquee-item">
            <SmartImg alt={name} name={name} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="marquee-section">
      <div className="marquee-fade-left"></div>
      <div className="marquee-fade-right"></div>
      {renderRow(row1, "left")}
      {renderRow(row2, "right")}
    </section>
  );
}

/* SERVICES */
function Services() {
  const [video, setVideo] = useState(null);
  const ref = useRef();

  const services = [
    {
      id: "01",
      title: "PROJECTION\nMAPPING",
      kicker: "ARCHITECTURE MEETS IMAGINATION",
      desc: "Large-scale facade mapping • Building projections • Architectural lighting • Outdoor spectacles",
      img: "facade",
      vid: "./videos/facade.mp4",
      accent: "featured",
    },
    {
      id: "02",
      title: "BRAND\nEXPERIENCES",
      kicker: "BRANDS INTO EXPERIENCES",
      desc: "Product launches • Brand activations • Experiential marketing • Corporate events",
      img: "product",
      vid: "./videos/product.mp4",
      accent: "brand",
    },
    {
      id: "03",
      title: "IMMERSIVE\nINSTALLATIONS",
      kicker: "SPACES THAT CONNECT",
      desc: "Interactive rooms • Spatial experiences • Sensor-driven art • Museum installations",
      img: "interactive",
      vid: null,
      accent: "featured",
    },
    {
      id: "04",
      title: "CONTENT\nPRODUCTION",
      kicker: "STORIES FOR TOMORROW",
      desc: "Real-time rendering • Motion graphics • VFX • Anamorphic content • Visual packaging",
      img: "Robot",
      vid: "./videos/Robot_Intro_1.mp4",
      accent: "content",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".services-label",
        { x: -30, opacity: 0 },
        {
          scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
          x: 0,
          opacity: 1,
          duration: 0.8,
          immediateRender: false,
        }
      );
      gsap.fromTo(
        ".services-heading",
        { y: 50, opacity: 0 },
        {
          scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          immediateRender: false,
        }
      );
      const cards = ref.current?.querySelectorAll(".service-card");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { y: 80, opacity: 0 },
          {
            scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out",
            immediateRender: false,
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" className="services-section" ref={ref}>
      <div className="services-header">
        <div className="services-intro">
          <span className="section-label services-label">WHAT WE DO</span>
          <h2 className="section-heading services-heading">
            WE BUILD EXPERIENCES<br />THAT <span className="services-highlight">PEOPLE REMEMBER.</span>
          </h2>
        </div>

        <div className="services-copy">
          <p>
            From projection mapping to immersive environments, we combine technology,
            design and storytelling to create experiences that demand attention.
          </p>
          <div className="services-meta">
            <span>IDEAS</span>
            <span>TECHNOLOGY</span>
            <span>PEOPLE</span>
            <span>EXPERIENCES</span>
          </div>
        </div>
      </div>

      <div className="services-grid">
        {services.map((s, i) => {
          const hasVideo = Boolean(s.vid);
          return (
            <article
              key={i}
              className={`service-card service-card--${s.accent}${i > 1 ? "small" : ""}`}
              onClick={() => s.vid && setVideo(s.vid)}
            >
              <div className="service-media">
                <SmartImg alt={s.title} className="service-thumb-image" name={s.img} />
                {hasVideo && (
                  <video
                    src={s.vid}
                    muted
                    loop
                    playsInline
                    controlsList="nodownload"
                    disablePictureInPicture
                    className="service-video-overlay"
                    onMouseEnter={(e) => e.target.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  />
                )}
              </div>

              <div className="service-card-content">
                <div className="service-topline">
                  <span className="service-number">{s.id}</span>
                  <span className="service-kicker">{s.kicker}</span>
                </div>

                <h3>{s.title}</h3>
                <p>{s.desc}</p>

                <button className="service-cta" type="button">
                  EXPLORE SERVICE <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="services-footer">
        <span>OUR SERVICES</span>
        <span className="services-footer-index">01 — 04</span>
        <span>EXPERIENCES BEYOND THE ORDINARY</span>
      </div>

      {video && (
        <div className="fullscreen" onClick={() => setVideo(null)}>
          <video
            src={video}
            autoPlay
            controls
            controlsList="nodownload"
            disablePictureInPicture
          />
        </div>
      )}
    </section>
  );
}

/* ============================================================================
   PROCESS SECTION (SUBTLE, BRIEF PAUSE AT THE END)
   ============================================================================ */
function ProcessSection() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const resolvedUrlsRef = useRef({});
  const [previewImgUrl, setPreviewImgUrl] = useState(null);

  const steps = useMemo(
    () => [
      {
        num: "01",
        title: "CONCEPT",
        desc: "Every spectacle begins on the drawing board — mapping proportions, galaxy contours, and hand-drawn light studies into a visual blueprint.",
        tags: ["SKETCH", "EXPLORE", "ENVISION"],
        imageCandidates: ["Concept",],
      },
      {
        num: "02",
        title: "3D & MOTION",
        desc: "Transforming 2D concepts into accurate 3D architectural geometry, dynamic wireframes, and fluid motion studies tailored to the structure.",
        tags: ["MODEL", "ANIMATE", "REFINE"],
        imageCandidates: [
          "3d and Motion",
          "3D and Motion",
          "3d & Motion",
          "3D & Motion",
          "3d and motion",
          "3D_and_Motion",
        ],
      },
      {
        num: "03",
        title: "CONTENT",
        desc: "Crafting high-resolution visual sequences, custom VFX, and multi-layered compositions that breathe emotion and narrative into every frame.",
        tags: ["DESIGN", "CREATE", "COMPOSE"],
        imageCandidates: ["Content",],
      },
      {
        num: "04",
        title: "MAPPING",
        desc: "Aligning digital grids to physical architecture with millimeter accuracy — warping, edge-blending, and calibrating light across every surface contour.",
        tags: ["CALIBRATE", "ALIGN", "MAP"],
        imageCandidates: ["Mapping",],
      },
      {
        num: "05",
        title: "INSTALLATION",
        desc: "On-site engineering and deployment — rigging high-lumen projection arrays, configuring media servers, and stress-testing systems before showtime.",
        tags: ["SETUP", "TEST", "EXECUTE"],
        imageCandidates: ["Installation"],
      },
      {
        num: "06",
        title: "LIVE EXPERIENCE",
        desc: "The moment light meets architecture in front of a live audience — igniting wonder, engaging the senses, and creating memories that last.",
        tags: ["IGNITE", "ENGAGE", "INSPIRE"],
        imageCandidates: ["Live Execution"],
      },
    ],
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      const section = sectionRef.current;
      if (!track || !viewport || !section) return;

      const getScrollAmount = () => {
        const trackLeft = Number.parseFloat(getComputedStyle(track).marginLeft) || 0;
        return Math.max(0, trackLeft + track.scrollWidth - viewport.clientWidth);
      };

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(1, Math.ceil(getScrollAmount()))}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      timeline.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <div className="process-pinned-wrap">
        <div className="process-top-header">
          <div>
            <span className="section-label">How We Work</span>
            <h2 className="section-heading process-heading">
              FROM VISION TO <span className="process-highlight">REALITY</span>
            </h2>
          </div>
          <div className="process-scroll-hint">
            <span>SCROLL TO EXPLORE ALL SIX STAGES</span>
            <div className="process-progress-bar">
              <div className="process-progress-fill" ref={progressRef} />
            </div>
          </div>
        </div>

        <div className="process-slider-viewport" ref={viewportRef}>
          <div className="process-merged-track" ref={trackRef}>
            {steps.map((step, i) => {
              const hasImage = Boolean(step.imageCandidates);
              return (
                <article
                  key={i}
                  className={`process-merged-panel ${
                    hasImage ? "process-merged-panel--with-image" : "process-merged-panel--text-only"
                  }`}
                  onClick={() => {
                    if (hasImage) {
                      const fallback = `${IMG_BASE}${step.imageCandidates[0]}.png`;
                      setPreviewImgUrl(resolvedUrlsRef.current[step.num] || encodeURI(fallback));
                    }
                  }}
                  title={hasImage ? `Click to view ${step.title} artwork` : ""}
                >
                  {hasImage && (
                    <SmartProcessImg
                      alt={`${step.num} ${step.title}`}
                      candidates={step.imageCandidates}
                      className="process-concept-full-img"
                      onResolved={(url) => {
                        resolvedUrlsRef.current[step.num] = url;
                      }}
                    />
                  )}

                  {!hasImage && <div className="process-panel-scrim" />}

                  <div className="process-panel-content">
                    <div className="process-panel-bottom">
                      <div className="process-node-dot-wrap">
                        <span className="process-node-dot" />
                      </div>
                      <ul className="process-panel-keywords">
                        {step.tags.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {previewImgUrl && (
        <div className="fullscreen" onClick={() => setPreviewImgUrl(null)}>
          <img src={previewImgUrl} alt="Process Stage Visualization" />
        </div>
      )}
    </section>
  );
}

/* FULL WORK GALLERY */
function WorkGallery({ onBack }) {
  const [image, setImage] = useState(null);
  const work = [
    ["facade", "Facade Mapping", "Projection Mapping"],
    ["Projection mapping", "Projection Mapping", "Architecture / Light"],
    ["product", "Brand Experiences", "Brand Activation"],
    ["interactive", "Immersive Installations", "Spatial Experiences"],
    ["Robot", "Content Production", "Motion / Real-time"],
    ["PH3_4191", "Live Visuals", "Event Experience"],
    ["PH3_5237", "Spatial Storytelling", "Installation"],
    ["Work", "Visual Architecture", "Digital Art"],
    ["Work01", "Light and Form", "Experience Design"],
    ["Work02", "Interactive Worlds", "Immersive Media"],
    ["Work03", "Future Spaces", "Content Design"],
    ["Work04", "Brand in Motion", "Visual Identity"],
    ["Work05", "Night Projection", "Projection Mapping"],
    ["Work06", "Atmospheric Light", "Live Production"],
    ["Work08", "Digital Environment", "Immersive Art"],
    ["WhatsApp Image 2026-04-08 at 1.50.34 PM", "The Experience", "Brand World"],
    ["WhatsApp Image 2026-04-08 at 1.50.35 PM", "Built for Wonder", "Spatial Design"],
    ["WhatsApp Image 2026-04-08 at 1.50.36 PM", "Signal / Space", "Interactive Media"],
    ["WhatsApp Image 2026-04-08 at 1.50.37 PM", "In the Moment", "Live Experience"],
  ];

  return (
    <main className="work-gallery-page">
      <div className="work-gallery-topbar">
        <button className="work-gallery-back" type="button" onClick={onBack}>
          <span aria-hidden="true">&#8592;</span> Back to home
        </button>
        <span className="work-gallery-index">DREAMCATCHER / WORK 001</span>
      </div>
      <header className="work-gallery-header">
        <span className="section-label">Selected Work</span>
        <h1>OUR <em>WORK</em></h1>
        <p>
          A selection of projection mapping, immersive environments, and visual experiences built
          for spaces that deserve to be remembered.
        </p>
      </header>
      <div className="work-gallery-grid">
        {work.map(([name, title, category], index) => (
          <button
            className={`work-gallery-item ${index % 5 === 0 ? "work-gallery-item-wide" : ""}`}
            key={name}
            type="button"
            onClick={() => setImage(name)}
          >
            <SmartImg alt={title} name={name} />
            <span className="work-gallery-item-shade" />
            <span className="work-gallery-item-info">
              <small>
                {String(index + 1).padStart(2, "0")} / {category}
              </small>
              <strong>{title}</strong>
            </span>
          </button>
        ))}
      </div>
      {image && (
        <div className="fullscreen" onClick={() => setImage(null)}>
          <SmartImg alt="Full View" name={image} />
        </div>
      )}
    </main>
  );
}

/* ============================================================================
   TEAM SECTION (SUBTLE, BRIEF PAUSE AT THE END)
   ============================================================================ */
function Team() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const team = useMemo(
    () => [
      {
        name: "Aman Jajoria",
        role: "Founder & Creative Director",
        img: "Aman Jajoria",
        responsibilities: [
          "Overall creative vision and direction for all projects",
          "Client relationship management and project strategy",
          "Leading large-scale projection mapping productions",
          "Overseeing content creation and visual storytelling",
          "Business development and brand partnerships",
          "Mentoring the creative team and fostering innovation",
        ],
      },
      {
        name: "Shalini Singh",
        role: "Business Development Manager",
        img: "Shalini Singh",
        responsibilities: [
          "Identifying and pursuing new business opportunities and market trends",
          "Building and maintaining strong relationships with clients and partners",
          "Developing strategic partnerships and collaborations",
          "Preparing proposals and pitching services to prospective clients",
          "Managing client accounts and ensuring satisfaction",
          "Tracking sales metrics and reporting on business growth",
        ],
      },
      {
        name: "Nishant Kumar",
        role: "Project Manager",
        img: "Nishant Kumar",
        responsibilities: [
          "Planning, scheduling, and organizing all project phases",
          "Managing project timelines, budgets, and resources",
          "Coordinating between creative and technical teams",
          "Risk management and problem-solving during production",
          "Regular client communication and status updates",
          "Ensuring projects are delivered on time and within scope",
        ],
      },
      {
        name: "Sonali Srivastava",
        role: "Senior Compositing/Motion Graphics Artist",
        img: "Sonali Srivastava",
        responsibilities: [
          "Creating complex visual effects and motion graphics sequences",
          "Compositing multiple layers and elements for final output",
          "Mentoring junior artists and overseeing quality standards",
          "Developing innovative visual solutions for client briefs",
          "Color grading and post-production refinement",
          "Leading the motion graphics team on high-profile projects",
        ],
      },
      {
        name: "Dinkar Rav",
        role: "Motion Graphic Artist",
        img: "Dinkar Rav",
        responsibilities: [
          "Designing and animating motion graphics for various media",
          "Creating dynamic visual content for projection mapping",
          "Collaborating with the creative team on visual concepts",
          "Producing promotional videos and brand animations",
          "Assisting with real-time rendering and live performance content",
          "Contributing to content libraries and asset management",
        ],
      },
      {
        name: "Sonia Saini",
        role: "Creative Producer",
        img: "Sonia Saini",
        responsibilities: [
          "Overseeing creative production processes from start to finish",
          "Coordinating between departments and managing creative workflows",
          "Ensuring brand consistency and quality across all deliverables",
          "Managing content calendars and production schedules",
          "Problem-solving and optimizing production efficiency",
          "Collaborating with clients to refine creative direction",
        ],
      },
      {
        name: "Aman Kumar",
        role: "Unreal Engine Artist",
        img: "Aman Kumar",
        responsibilities: [
          "Developing real-time environments and interactive experiences in Unreal Engine",
          "Creating high-performance 3D assets optimized for live rendering",
          "Implementing visual effects and lighting for immersive experiences",
          "Troubleshooting technical issues and optimizing performance",
          "Collaborating with designers to bring concepts to life",
          "Developing custom tools and workflows for production efficiency",
        ],
      },
      {
        name: "Akash Singh",
        role: "3D Rigging Artist",
        img: "Akash Singh",
        responsibilities: [
          "Creating and implementing complex character and prop rigging systems",
          "Developing skeletal structures and control rigs for animation",
          "Troubleshooting rigging issues and optimizing rig performance",
          "Collaborating with modelers and animators for seamless workflows",
          "Setting up deformers and constraint systems for realistic movement",
          "Creating rigging documentation and maintaining best practices",
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getScrollAmount = () => {
        const leftMargin = track.offsetLeft || 0;
        const totalRightEdge = leftMargin + track.scrollWidth;
        return Math.max(0, totalRightEdge - window.innerWidth + 80);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(getScrollAmount() * 1.15 + 120)}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      tl.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        duration: 0.96,
      });

      tl.to({}, { duration: 0.04 });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="team-scroll-section" id="team" ref={sectionRef}>
      <div className="team-pinned-wrap">
        <div className="team-top-header">
          <div>
            <span className="section-label team-label">The Visionaries</span>
            <h2 className="section-heading team-heading">OUR TEAM</h2>
          </div>

          <div className="process-scroll-hint">
            <span>SCROLL TO MEET THE TEAM (01 — 0{team.length})</span>
            <div className="process-progress-bar">
              <div className="process-progress-fill" ref={progressRef} />
            </div>
          </div>
        </div>

        <div className="team-scroll-viewport" ref={viewportRef}>
          <div className="team-scroll-track" ref={trackRef}>
            {team.map((member, i) => (
              <article
                key={i}
                className="team-slide-card"
                onClick={() => setSelectedMember(member)}
              >
                <div className="team-slide-img-wrap">
                  <SmartImg alt={member.name} draggable={false} name={member.img} />
                  <div className="team-slide-overlay" />
                  <span className="team-slide-index">0{i + 1}</span>
                </div>

                <div className="team-slide-body">
                  <span className="team-slide-role">{member.role}</span>
                  <h3 className="team-slide-name">{member.name}</h3>
                  <ul className="team-slide-highlights">
                    {member.responsibilities.slice(0, 3).map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="team-slide-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(member);
                    }}
                  >
                    VIEW PROFILE <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {selectedMember && (
        <div className="team-modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <button className="team-modal-close" onClick={() => setSelectedMember(null)} aria-label="Close">
              &times;
            </button>
            <div className="team-modal-header">
              <SmartImg alt={selectedMember.name} className="team-modal-img" name={selectedMember.img} />
              <div>
                <h3 className="team-modal-name">{selectedMember.name}</h3>
                <span className="team-modal-role">{selectedMember.role}</span>
              </div>
            </div>
            <h4 className="team-modal-subtitle">Key Responsibilities</h4>
            <ul className="team-modal-list">
              {selectedMember.responsibilities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

/* CONTACT */
function Contact() {
  const ref = useRef();
  const formRef = useRef();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    emailjs
      .sendForm("service_00kooet", "template_slxtvgm", formRef.current, "4dDSYjkqhA0pvPyjh")
      .then(() => {
        setSent(true);
        setSending(false);
        formRef.current.reset();
        setTimeout(() => setSent(false), 5000);
      })
      .catch(() => {
        setSending(false);
        alert("Something went wrong. Please try again.");
      });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-label",
        { x: -30, opacity: 0 },
        {
          scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
          x: 0,
          opacity: 1,
          duration: 0.8,
          immediateRender: false,
        }
      );
      gsap.fromTo(
        ".contact-heading",
        { y: 60, opacity: 0 },
        {
          scrollTrigger: { trigger: ref.current, start: "top 85%", toggleActions: "play none none none" },
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          immediateRender: false,
        }
      );
      gsap.fromTo(
        ".form-group, .form-row",
        { y: 40, opacity: 0 },
        {
          scrollTrigger: { trigger: ".contact-form", start: "top 90%", toggleActions: "play none none none" },
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
        }
      );
      gsap.fromTo(
        ".contact-form button",
        { y: 30, opacity: 0 },
        {
          scrollTrigger: { trigger: ".contact-form", start: "top 85%", toggleActions: "play none none none" },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="contact-section" id="contact" ref={ref}>
      <div className="contact-inner">
        <span className="section-label contact-label">Get In Touch</span>
        <h2 className="contact-heading">
          Let&apos;s Create<br />
          <span className="contact-heading-highlight">Something Unreal</span>
        </h2>
        <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" name="from_name" placeholder="Aman Jajoria" required />
            </div>
            <div className="form-group">
              <label>Brand / Company</label>
              <input type="text" name="company" placeholder="Your brand name" required />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="from_email" placeholder="you@yourbrand.com" required />
          </div>
          <div className="form-group">
            <label>Project Type</label>
            <select name="project_type" required>
              <option value="">Select a discipline</option>
              <option value="projection_mapping">Projection Mapping</option>
              <option value="brand_experiences">Brand Experiences</option>
              <option value="immersive_installations">Immersive Installations</option>
              <option value="content_production">Content Production</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tell us about the project</label>
            <textarea
              rows="5"
              name="message"
              placeholder="Describe the space, the brand objective, the event date if known, and any other context that helps us understand the scale..."
              required
            />
          </div>
          <button type="submit" disabled={sending}>
            <span>{sent ? "Message Sent ✓" : sending ? "Sending..." : "SEND INQUIRY"}</span>
            {!sent && !sending && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <p className="contact-disclaimer">No spam. No newsletters. Just a reply about your project.</p>
        </form>

        <div className="map-section">
          <div className="map-address">
            <span className="section-label">Our Location</span>
            <p className="address-text">
              3rd Floor, Dreamcatcher Studios<br />
              D-82, Sector 6<br />
              Noida, Uttar Pradesh 201301
            </p>
            <div className="contact-socials">
              <a
                href="https://www.instagram.com/dreamcatcherstudios19/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon social-ig"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <radialGradient id="igGrad" cx="30%" cy="107%" r="150%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="5%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#igGrad)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="url(#igGrad)" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.25" fill="url(#igGrad)" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@dreamcatcherstudios19"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="social-icon social-yt"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"
                    fill="#FF0000"
                  />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
                </svg>
              </a>
              <a
                href="https://in.linkedin.com/company/dreamcatcher-studios"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-icon social-li"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="1" width="22" height="22" rx="3" fill="#0A66C2" />
                  <path
                    d="M8 10v8M8 7v.01M12 18v-5a2 2 0 1 1 4 0v5M16 18v-5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="7" r="1" fill="#fff" />
                  <rect x="6.5" y="10" width="3" height="8" rx="0.5" fill="#fff" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/dreamcatcherstudios07"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-icon social-fb"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="1" width="22" height="22" rx="3" fill="#1877F2" />
                  <path
                    d="M16.5 3.5H14c-1.66 0-3 1.34-3 3v2h-2v3h2v7h3v-7h2.5l.5-3H14v-2c0-.55.45-1 1-1h1.5V3.5z"
                    fill="#fff"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="map-embed">
            <iframe
              title="Dreamcatcher Studios Location"
              src="https://www.google.com/maps?q=3rd+Floor,+Dreamcatcher+Studios,+D-82,+Sector+6,+Noida,+Uttar+Pradesh+201301&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* FOOTER */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand-col">
          <SmartImg alt="Dreamcatcher Studios Logo" className="footer-logo" name="logo"/>
          <span className="footer-brand-name">
            DREAMCATCHER<br />STUDIOS
          </span>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Dreamcatcher Studios.<br />All rights reserved.
          </p>
        </div>
        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#hero">Home</a>
            <a href="#process">Work</a>
            <a href="#process">Process</a>
            <a href="#about">About</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a href="#services">Projection Mapping</a>
            <a href="#services">Brand Experiences</a>
            <a href="#services">Immersive Installations</a>
            <a href="#services">Content Production</a>
          </div>
          <div className="footer-col">
            <h4>Location</h4>
            <p>
              3rd Floor, Dreamcatcher Studios<br />
              D-82, Sector 6<br />
              Noida, Uttar Pradesh 201301
            </p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>Designed with passion by Dreamcatcher Studios</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   EXACT 3D VINTAGE PROJECTOR MATCHING REFERENCE IMAGE
   - Extruded metallic reels with 6 circular cutout holes
   - Silver-trimmed rectangular body + top warm highlight
   - Side control box with dial, buttons & left handle tube
   - Front square stepped matte-box lens hood
   - Lower pedestal disc base + angled rod
   ============================================================================ */
function PerforatedReel3D({ position, speed = 1.6, scale = 1 }) {
  const reelRef = useRef();

  // Create a 3D extruded reel face with 6 circular cutout holes
  const reelGeometry = useMemo(() => {
    const outerRadius = 0.82;
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Center hub hole
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, 0.16, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    // 6 circular cutouts around the reel face
    const holeCount = 6;
    const holeRingRadius = 0.48;
    const holeRadius = 0.19;
    for (let i = 0; i < holeCount; i++) {
      const angle = (i / holeCount) * Math.PI * 2;
      const hx = Math.cos(angle) * holeRingRadius;
      const hy = Math.sin(angle) * holeRingRadius;
      const hole = new THREE.Path();
      hole.absarc(hx, hy, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 32,
    });
  }, []);

  useFrame((_, delta) => {
    if (reelRef.current) {
      reelRef.current.rotation.z -= delta * speed;
    }
  });

  return (
    <group position={position} scale={scale} ref={reelRef}>
      {/* Front Perforated Brushed-Silver Flange */}
      <mesh geometry={reelGeometry} position={[0, 0, 0.07]}>
        <meshStandardMaterial color="#b8b0a4" metalness={0.88} roughness={0.28} />
      </mesh>

      {/* Back Perforated Brushed-Silver Flange */}
      <mesh geometry={reelGeometry} position={[0, 0, -0.11]}>
        <meshStandardMaterial color="#9e9589" metalness={0.88} roughness={0.32} />
      </mesh>

      {/* Outer Thick Metallic Rim */}
      <mesh position={[0, 0, 0.09]}>
        <torusGeometry args={[0.82, 0.035, 16, 48]} />
        <meshStandardMaterial color="#d0c8bc" metalness={0.92} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, -0.09]}>
        <torusGeometry args={[0.82, 0.035, 16, 48]} />
        <meshStandardMaterial color="#b0a79b" metalness={0.92} roughness={0.25} />
      </mesh>

      {/* Warm Amber/Copper Film Spool Core Inside the Reel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.56, 0.56, 0.14, 36]} />
        <meshStandardMaterial
          color="#5a3214"
          emissive="#3d1e05"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* Center Metallic Spindle Cap */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.24, 24]} />
        <meshStandardMaterial color="#c8c0b4" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Projector3DScene() {
  const groupRef = useRef();
  const modelRef = useRef();
  const coolFillRef = useRef();
  const { size } = useThree();
  const isMobile = size.width <= 768;
  const baseY = isMobile ? -0.62 : -0.38;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle breathing motion while keeping the exact reference angle locked
      groupRef.current.position.y = baseY + Math.sin(t * 1.2) * 0.012;
    }
    if (coolFillRef.current) {
      coolFillRef.current.intensity = 2.1 + Math.sin(t * 1.4) * 0.35;
    }
  });

  useEffect(() => {
    modelRef.current?.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, []);

  return (
    <group
      ref={groupRef}
      position={[isMobile ? 0 : -1.25, baseY, 0.65]}
      rotation={[0.04, 0.42, -0.02]}
      scale={isMobile ? 0.38 : 0.58}
    >
      {/* Warm Golden Rim & Top Key Lights Matching Reference Highlights */}
      <ambientLight intensity={0.48} color="#ffdfc2" />
      <spotLight
        position={[-0.4, 3.2, 1.2]}
        intensity={24}
        angle={0.65}
        penumbra={0.7}
        color="#ffdf9e"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <pointLight position={[3.5, 0.5, 1.5]} intensity={5.2} distance={10} color="#ffd28a" />
      <pointLight position={[-0.2, -1.35, 0.8]} intensity={4.2} distance={4} color="#ffae42" />
      <pointLight
        ref={coolFillRef}
        position={[2.6, 1.1, 2.4]}
        intensity={2.1}
        distance={7}
        color="#a9d8ff"
      />
      <pointLight position={[-2.8, 1.8, -1.5]} intensity={3.2} distance={7} color="#ffbd72" />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#ffe4bd"
          position={[0, 4, -3]}
          scale={[5, 2.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#b5d9ff"
          position={[-4, 1, 2]}
          scale={[1, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#ffb85e"
          position={[4, -1, -2]}
          scale={[1, 3, 1]}
        />
      </Environment>
      <ContactShadows
        position={[0, -1.48, 0.05]}
        scale={4.2}
        opacity={0.34}
        blur={2.6}
        far={2.5}
        color="#b87935"
      />

      {/* 1. MAIN RECTANGULAR PROJECTOR BODY WITH SILVER TRIM */}
      <group position={[0, 0, 0]} ref={modelRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.65, 1.02, 0.72]} />
          <meshStandardMaterial color="#efe5d2" metalness={0.28} roughness={0.42} />
        </mesh>

        {/* Bright Metallic Silver Beveled Trim Frame */}
        <mesh position={[0, 0, 0.365]}>
          <boxGeometry args={[1.68, 1.05, 0.02]} />
          <meshStandardMaterial color="#8c8478" metalness={0.92} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, 0.38]}>
          <boxGeometry args={[1.6, 0.97, 0.015]} />
          <meshStandardMaterial color="#d9c9ad" metalness={0.35} roughness={0.48} />
        </mesh>

        {/* Top Specular Highlight Plate */}
        <mesh position={[-0.15, 0.525, 0]}>
          <boxGeometry args={[1.55, 0.02, 0.68]} />
          <meshStandardMaterial color="#e8d8b8" metalness={0.96} roughness={0.12} />
        </mesh>

        {/* 2. PROTRUDING SIDE CONTROL BOX, DIAL, BUTTONS & HANDLE TUBE */}
        <group position={[0.18, -0.02, 0.48]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.52, 0.68, 0.24]} />
            <meshStandardMaterial color="#e8dcc7" metalness={0.28} roughness={0.42} />
          </mesh>

          <mesh position={[0.14, 0.1, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
            <meshStandardMaterial color="#9e9486" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0.14, 0.1, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
            <meshStandardMaterial color="#9a7043" metalness={0.62} roughness={0.38} />
          </mesh>

          <mesh position={[0.09, -0.1, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.04, 16]} />
            <meshStandardMaterial color="#b8afa0" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[0.19, -0.1, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.04, 16]} />
            <meshStandardMaterial color="#b8afa0" metalness={0.95} roughness={0.2} />
          </mesh>

          <mesh position={[-0.42, 0.02, 0.04]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.09, 0.52, 24]} />
            <meshStandardMaterial color="#cdbb9d" metalness={0.55} roughness={0.38} />
          </mesh>
        </group>

        {/* 3. STEPPED SQUARE MATTE-BOX LENS HOOD AT THE FRONT */}
        <group position={[0.98, 0.02, 0]}>
          <mesh position={[-0.06, -0.02, 0.12]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.14, 0.32, 24]} />
            <meshStandardMaterial color="#d8c8ae" metalness={0.72} roughness={0.34} />
          </mesh>

          <mesh position={[0.12, 0.06, -0.05]}>
            <boxGeometry args={[0.28, 0.56, 0.56]} />
            <meshStandardMaterial color="#e8ddca" metalness={0.42} roughness={0.4} />
          </mesh>
          <mesh position={[0.26, 0.06, -0.05]}>
            <boxGeometry args={[0.08, 0.64, 0.64]} />
            <meshStandardMaterial color="#f4ead8" metalness={0.48} roughness={0.34} />
          </mesh>

          <pointLight position={[0.35, 0.0, 0.0]} intensity={5.0} distance={6} color="#ffda8e" />
        </group>

        {/* 4. SUPPORT ARMS & TWO PERFORATED SILVER FILM REELS ON TOP */}
        <mesh position={[-0.48, 0.72, 0]} rotation={[0, 0, 0.22]}>
          <boxGeometry args={[0.12, 0.65, 0.08]} />
          <meshStandardMaterial color="#d7c7ad" metalness={0.78} roughness={0.28} />
        </mesh>
        <mesh position={[0.38, 0.72, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.12, 0.65, 0.08]} />
          <meshStandardMaterial color="#d7c7ad" metalness={0.78} roughness={0.28} />
        </mesh>

        {/* Rear/Left Perforated Reel */}
        <PerforatedReel3D position={[-0.58, 1.38, 0.06]} scale={0.96} speed={1.5} />

        {/* Front/Right Perforated Reel */}
        <PerforatedReel3D position={[0.42, 1.34, -0.04]} scale={0.88} speed={1.5} />

        {/* 5. BOTTOM PEDESTAL DISC BASE & ANGLED TILT ROD */}
        <group position={[-0.12, -0.78, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.28, 24]} />
            <meshStandardMaterial color="#d4c3a7" metalness={0.7} roughness={0.36} />
          </mesh>

          <mesh position={[-0.22, -0.02, 0.28]} rotation={[0.25, 0, -0.52]}>
            <cylinderGeometry args={[0.022, 0.022, 0.75, 16]} />
            <meshStandardMaterial color="#8c8275" metalness={0.92} roughness={0.22} />
          </mesh>

          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.68, 0.72, 0.22, 40]} />
            <meshStandardMaterial color="#e6d7bf" metalness={0.8} roughness={0.32} />
          </mesh>
          <mesh position={[0, -0.26, 0]}>
            <cylinderGeometry args={[0.73, 0.73, 0.04, 40]} />
            <meshStandardMaterial color="#d4a056" metalness={0.95} roughness={0.18} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef();

  // Subtle dark film dust specks on the blank screen matching the reference image
  const dustSpecks = useMemo(
    () => [
      { left: "24%", top: "38%", size: "3px", delay: "0.1s" },
      { left: "51%", top: "27%", size: "3.5px", delay: "0.4s" },
      { left: "48%", top: "63%", size: "4px", delay: "0.2s" },
      { left: "29%", top: "79%", size: "3.5px", delay: "0.7s" },
      { left: "78%", top: "17%", size: "3px", delay: "0.3s" },
      { left: "82%", top: "72%", size: "3px", delay: "0.6s" },
      { left: "89%", top: "36%", size: "2.5px", delay: "0.5s" },
    ],
    []
  );

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 11 + 3;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          gsap.to(loaderRef.current, {
            opacity: 0,
            duration: 0.75,
            ease: "power2.inOut",
            onComplete: onFinish,
          });
        }, 450);
      }
      setProgress(Math.min(Math.round(current), 100));
    }, 120);
    return () => clearInterval(interval);
  }, [onFinish]);

  const frameNumber = String(Math.min(Math.floor(progress / 4) + 1, 24)).padStart(2, "0");

  return (
    <div className="loader-screen" ref={loaderRef}>
      {/* 1. RIGHT SIDE: ROUNDED BLANK PROJECTION SCREEN */}
      <div className="ref-blank-screen-stage" aria-hidden="true">
        <div className="ref-screen-wall-glow" />
        <div className="ref-blank-screen">
          <div className="ref-screen-beam-wash" />
          <div className="ref-projected-branding">
            <img
              className="ref-projected-logo"
              src={`${IMG_BASE}logo.png`}
              alt=""
              draggable={false}
            />
          </div>
          <div className="ref-hair-scratch" />
          {dustSpecks.map((s, idx) => (
            <span
              key={idx}
              className="ref-dust-speck"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. CENTER-LEFT: WISPY VOLUMETRIC LIGHT RAYS FROM LENS TO SCREEN */}
      <div className="ref-projector-rays" aria-hidden="true">
        <div className="ref-ray-fan" />
        <div className="ref-ray-core" />
      </div>

      {/* 3. LEFT FOREGROUND: 3D VINTAGE PROJECTOR WITH PERFORATED REELS */}
      <div className="loader-webgl-canvas">
        <Canvas
          shadows
          camera={{ position: [0, 0.05, 5.2], fov: 38 }}
          gl={{ alpha: true, antialias: true }}
        >
          <Projector3DScene/>
        </Canvas>
      </div>

      {/* 4. SUBTLE BOTTOM PROGRESS BAR */}
      <div className="loader-hud">
        <div className="loader-hud-meta">
          <span>35MM PROJECTION // 24 FPS</span>
          <span>FRAME {frameNumber}</span>
          <span className="loader-progress-percent" aria-live="polite">
            {progress}%
          </span>
        </div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

/* MAIN APP */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => ScrollTrigger.refresh(), 200);
      return () => clearTimeout(t);
    }
  }, [loading, currentPage]);

  useEffect(() => {
    const preventMediaContextMenu = (event) => {
      if (event.target instanceof Element && event.target.closest("img, video")) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventMediaContextMenu);
    return () => document.removeEventListener("contextmenu", preventMediaContextMenu);
  }, []);

  const resetScrollTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    requestAnimationFrame(resetScrollTop);
  };

  return (
    <>
      {loading && <LoadingScreen onFinish={() => setLoading(false)} />}

      {!loading && (
        <>
          {currentPage === "home" ? (
            <>
              <Navbar />
              <Hero/>
              <About/>
              <ImageMarquee/>
              <Services/>
              <ProcessSection/>
              <Team/>
              <Contact/>
              <Footer/>
            </>
          ) : currentPage === "work" ? (
            <WorkGallery onBack={handleBackToHome} />
          ) : null}
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500;1,600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        ::selection {
          background: rgba(255,140,0,0.3);
          color: #fff;
        }

        html { scroll-behavior: initial; }
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }

        body {
          background: #121212;
          color: #fff;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* NAVBAR */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 24px 40px;
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        .nav-scrolled {
          padding: 16px 40px;
          background: rgba(18,18,18,0.92);
          backdrop-filter: blur(30px) saturate(1.5);
          -webkit-backdrop-filter: blur(30px) saturate(1.5);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .nav-container {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          font-size: 18px;
          font-weight: 600;
          color: #FF8C00;
          text-decoration: none;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: opacity 0.3s ease;
        }

        .nav-brand:hover { opacity: 0.8; }

        .nav-links {
          display: flex;
          gap: 42px;
        }

        .nav-links a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.4s ease;
          position: relative;
        }

        .nav-links a:hover { color: #fff; }

        .nav-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          z-index: 1001;
        }

        .nav-toggle span {
          display: block;
          width: 24px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .nav-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .nav-toggle.active span:nth-child(2) { opacity: 0; }
        .nav-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* HERO */
        .hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 0 60px;
          padding-top: 80px;
          min-height: 100vh;
          z-index: 1;
          transition: opacity 0.25s ease-out;
          will-change: opacity;
        }

        .hero-video-wrap {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          perspective: 1200px;
          transform-style: preserve-3d;
          pointer-events: none;
          transition: opacity 0.18s ease-out;
          will-change: opacity;
          background: #121212;
        }

        .hero-video-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 46%, transparent 28%, rgba(0,0,0,0.35) 100%);
        }

        .hero-bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: translate3d(0, 0, 0) scale(1.08);
          animation: heroBackgroundDepth 18s ease-in-out infinite alternate;
        }

        @keyframes heroBackgroundDepth {
          from { transform: translate3d(-0.6%, 0.3%, 0) scale(1.08); }
          to { transform: translate3d(0.6%, -0.3%, 0) scale(1.12); }
        }

        /* SECTION LABELS & HEADINGS */
        .section-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #FF8C00;
          margin-bottom: 8px;
          position: relative;
          padding-left: 36px;
        }

        .section-label::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 24px;
          height: 1px;
          background: #FF8C00;
        }

        .section-heading,
        .about-heading,
        .contact-heading,
        .work-heading,
        .services-heading,
        .team-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 54px;
          font-style: italic;
          font-weight: 500;
          letter-spacing: -0.8px;
          line-height: 1.05;
          margin-bottom: 20px;
          color: #f4efe4;
          text-shadow: 0 3px 12px rgba(0,0,0,0.18);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        /* ABOUT */
        .about-section {
          padding: 90px 60px 110px;
          width: 100%;
        }

        .about-inner {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: clamp(40px, 5vw, 80px);
          align-items: center;
          width: 100%;
        }

        .about-copy { max-width: 680px; }
        .about-heading { font-size: 52px; line-height: 1.1; margin-bottom: 30px; }

        .about-text {
          font-size: 17px;
          font-weight: 300;
          line-height: 2;
          color: rgba(255,255,255,0.5);
          max-width: 650px;
          margin-bottom: 20px;
        }

        .about-team-photo {
          width: 100%;
          justify-self: end;
          align-self: start;
          padding-top: 8px;
        }

        .about-team-photo-header {
          display: flex;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.46);
          font-size: 10px;
          letter-spacing: 1.8px;
        }

        .about-team-collage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          margin-top: 18px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,140,0,0.12), transparent 45%), #181818;
          border: 1px solid rgba(255,255,255,0.18);
        }

        .about-team-collage::before,
        .about-team-collage::after {
          content: '';
          position: absolute;
          background: rgba(255,140,0,0.48);
        }

        .about-team-collage::before { left: 50%; top: 15%; width: 1px; height: 70%; }
        .about-team-collage::after { top: 50%; left: 15%; width: 70%; height: 1px; }

        .about-team-placeholder {
          position: absolute;
          inset: 1px;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
        }

        .about-team-placeholder span {
          color: #ff8c00;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 4px;
        }

        .about-team-placeholder small {
          color: rgba(255,255,255,0.38);
          font-size: 10px;
          letter-spacing: 2px;
        }

        .about-team-caption {
          margin-top: 16px;
          color: rgba(255,255,255,0.52);
          font-size: 14px;
        }

        /* IMAGE MARQUEE */
        .marquee-section {
          padding: 30px 0;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .marquee-fade-left,
        .marquee-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 200px;
          z-index: 2;
          pointer-events: none;
        }

        .marquee-fade-left { left: 0; background: linear-gradient(to right, #121212 0%, transparent 100%); }
        .marquee-fade-right { right: 0; background: linear-gradient(to left, #121212 0%, transparent 100%); }

        .marquee-track { display: flex; gap: 20px; width: max-content; }
        .marquee-left { animation: marqueeLeft 40s linear infinite; }
        .marquee-right { animation: marqueeRight 45s linear infinite; }

        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .marquee-item {
          flex-shrink: 0;
          width: 360px;
          height: 240px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
        }

        .marquee-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .marquee-item:hover img { transform: scale(1.08); }

        /* FEATURED PROJECT / WORK JOURNEY */
        .feature-work-section {
          position: relative;
          isolation: isolate;
          height: clamp(560px, calc(100svh - 56px), 900px);
          min-height: 560px;
          overflow: hidden;
          background: #03070a;
          color: #f4f1eb;
        }

        .feature-work-background,
        .feature-work-shade {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .feature-work-background {
          z-index: -2;
          display: block;
          object-fit: cover;
          object-position: center 68%;
          filter: saturate(1.12) contrast(1.08) brightness(0.78);
          transform: scale(1.025);
        }

        .feature-work-shade {
          z-index: -1;
          background:
            linear-gradient(90deg, rgba(3, 7, 10, 0.96) 0%, rgba(3, 7, 10, 0.8) 26%, rgba(3, 7, 10, 0.24) 55%, rgba(3, 7, 10, 0.05) 100%),
            linear-gradient(0deg, rgba(2, 5, 7, 0.98) 0%, rgba(2, 5, 7, 0.72) 18%, transparent 48%);
        }

        .feature-work-topbar {
          position: absolute;
          z-index: 2;
          top: 72px;
          left: clamp(28px, 4.2vw, 68px);
          right: clamp(28px, 4.2vw, 68px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .feature-work-eyebrow {
          display: flex;
          align-items: center;
          gap: 15px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 9px;
          letter-spacing: 0.28em;
        }

        .feature-work-eyebrow span:first-child { color: #f0a84a; }
        .feature-work-eyebrow-rule { width: 34px; height: 1px; background: rgba(255,255,255,0.34); }

        .feature-work-all {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #f2eee7;
          font-size: 9px;
          letter-spacing: 0.2em;
          cursor: pointer;
          transition: color 0.25s ease;
        }

        .feature-work-all:hover { color: #f0a84a; }
        .feature-work-all span { font-size: 16px; color: #f0a84a; }

        .feature-work-copy {
          position: absolute;
          z-index: 2;
          top: 19%;
          left: clamp(28px, 8.2vw, 130px);
          width: min(440px, 42vw);
        }

        .feature-work-index {
          display: block;
          margin-bottom: 10px;
          color: rgba(255,255,255,0.56);
          font-size: 9px;
          letter-spacing: 0.28em;
        }

        .feature-work-copy h2 {
          margin: 0;
          color: rgba(245, 244, 240, 0.88);
          font-size: clamp(2.45rem, 4.5vw, 4.8rem);
          font-weight: 300;
          letter-spacing: -0.075em;
          line-height: 0.78;
          text-transform: uppercase;
          text-shadow: 0 5px 28px rgba(0,0,0,0.45);
        }

        .feature-work-copy h2 em {
          color: #fff;
          font-style: normal;
          font-weight: 600;
          text-shadow: 0 0 20px rgba(255,255,255,0.28);
        }

        .feature-work-description {
          max-width: 330px;
          margin: 10px 0;
          color: rgba(255,255,255,0.76);
          font-size: 11px;
          font-weight: 300;
          line-height: 1.55;
        }

        .feature-work-facts {
          display: grid;
          gap: 4px;
          margin: 0;
          max-width: 330px;
        }

        .feature-work-facts div {
          display: grid;
          grid-template-columns: 92px 1fr;
          align-items: baseline;
          gap: 12px;
        }

        .feature-work-facts dt {
          color: rgba(255,255,255,0.4);
          font-size: 8px;
          letter-spacing: 0.22em;
        }

        .feature-work-facts dd {
          margin: 0;
          color: rgba(255,255,255,0.82);
          font-size: 10px;
          letter-spacing: 0.03em;
        }

        .feature-work-film {
          display: inline-flex;
          align-items: center;
          gap: 13px;
          margin-top: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #fff;
          font-size: 8px;
          letter-spacing: 0.2em;
          cursor: pointer;
        }

        .feature-work-play {
          display: grid;
          width: 35px;
          height: 35px;
          place-items: center;
          padding-left: 2px;
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 50%;
          font-size: 10px;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }

        .feature-work-film:hover .feature-work-play {
          border-color: #f0a84a;
          background: #f0a84a;
          color: #090b0d;
        }

        .feature-work-side-note {
          position: absolute;
          z-index: 2;
          top: 22%;
          right: clamp(28px, 4.2vw, 68px);
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-left: 12px;
          border-left: 1px solid rgba(255,255,255,0.4);
          color: rgba(255,255,255,0.55);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .feature-work-side-note i { width: 24px; height: 1px; margin-top: 5px; background: #f0a84a; }

        .feature-work-journey {
          position: absolute;
          z-index: 2;
          left: clamp(28px, 5.5vw, 88px);
          right: clamp(28px, 5.5vw, 88px);
          bottom: 17px;
        }

        .feature-work-journey-heading,
        .feature-work-journey-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: rgba(255,255,255,0.64);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .feature-work-journey-heading {
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .feature-work-journey-heading span:last-child { color: #f0a84a; text-align: right; }

        .feature-work-timeline {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: clamp(10px, 2.2vw, 32px);
          padding: 8px 0 10px;
        }

        .feature-work-stage {
          min-width: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255,255,255,0.55);
          text-align: left;
          cursor: pointer;
        }

        .feature-work-stage-label {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 15px;
          margin-bottom: 5px;
          font-size: 8px;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        .feature-work-stage-label span:first-child { color: rgba(255,255,255,0.44); }
        .feature-work-stage-label span:last-child { overflow: hidden; text-overflow: ellipsis; }

        .feature-work-stage-image {
          display: block;
          height: clamp(42px, 5.8vw, 64px);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.05);
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .feature-work-stage-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.76) brightness(0.68);
          transition: filter 0.25s ease, transform 0.45s ease;
        }

        .feature-work-stage:hover .feature-work-stage-image,
        .feature-work-stage.is-active .feature-work-stage-image {
          border-color: #f0a84a;
          transform: translateY(-2px);
        }

        .feature-work-stage:hover .feature-work-stage-image img,
        .feature-work-stage.is-active .feature-work-stage-image img {
          filter: saturate(1.05) brightness(0.95);
          transform: scale(1.04);
        }

        .feature-work-stage.is-active .feature-work-stage-label { color: #fff; }
        .feature-work-stage.is-active .feature-work-stage-label span:first-child { color: #f0a84a; }

        .feature-work-journey-footer { color: rgba(255,255,255,0.38); font-size: 7px; }

        .feature-work-scroll-cue { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); }
        .feature-work-scroll-cue i { width: 5px; height: 5px; border-radius: 50%; background: #f0a84a; box-shadow: 0 0 10px #f0a84a; }

        .feature-work-video-modal { z-index: 10001; }

        .feature-work-video-close {
          position: absolute;
          top: 24px;
          right: 28px;
          border: 0;
          background: none;
          color: #fff;
          font-size: 36px;
          cursor: pointer;
        }

        /* WORK GALLERY PAGE */
        .work-gallery-page {
          min-height: 100vh;
          padding: 34px clamp(24px, 5vw, 80px) 80px;
          background: #101010;
          color: #f5f0e8;
        }

        .work-gallery-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(255,255,255,0.14);
        }

        .work-gallery-back {
          border: 0;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .work-gallery-back:hover { color: #f0a84a; }

        .work-gallery-index {
          color: rgba(255,255,255,0.38);
          font-size: 0.58rem;
          letter-spacing: 0.2em;
        }

        .work-gallery-header {
          display: grid;
          grid-template-columns: 1fr minmax(260px, 360px);
          align-items: end;
          gap: 30px;
          padding: 76px 0 52px;
        }

        .work-gallery-header .section-label {
          grid-column: 1 / -1;
          margin: 0;
        }

        .work-gallery-header h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(4rem, 10vw, 9rem);
          font-weight: 400;
          line-height: 0.78;
          letter-spacing: -0.08em;
        }

        .work-gallery-header h1 em {
          color: #f0a84a;
          font-style: italic;
        }

        .work-gallery-header p {
          max-width: 340px;
          margin: 0 0 4px;
          color: rgba(255,255,255,0.54);
          font-size: 0.82rem;
          line-height: 1.7;
        }

        .work-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .work-gallery-item {
          position: relative;
          min-width: 0;
          aspect-ratio: 1 / 1.05;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 7px;
          background: #181818;
          text-align: left;
          cursor: pointer;
        }

        .work-gallery-item-wide {
          grid-column: span 2;
          aspect-ratio: 2 / 1.05;
        }

        .work-gallery-item img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          filter: saturate(0.82) contrast(1.06) brightness(0.8);
          transition: transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease;
        }

        .work-gallery-item:hover img {
          transform: scale(1.05);
          filter: saturate(1) contrast(1.04) brightness(0.9);
        }

        .work-gallery-item-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.86) 100%);
        }

        .work-gallery-item-info {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .work-gallery-item-info small {
          color: #f0a84a;
          font-size: 0.56rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .work-gallery-item-info strong {
          color: #f5f0e8;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(1.25rem, 2vw, 2rem);
          font-weight: 400;
          letter-spacing: -0.03em;
        }

        /* ==============================================================
           PROCESS SECTION
           ============================================================== */
        .process-section {
          position: relative;
          width: 100%;
          background: #080808;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .process-pinned-wrap {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px 0;
        }

        .process-top-header {
          max-width: 1380px;
          width: 100%;
          margin: 0 auto 20px;
          padding: 0 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }

        .process-heading {
          margin-bottom: 0;
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-weight: 800;
          font-size: clamp(1.9rem, 3.2vw, 3.4rem);
          letter-spacing: -0.05em;
          text-transform: uppercase;
        }

        .process-highlight {
          color: #f0a84a;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 600;
        }

        .process-scroll-hint {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          font-size: 10px;
          letter-spacing: 0.24em;
          color: rgba(255, 255, 255, 0.5);
        }

        .process-progress-bar {
          width: 180px;
          height: 2px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          overflow: hidden;
        }

        .process-progress-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #FF8C00, #FFB347);
          transform: scaleX(0);
          transform-origin: left center;
        }

        .process-slider-viewport {
          width: 100%;
          overflow: hidden;
        }

        .process-merged-track {
          display: inline-flex;
          flex-wrap: nowrap;
          flex-shrink: 0;
          align-items: stretch;
          gap: 24px;
          width: max-content;
          height: clamp(440px, 62vh, 560px);
          margin-left: max(48px, calc((100vw - 1380px) / 2 + 48px));
          margin-right: 120px;
          will-change: transform;
        }

        .process-merged-panel {
          position: relative;
          height: 100%;
          width: clamp(586.67px, 82.6667vh, 746.67px);
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 17px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .process-merged-panel--with-image {
          cursor: pointer;
          background: #0b0c10;
        }

        .process-merged-panel--text-only {
          background-color: #0b0c10;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .process-concept-full-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
          z-index: 0;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .process-panel-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(6, 6, 8, 0.78) 0%,
            rgba(6, 6, 8, 0.18) 28%,
            rgba(6, 6, 8, 0.06) 55%,
            rgba(6, 6, 8, 0.65) 78%,
            rgba(6, 6, 8, 0.92) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .process-panel-content {
          position: relative;
          z-index: 4;
          height: 100%;
          padding: 30px 28px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .process-panel-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
        }

        .process-node-dot-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 20px;
        }

        .process-node-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 0 12px 3px rgba(255, 255, 255, 0.9),
            0 0 24px 6px rgba(255, 150, 40, 0.75);
        }

        .process-panel-keywords {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .process-panel-keywords li {
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }

        /* SERVICES */
        .services-section {
          position: relative;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 60px clamp(24px, 3.2vw, 48px) 0;
          color: #f2efe9;
        }

        .services-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 26px;
        }

        .services-intro { flex: 1 1 auto; min-width: 0; }

        .services-label {
          display: block;
          margin-bottom: 16px;
          color: #d39a4b;
          letter-spacing: 0.28em;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .services-heading {
          margin: 0;
          font-size: clamp(2.8rem, 4vw, 5.25rem);
          line-height: 0.88;
          letter-spacing: -0.07em;
          font-weight: 700;
          text-transform: uppercase;
          color: #f4efe8;
        }

        .services-highlight { color: #f0a84a; }

        .services-copy {
          width: min(360px, 32vw);
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: rgba(255,255,255,0.72);
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .services-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 16px;
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }

        .services-meta span { position: relative; padding-right: 16px; }
        .services-meta span:not(:last-child)::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.2);
          transform: translateY(-50%);
        }

        .services-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr);
          gap: 20px;
        }

        .service-card {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.14);
          background: #101010;
          cursor: pointer;
          isolation: isolate;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease, border-color 0.45s ease;
          min-height: clamp(360px, 34vw, 520px);
        }

        .service-card.small { min-height: clamp(320px, 29vw, 440px); }

        .service-card:hover {
          transform: translateY(-6px);
          border-color: rgba(240, 168, 74, 0.38);
          box-shadow: 0 28px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,168,74,0.08);
        }

        .service-media {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 12px;
          z-index: 0;
          background: #101010;
        }

        .service-media img,
        .service-media video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.88) contrast(1.04) brightness(0.78);
          transition: transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease;
        }

        .service-card:hover .service-media img,
        .service-card:hover .service-media video {
          transform: scale(1.045);
          filter: saturate(1) contrast(1.06) brightness(0.84);
        }

        .service-video-overlay { opacity: 0; transition: opacity 0.35s ease; z-index: 1; }
        .service-card:hover .service-video-overlay { opacity: 1; }

        .service-card-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 30px 32px 26px;
          background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.16) 34%, rgba(0,0,0,0.88) 100%);
        }

        .service-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }

        .service-number {
          color: #f0a84a;
          font-size: clamp(1.5rem, 1.8vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.06em;
        }

        .service-kicker {
          color: rgba(255,255,255,0.72);
          font-size: 0.56rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .service-card h3 {
          margin: 0 0 10px;
          font-size: clamp(2.2rem, 2.8vw, 4rem);
          line-height: 0.88;
          letter-spacing: -0.07em;
          text-transform: uppercase;
          color: #f7f2e9;
          white-space: pre-line;
        }

        .service-card p {
          margin: 0;
          color: rgba(255,255,255,0.72);
          font-size: 0.72rem;
          line-height: 1.62;
        }

        .service-cta {
          margin-top: 18px;
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 15px;
          border: 1px solid rgba(240, 168, 74, 0.72);
          background: rgba(8, 8, 10, 0.42);
          color: #f4c276;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .service-cta:hover {
          background: #f0a84a;
          border-color: #f0a84a;
          color: #17120c;
        }

        .services-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.72);
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .services-footer-index { color: #f0a84a; }

        /* =====================================================
           TEAM SECTION
           ===================================================== */
        .team-scroll-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #121212;
        }

        .team-pinned-wrap {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 0;
        }

        .team-top-header {
          max-width: 1380px;
          width: 100%;
          margin: 0 auto 30px;
          padding: 0 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .team-heading {
          margin-bottom: 0;
        }

        .team-scroll-viewport {
          width: 100%;
          overflow: visible;
          display: block;
          padding: 12px 0;
        }

        .team-scroll-track {
          display: inline-flex;
          flex-wrap: nowrap;
          flex-shrink: 0;
          gap: 26px;
          width: max-content;
          padding-left: max(48px, calc((100vw - 1380px) / 2 + 48px));
          padding-right: 120px;
          will-change: transform;
        }

        .team-slide-card {
          width: 330px;
          flex: 0 0 330px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          background: #151515;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          user-select: none;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .team-slide-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 140, 0, 0.5);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }

        .team-slide-img-wrap {
          position: relative;
          height: 310px;
          overflow: hidden;
          background: #101010;
        }

        .team-slide-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          transition: transform 0.6s ease;
        }

        .team-slide-card:hover .team-slide-img-wrap img {
          transform: scale(1.06);
        }

        .team-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 45%, rgba(15, 15, 15, 0.96) 100%);
        }

        .team-slide-index {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 5px 10px;
          border-radius: 50px;
          background: rgba(10, 10, 10, 0.65);
          border: 1px solid rgba(255, 140, 0, 0.35);
          color: #f0a84a;
          font-size: 11px;
          letter-spacing: 0.14em;
          backdrop-filter: blur(8px);
        }

        .team-slide-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .team-slide-role {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #FF8C00;
          margin-bottom: 6px;
        }

        .team-slide-name {
          font-size: 21px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 14px;
        }

        .team-slide-highlights {
          list-style: none;
          padding: 0;
          margin: 0 0 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }

        .team-slide-highlights li {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          padding-left: 14px;
          position: relative;
        }

        .team-slide-highlights li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FF8C00;
        }

        .team-slide-more {
          align-self: flex-start;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(240, 168, 74, 0.6);
          padding-bottom: 5px;
          color: #f5f0e8;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, padding-left 0.3s ease;
        }

        .team-slide-card:hover .team-slide-more {
          color: #f0a84a;
          padding-left: 6px;
        }

        .team-slide-more:hover {
          background: #f0a84a;
          border: 1px solid #f0a84a;
          color: #17120c;
          box-shadow: 0 0 25px rgba(240, 168, 74, 0.72);
        }

        .team-slide-card:hover .team-slide-more:hover {
          color: #17120c;
        }

        /* TEAM MODAL */
        .team-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0,0,0,0.82);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .team-modal {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          max-width: 540px;
          width: 100%;
          padding: 40px;
          position: relative;
        }

        .team-modal-close {
          position: absolute;
          top: 16px;
          right: 20px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 28px;
          cursor: pointer;
        }

        .team-modal-close:hover { color: #FF8C00; }

        .team-modal-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .team-modal-img {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,140,0,0.4);
        }

        .team-modal-name {
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .team-modal-role {
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FF8C00;
        }

        .team-modal-subtitle {
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
        }

        .team-modal-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .team-modal-list li {
          font-size: 14.5px;
          font-weight: 300;
          color: rgba(255,255,255,0.72);
          line-height: 1.6;
          padding-left: 20px;
          position: relative;
        }

        .team-modal-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 9px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF8C00;
        }

        /* FULLSCREEN */
        .fullscreen {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(30px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 5000;
          cursor: pointer;
        }

        .fullscreen img, .fullscreen video {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          border-radius: 12px;
        }

        /* CONTACT */
        .contact-section {
          padding: 60px 60px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .contact-heading {
          font-family: 'Inter', sans-serif;
          font-size: 52px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 40px;
          letter-spacing: -1px;
          color: #ffffff;
        }

        .contact-heading-highlight {
          display: block;
          margin-top: 10px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 52px;
          font-weight: 700;
          line-height: 1.05;
          color: #d4ac6e;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        input, textarea, select {
          padding: 18px 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.5s ease;
        }

        select {
          width: 100%;
          appearance: none;
          padding-right: 40px;
        }

        select option { color: #000; }

        input:focus, textarea:focus { border-color: rgba(255,140,0,0.6); }

        .contact-form button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 20px 40px;
          border: none;
          background: #c7934e;
          color: #0a0a0a;
          cursor: pointer;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          align-self: flex-start;
          transition: all 0.4s ease;
        }

        .contact-disclaimer {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }

        /* MAP */
        .map-section {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
          margin-top: 80px;
          align-items: start;
        }

        .address-text {
          font-size: 17px;
          font-weight: 300;
          line-height: 2;
          color: rgba(255,255,255,0.5);
        }

        .contact-socials {
          display: flex;
          gap: 18px;
          margin-top: 20px;
        }

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
        }

        .map-embed {
          height: 350px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .map-embed iframe {
          filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2);
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }

        .footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 60px 60px;
          display: grid;
          grid-template-columns: 1.4fr 1.6fr;
          gap: 50px;
        }

        .footer-links-group {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 32px;
        }

        .footer-logo {
          width: 60px;
          margin-bottom: 16px;
          filter: brightness(0.8);
        }

        .footer-brand-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 20px;
          display: block;
        }

        .footer-copy {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          line-height: 1.6;
        }

        .footer-col h4 {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 24px;
        }

        .footer-col a {
          display: block;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          font-size: 14px;
          font-weight: 300;
          margin-bottom: 14px;
          transition: color 0.3s ease;
        }

        .footer-col a:hover { color: #FF8C00; }

        .footer-col p {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.35);
        }

        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.04); }
        .footer-bottom-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 60px;
          text-align: center;
        }

        .footer-bottom span {
          font-size: 12px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 1px;
        }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .about-inner,
          .services-grid,
          .map-section,
          .form-row {
            grid-template-columns: 1fr;
          }

          .services-header,
          .process-top-header,
          .team-top-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .process-scroll-hint {
            align-items: flex-start;
          }

          .process-merged-track {
            margin-left: 32px;
            margin-right: 60px;
          }

          .services-copy { width: 100%; }

          .feature-work-copy {
            left: 48px;
            width: min(400px, 48vw);
          }

          .feature-work-side-note { display: none; }
          .feature-work-journey { left: 30px; right: 30px; }
          .feature-work-timeline { gap: 12px; }
          .feature-work-stage-label { gap: 5px; font-size: 7px; }
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .nav-toggle { display: flex; }
          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 70%;
            max-width: 300px;
            height: 100vh;
            background: rgba(10,10,10,0.98);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 32px;
            transition: right 0.4s ease;
          }
          .nav-links.nav-open { right: 0; }
          .contact-section,
          .about-section {
            padding: 70px 20px;
          }

          .feature-work-section {
            display: flex;
            height: auto;
            min-height: 100svh;
            flex-direction: column;
            padding: 94px 20px 20px;
          }

          .feature-work-background { object-position: center 68%; }

          .feature-work-shade {
            background:
              linear-gradient(90deg, rgba(3, 7, 10, 0.88), rgba(3, 7, 10, 0.32)),
              linear-gradient(0deg, rgba(2, 5, 7, 0.98) 0%, rgba(2, 5, 7, 0.68) 34%, rgba(2, 5, 7, 0.3) 100%);
          }

          .feature-work-topbar {
            position: relative;
            top: auto;
            left: auto;
            right: auto;
          }

          .feature-work-copy {
            position: relative;
            top: auto;
            left: auto;
            width: min(100%, 520px);
            margin-top: 54px;
          }

          .feature-work-copy h2 { font-size: clamp(2.6rem, 8vw, 4.4rem); }
          .feature-work-description { max-width: 390px; }
          .feature-work-journey {
            position: relative;
            left: auto;
            right: auto;
            bottom: auto;
            margin-top: auto;
            padding-top: 42px;
          }

          .feature-work-timeline {
            display: flex;
            gap: 14px;
            overflow-x: auto;
            padding: 12px 2px 16px;
            scroll-snap-type: x mandatory;
            scrollbar-width: thin;
            scrollbar-color: rgba(240,168,74,0.55) transparent;
          }

          .feature-work-stage { flex: 0 0 150px; scroll-snap-align: start; }
          .feature-work-stage-image { height: 64px; }
          .feature-work-journey-footer span:first-child,
          .feature-work-journey-footer span:last-child { display: none; }
          .process-top-header,
          .team-top-header { padding: 0 20px; }
          .process-merged-track {
            height: clamp(300px, 62svh, 460px);
            margin-left: 20px;
            margin-right: 40px;
          }
          .process-merged-panel {
            width: clamp(400px, 82.6667svh, 613.33px);
          }
          .team-scroll-track {
            padding-left: 20px;
            padding-right: 60px;
          }
          .team-slide-card { width: 290px; flex: 0 0 290px; }
          .work-gallery-grid { grid-template-columns: 1fr; }
          .work-gallery-item,
          .work-gallery-item-wide {
            grid-column: auto;
            aspect-ratio: 1.15 / 1;
          }
        }
      `}</style>
    </>
  );
}