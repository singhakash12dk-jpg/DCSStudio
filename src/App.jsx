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

function SiteBackground() {
  const motesRef = useRef(null);

  useEffect(() => {
    const container = motesRef.current;
    if (!container) return undefined;

    const motes = Array.from({ length: 26 }, () => {
      const mote = document.createElement("i");
      mote.className = "mote";
      mote.style.left = `${Math.random() * 100}%`;
      mote.style.top = `${45 + Math.random() * 55}%`;
      mote.style.animationDuration = `${12 + Math.random() * 14}s`;
      mote.style.animationDelay = `${-Math.random() * 20}s`;
      mote.style.setProperty("--dx", `${Math.random() * 120 - 60}px`);
      container.appendChild(mote);
      return mote;
    });

    return () => motes.forEach((mote) => mote.remove());
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <i className="o o1" />
      <i className="o o2" />
      <i className="o o3" />
      <div className="grid" />
      <div className="motes" ref={motesRef} />
    </div>
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
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span /><span /><span />
        </button>
        <div id="primary-navigation" className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
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
  const [playingVideo, setPlayingVideo] = useState(null);
  const ref = useRef();

  const services = [
    {
      id: "01",
      title: "PROJECTION\nMAPPING",
      kicker: "ARCHITECTURE MEETS IMAGINATION",
      desc: "Large-scale facade mapping • Building projections • Architectural lighting • Outdoor spectacles",
      feature: "Turn architecture into a living canvas.",
      story: "We blend light, sound and story to transform familiar landmarks into shared, larger-than-life moments.",
      img: "facade",
      poster: "facade.jpeg",
      vid: "./videos/facade.mp4",
      accent: "featured",
    },
    {
      id: "02",
      title: "BRAND\nEXPERIENCES",
      kicker: "BRANDS INTO EXPERIENCES",
      desc: "Product launches • Brand activations • Experiential marketing • Corporate events",
      feature: "Make every brand moment matter.",
      story: "From the first reveal to the final frame, we create immersive activations that bring people closer to your brand.",
      img: "product",
      poster: "product.png",
      vid: "./videos/product.mp4",
      accent: "brand",
    },
    {
      id: "03",
      title: "IMMERSIVE\nINSTALLATIONS",
      kicker: "SPACES THAT CONNECT",
      desc: "Interactive rooms • Spatial experiences • Sensor-driven art • Museum installations",
      feature: "Give people a space to explore.",
      story: "Responsive visuals and thoughtful interaction turn rooms into environments people can feel, discover and remember.",
      img: "interactive",
      poster: "interactive.jpeg",
      vid: null,
      accent: "featured",
    },
    {
      id: "04",
      title: "CONTENT\nPRODUCTION",
      kicker: "STORIES FOR TOMORROW",
      desc: "Real-time rendering • Motion graphics • VFX • Anamorphic content • Visual packaging",
      feature: "Create images that stay with you.",
      story: "We craft cinematic, real-time and motion content designed to make every screen, surface and story more compelling.",
      img: "Robot",
      poster: "Robot.png",
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
            <div className="service-row" key={s.id}>
              <article
                className={`service-card service-card--${s.accent}${i > 1 ? " small" : ""}`}
                onClick={() => s.vid && setVideo(s.vid)}
                onMouseEnter={(e) => {
                  const preview = e.currentTarget.querySelector(".service-video-overlay");
                  if (preview) {
                    preview.play().catch((error) => {
                      console.error("Unable to play service preview video.", error);
                      setPlayingVideo(null);
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  const preview = e.currentTarget.querySelector(".service-video-overlay");
                  if (preview) {
                    preview.pause();
                    preview.currentTime = 0;
                    setPlayingVideo(null);
                  }
                }}
              >
                <div className="service-media">
                  <SmartImg alt={s.title} className="service-thumb-image" name={s.img} />
                  {hasVideo && (
                    <video
                      src={s.vid}
                      poster={`${IMG_BASE}${s.poster}`}
                      muted
                      loop
                      playsInline
                      controlsList="nodownload"
                      disablePictureInPicture
                      className="service-video-overlay"
                      data-playing={playingVideo === s.id}
                      onPlaying={() => setPlayingVideo(s.id)}
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
              <div className="service-detail">
                <span className="service-detail-index">{s.id} / THE EXPERIENCE</span>
                <h3>{s.feature}</h3>
                <p>{s.story}</p>
                <span className="service-detail-line" aria-hidden="true" />
              </div>
            </div>
          );
        })}
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

function LightArtShowcase() {
  const illuminationStudies = [
    { name: "2", label: "Study I | The Sacred Om" },
    { name: "3", label: "Study II | Nation's Pride" },
    { name: "4", label: "Study III | Revered Deities" },
  ];
  const deityProjectionImages = [
    { name: "5", label: "Image A" },
    { name: "6", label: "Image B" },
    { name: "7", label: "Image C" },
  ];

  const renderImageRow = (images, showDetails = false) => (
    <div
      className={`light-showcase-grid${showDetails ? " light-showcase-grid-with-controls" : ""}`}
      role="region"
      aria-label={showDetails ? "Deity projection images" : "Illumination studies"}
      tabIndex={0}
    >
      {images.map(({ name, label }) => (
        <figure className="light-showcase-card" key={name}>
          <div className="light-showcase-image-wrap">
            <SmartImg
              name={name}
              alt={label}
              draggable={false}
            />
          </div>
          <figcaption>
            <span>{label}</span>
          </figcaption>
          {showDetails && (
            <a className="light-showcase-card-link" href="#process">
              View details
            </a>
          )}
        </figure>
      ))}
    </div>
  );

  return (
    <section className="light-showcase-section" aria-labelledby="light-showcase-title">
      <div className="light-showcase-inner">
        <div className="light-showcase-kicker">Case studies &amp; galleries</div>
        <div className="light-showcase-feature">
          <div className="light-showcase-intro">
            <h2 id="light-showcase-title">
              Transforming<br />spaces
              <em>through light</em>
            </h2>
            <p>
              Experience the alchemy of scale, light, and sound. From concept to
              remarkable canvas, we redefine architecture through immersive
              visual narratives.
            </p>
          </div>
          <figure className="light-showcase-poster">
            <SmartImg
              name="1"
              alt="Transforming spaces through light, featuring a projection-mapped bridge"
              draggable={false}
            />
          </figure>
        </div>

        <div className="light-showcase-collection" id="natural-cultural-illuminations">
          <div className="light-showcase-heading">
            <h3>Natural &amp; Cultural Illuminations</h3>
          </div>
          {renderImageRow(illuminationStudies)}
        </div>

        <div className="light-showcase-collection" id="deity-projection-series">
          <div className="light-showcase-heading">
            <h3>The Deity Projection Series</h3>
          </div>
          {renderImageRow(deityProjectionImages, true)}
        </div>
      </div>
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
  const reelRef = useRef(null);
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
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const section = sectionRef.current;
    if (!track || !viewport || !section) return;

    const updateScrollProgress = (progress) => {
      const normalizedProgress = Math.min(1, Math.max(0, progress));
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${normalizedProgress})`;
      }
      if (reelRef.current) {
        reelRef.current.style.transform = `rotate(${normalizedProgress * 1080}deg)`;
      }
    };

    const media = gsap.matchMedia();
    media.add("(min-width: 769px)", () => {
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
            updateScrollProgress(self.progress);
          },
        },
      });

      timeline.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
      });
    });

    media.add("(max-width: 768px)", () => {
      const updateProgress = () => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
        updateScrollProgress(progress);
      };

      viewport.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();
      return () => viewport.removeEventListener("scroll", updateProgress);
    });

    return () => media.revert();
  }, []);

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      <div className="process-pinned-wrap">
        <div className="process-top-header">
          <div className="process-heading-lockup">
            <div>
              <span className="section-label">How We Work</span>
              <h2 className="section-heading process-heading">
                FROM VISION TO <span className="process-highlight">REALITY</span>
              </h2>
            </div>
            <svg
              className="process-reel-wheel"
              ref={reelRef}
              viewBox="0 0 72 72"
              aria-hidden="true"
            >
              <circle className="process-reel-rim" cx="36" cy="36" r="32" />
              <circle className="process-reel-inner-rim" cx="36" cy="36" r="28" />
              <circle className="process-reel-hole" cx="36" cy="14" r="6" />
              <circle className="process-reel-hole" cx="55" cy="25" r="6" />
              <circle className="process-reel-hole" cx="55" cy="47" r="6" />
              <circle className="process-reel-hole" cx="36" cy="58" r="6" />
              <circle className="process-reel-hole" cx="17" cy="47" r="6" />
              <circle className="process-reel-hole" cx="17" cy="25" r="6" />
              <circle className="process-reel-hub" cx="36" cy="36" r="7" />
            </svg>
          </div>
          <div className="process-scroll-hint">
            <span className="process-scroll-hint-desktop">SCROLL TO EXPLORE ALL SIX STAGES</span>
            <span className="process-scroll-hint-mobile">SWIPE TO EXPLORE ALL SIX STAGES</span>
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
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const section = sectionRef.current;
    if (!track || !viewport || !section) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 769px)", () => {
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
    });

    media.add("(max-width: 768px)", () => {
      const updateProgress = () => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${progress})`;
        }
      };

      viewport.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();
      return () => viewport.removeEventListener("scroll", updateProgress);
    });

    return () => media.revert();
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
            <span className="team-scroll-hint-desktop">SCROLL TO MEET THE TEAM (01 — 0{team.length})</span>
            <span className="team-scroll-hint-mobile">SWIPE TO MEET THE TEAM (01 — 0{team.length})</span>
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
              <input type="text" name="from_name" placeholder="John" required />
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
    const updateScrollEffects = () => {
      ScrollTrigger.update();
      const scrollY = window.scrollY;
      const root = document.documentElement;
      root.style.setProperty("--sy", String(scrollY));
      root.style.setProperty("--bg-parallax-o1", `${scrollY * -0.12}px`);
      root.style.setProperty("--bg-parallax-o2", `${scrollY * -0.06}px`);
      root.style.setProperty("--bg-parallax-grid", `${scrollY * -0.05}px`);
    };

    updateScrollEffects();
    lenis.on("scroll", updateScrollEffects);
    window.addEventListener("scroll", updateScrollEffects, { passive: true });

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrollEffects);
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
          <SiteBackground />
          {currentPage === "home" ? (
            <>
              <Navbar />
              <Hero/>
              <About/>
              <ImageMarquee/>
              <Services/>
              <LightArtShowcase/>
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

        :root {
          --page-gutter: clamp(12px, 1.5vw, 20px);
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

        img,
        video,
        iframe {
          max-width: 100%;
        }

        /* NAVBAR */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 24px var(--page-gutter);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        .nav-scrolled {
          padding: 16px var(--page-gutter);
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
          padding: 0 var(--page-gutter);
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
          padding: 90px var(--page-gutter) 110px;
          width: 100%;
        }

        .about-inner {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: clamp(20px, 3vw, 48px);
          align-items: center;
          width: 100%;
        }

        .about-copy { max-width: none; }
        .about-heading { font-size: 52px; line-height: 1.1; margin-bottom: 30px; }

        .about-text {
          font-size: 17px;
          font-weight: 300;
          line-height: 2;
          color: rgba(255,255,255,0.5);
          max-width: none;
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
          background: #000;
        }

        .marquee-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: none;
        }

        .marquee-item:hover img { transform: none; }

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
          left: var(--page-gutter);
          right: var(--page-gutter);
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
          left: clamp(var(--page-gutter), 4vw, 64px);
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
          padding: 34px var(--page-gutter) 80px;
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
          padding: 0;
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
          padding: 24px 0 112px;
        }

        .process-top-header {
          width: 100%;
          margin: 0 0 20px;
          padding: 0 var(--page-gutter);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }

        .process-heading-lockup {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 22px);
          min-width: 0;
        }

        .process-reel-wheel {
          display: block;
          width: clamp(42px, 5vw, 64px);
          height: auto;
          flex: 0 0 auto;
          overflow: visible;
          transform-origin: center;
          will-change: transform;
          filter: drop-shadow(0 0 10px rgba(240, 168, 74, 0.28));
        }

        .process-reel-rim {
          fill: rgba(240, 168, 74, 0.08);
          stroke: #f0a84a;
          stroke-width: 2;
        }

        .process-reel-inner-rim {
          fill: none;
          stroke: rgba(255, 217, 160, 0.5);
          stroke-width: 1;
        }

        .process-reel-hole {
          fill: #080808;
          stroke: rgba(255, 217, 160, 0.85);
          stroke-width: 1.5;
        }

        .process-reel-hub {
          fill: #f0a84a;
          stroke: #ffe0ad;
          stroke-width: 1.5;
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

        .process-scroll-hint-mobile {
          display: none;
        }

        .team-scroll-hint-mobile {
          display: none;
        }

        .process-merged-track {
          display: inline-flex;
          flex-wrap: nowrap;
          flex-shrink: 0;
          align-items: stretch;
          gap: 24px;
          width: max-content;
          height: clamp(440px, 62vh, 560px);
          margin-left: var(--page-gutter);
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
          background: #080808;
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
          mix-blend-mode: lighten;
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
          max-width: none;
          margin: 0;
          padding: 60px var(--page-gutter) 56px;
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
          width: 100%;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(28px, 5vw, 72px);
        }

        .service-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: center;
          gap: clamp(24px, 5vw, 80px);
        }

        .service-row:nth-child(4) {
          translate: 0 -28px;
          margin-bottom: -28px;
        }

        .service-card {
          width: min(100%, 900px);
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.14);
          background: #101010;
          cursor: pointer;
          isolation: isolate;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease, border-color 0.45s ease;
          min-width: 0;
          min-height: 0;
          aspect-ratio: 6 / 3;
        }

        .service-row:nth-child(even) .service-card {
          grid-column: 2;
          grid-row: 1;
        }

        .service-row:nth-child(4) .service-media img,
        .service-row:nth-child(4) .service-media video {
          object-fit: cover;
          object-position: center 75%;
        }

        .service-detail {
          max-width: 470px;
          padding: 24px clamp(8px, 2vw, 28px);
          color: #f2efe9;
        }

        .service-row:nth-child(even) .service-detail {
          grid-column: 1;
          grid-row: 1;
        }

        .service-detail-index {
          display: block;
          margin-bottom: 20px;
          color: #d39a4b;
          font-size: 0.62rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        .service-detail h3 {
          max-width: 12ch;
          margin: 0 0 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2rem, 3.4vw, 4rem);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .service-detail p {
          max-width: 42ch;
          margin: 0;
          color: rgba(255,255,255,0.58);
          font-size: clamp(0.85rem, 1vw, 1rem);
          line-height: 1.8;
        }

        .service-detail-line {
          display: block;
          width: min(100%, 180px);
          height: 1px;
          margin-top: 56px;
          background: linear-gradient(
            90deg,
            rgba(211, 154, 75, 0.02),
            rgba(211, 154, 75, 0.52) 45%,
            rgba(211, 154, 75, 0.08)
          );
        }

        .service-card.small { min-height: 0; }

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
        .service-card:hover .service-video-overlay[data-playing="true"] { opacity: 1; }

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

        /* FEATURED LIGHT ART SHOWCASE */
        .light-showcase-section {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border-top: 1px solid rgba(240, 168, 74, 0.22);
          border-bottom: 1px solid rgba(240, 168, 74, 0.22);
          background:
            radial-gradient(ellipse at 78% 18%, rgba(194, 91, 24, 0.16), transparent 42%),
            radial-gradient(ellipse at 21% 75%, rgba(114, 48, 16, 0.12), transparent 38%),
            linear-gradient(135deg, #17120e, #090909 52%, #100c09);
          color: #f4efe8;
        }

        .light-showcase-section::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: 0.72;
          pointer-events: none;
          background:
            radial-gradient(circle at 7% 8%, rgba(223, 194, 132, 0.9) 0 1px, transparent 2px),
            radial-gradient(circle at 12% 16%, rgba(240, 168, 74, 0.72) 0 1px, transparent 2px),
            radial-gradient(circle at 18% 21%, rgba(223, 194, 132, 0.75) 0 1px, transparent 2px),
            radial-gradient(circle at 83% 18%, rgba(255, 191, 104, 0.72) 0 1px, transparent 2px),
            radial-gradient(circle at 91% 13%, rgba(223, 194, 132, 0.8) 0 1px, transparent 2px),
            radial-gradient(circle at 76% 38%, rgba(240, 168, 74, 0.6) 0 1px, transparent 2px),
            radial-gradient(circle at 14% 76%, rgba(223, 194, 132, 0.8) 0 1px, transparent 2px),
            radial-gradient(circle at 21% 83%, rgba(255, 191, 104, 0.68) 0 1px, transparent 2px),
            radial-gradient(circle at 87% 73%, rgba(223, 194, 132, 0.75) 0 1px, transparent 2px),
            radial-gradient(circle at 94% 67%, rgba(240, 168, 74, 0.68) 0 1px, transparent 2px),
            radial-gradient(ellipse at -3% 0%, transparent 0 115px, rgba(240, 168, 74, 0.22) 116px 117px, transparent 118px 148px, rgba(240, 168, 74, 0.12) 149px 150px, transparent 151px),
            radial-gradient(ellipse at 103% 100%, transparent 0 180px, rgba(240, 168, 74, 0.18) 181px 182px, transparent 183px 218px, rgba(240, 168, 74, 0.12) 219px 220px, transparent 221px),
            linear-gradient(29deg, transparent 13.4%, rgba(240, 168, 74, 0.07) 13.5%, transparent 13.65%),
            linear-gradient(151deg, transparent 38.2%, rgba(240, 168, 74, 0.055) 38.3%, transparent 38.45%);
          background-size: auto;
        }

        .light-showcase-section::after {
          content: "";
          position: absolute;
          inset: 12px;
          z-index: -1;
          border: 1px solid rgba(240, 168, 74, 0.08);
          pointer-events: none;
          background:
            radial-gradient(ellipse at 14% 16%, rgba(194, 91, 24, 0.055), transparent 20%),
            radial-gradient(ellipse at 88% 76%, rgba(194, 91, 24, 0.045), transparent 22%);
        }

        .light-showcase-inner {
          width: min(100%, 1480px);
          margin: 0 auto;
          padding: clamp(42px, 5.5vw, 76px) var(--page-gutter) clamp(56px, 7vw, 92px);
        }

        .light-showcase-kicker {
          width: fit-content;
          margin-bottom: clamp(24px, 3.2vw, 42px);
          padding-bottom: 9px;
          border-bottom: 1px solid rgba(229, 181, 103, 0.5);
          color: #e2c17e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(0.72rem, 1.1vw, 0.95rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .light-showcase-feature {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 0.82fr);
          align-items: center;
          gap: clamp(28px, 7vw, 100px);
          margin-bottom: clamp(48px, 6vw, 76px);
        }

        .light-showcase-poster {
          position: relative;
          width: 100%;
          max-width: 520px;
          justify-self: end;
          margin: 0;
          padding: 8px;
          border: 1px solid rgba(213, 183, 118, 0.74);
          background: linear-gradient(145deg, rgba(240, 168, 74, 0.12), rgba(0,0,0,0.62));
          box-shadow: 0 24px 70px rgba(0,0,0,0.58), 0 0 26px rgba(240, 117, 32, 0.14);
        }

        .light-showcase-poster::before {
          content: "";
          position: absolute;
          inset: -9px;
          z-index: -1;
          border: 1px solid rgba(240, 168, 74, 0.22);
          pointer-events: none;
        }

        .light-showcase-poster img {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .light-showcase-intro {
          max-width: 620px;
        }

        .light-showcase-intro h2 {
          display: flex;
          flex-direction: column;
          margin: 0 0 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2.5rem, 5.6vw, 5.8rem);
          font-weight: 400;
          line-height: 0.86;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }

        .light-showcase-intro h2 em {
          margin-top: 12px;
          color: #e3c783;
          font-weight: 400;
          font-size: 0.68em;
          line-height: 1;
          letter-spacing: 0.01em;
          text-transform: none;
          font-style: italic;
        }

        .light-showcase-intro p {
          max-width: 48ch;
          margin: 0 0 20px;
          color: rgba(238, 229, 216, 0.72);
          font-size: clamp(0.78rem, 0.92vw, 0.95rem);
          line-height: 1.75;
        }

        .light-showcase-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .light-showcase-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 13px;
          border: 1px solid rgba(240, 168, 74, 0.48);
          color: #f0d4af;
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }

        .light-showcase-link-primary {
          border-color: #f0a84a;
          background: #f0a84a;
          color: #15100b;
        }

        .light-showcase-link:hover {
          border-color: #f0a84a;
          background: #f0a84a;
          color: #15100b;
        }

        .light-showcase-collection {
          position: relative;
          scroll-margin-top: 100px;
          margin-top: clamp(44px, 6vw, 72px);
        }

        .light-showcase-heading {
          margin-bottom: 18px;
          text-align: center;
        }

        .light-showcase-heading h3 {
          margin: 0;
          color: #f0d7b0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(1.05rem, 2vw, 1.55rem);
          font-weight: 400;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        #natural-cultural-illuminations .light-showcase-heading::before,
        #natural-cultural-illuminations .light-showcase-heading::after {
          content: "";
          position: absolute;
          top: 4px;
          width: 7px;
          height: 10px;
          border: 1px solid rgba(240, 168, 74, 0.55);
          border-radius: 50% 50% 55% 0;
          transform: rotate(-45deg);
        }

        #natural-cultural-illuminations .light-showcase-heading::before { left: 10%; }
        #natural-cultural-illuminations .light-showcase-heading::after { right: 10%; }

        .light-showcase-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(12px, 2.2vw, 28px);
        }

        .light-showcase-grid-with-controls::before,
        .light-showcase-grid-with-controls::after {
          position: absolute;
          top: 42%;
          color: rgba(240, 168, 74, 0.82);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 2rem;
          line-height: 1;
          pointer-events: none;
        }

        .light-showcase-grid-with-controls::before {
          content: "‹";
          left: -26px;
        }

        .light-showcase-grid-with-controls::after {
          content: "›";
          right: -26px;
        }

        .light-showcase-card {
          position: relative;
          min-width: 0;
          margin: 0;
          padding: 5px;
          border: 1px solid rgba(240, 168, 74, 0.68);
          border-radius: 4px;
          background: rgba(6, 14, 21, 0.72);
          box-shadow: 0 0 18px rgba(227, 199, 131, 0.14), 0 12px 28px rgba(0,0,0,0.32);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .light-showcase-card:hover {
          border-color: rgba(244, 213, 145, 0.95);
          box-shadow: 0 0 24px rgba(227, 199, 131, 0.23), 0 16px 34px rgba(0,0,0,0.4);
        }

        .light-showcase-image-wrap {
          overflow: hidden;
          aspect-ratio: 1.48;
          border: 1px solid rgba(240, 168, 74, 0.28);
          background: #08090a;
        }

        .light-showcase-image-wrap img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 54%;
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .light-showcase-card:hover img {
          transform: scale(1.045);
        }

        .light-showcase-card figcaption {
          position: absolute;
          right: 6px;
          bottom: 6px;
          left: 6px;
          padding: 22px 9px 8px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
          color: rgba(255,255,255,0.88);
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .light-showcase-card-link {
          display: block;
          width: fit-content;
          margin: 12px auto 0;
          padding: 7px 14px;
          border: 1px solid rgba(240, 168, 74, 0.48);
          border-radius: 999px;
          color: rgba(244, 223, 198, 0.86);
          font-size: 0.5rem;
          letter-spacing: 0.12em;
          text-align: center;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }

        .light-showcase-card-link:hover {
          border-color: #f0a84a;
          background: #f0a84a;
          color: #15100b;
        }

        @media (max-width: 700px) {
          .light-showcase-inner {
            padding: 36px 0 44px;
          }

          .light-showcase-feature {
            grid-template-columns: minmax(0, 1fr);
            gap: 22px;
            margin: 0 var(--page-gutter) 42px;
          }

          .light-showcase-kicker {
            margin: 0 var(--page-gutter) 22px;
          }

          .light-showcase-poster {
            width: 100%;
            max-width: 380px;
            justify-self: center;
          }

          .light-showcase-intro h2 {
            font-size: clamp(2rem, 10vw, 3.6rem);
          }

          .light-showcase-collection {
            margin-top: 40px;
          }

          .light-showcase-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
            overflow: visible;
            padding: 4px var(--page-gutter) 12px;
          }

          .light-showcase-grid:focus-visible {
            outline: 2px solid #f0a84a;
            outline-offset: -2px;
          }

          .light-showcase-grid-with-controls::before,
          .light-showcase-grid-with-controls::after {
            display: none;
          }

          .light-showcase-card {
            min-width: 0;
            flex: initial;
            padding: 3px;
          }

          .light-showcase-image-wrap {
            aspect-ratio: 1.48;
          }

          .light-showcase-card figcaption {
            right: 4px;
            bottom: 4px;
            left: 4px;
            padding: 14px 3px 5px;
            font-size: clamp(0.44rem, 1.8vw, 0.55rem);
            letter-spacing: 0.04em;
          }

          .light-showcase-section::after {
            inset: 6px;
          }

          #natural-cultural-illuminations .light-showcase-heading::before { left: 1%; }
          #natural-cultural-illuminations .light-showcase-heading::after { right: 1%; }

          .light-showcase-card-link {
            width: 100%;
            min-height: 40px;
            padding: 6px 3px;
            font-size: clamp(0.46rem, 1.8vw, 0.55rem);
            letter-spacing: 0.04em;
          }
        }

        /* =====================================================
           TEAM SECTION
           ===================================================== */
        .team-scroll-section {
          position: relative;
          width: 100%;
          padding: 0;
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
          width: 100%;
          margin: 0 0 30px;
          padding: 0 var(--page-gutter);
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
          padding-left: var(--page-gutter);
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
          padding: 60px var(--page-gutter);
          width: 100%;
          max-width: none;
          margin: 0;
          background-color: #121212;
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

        .contact-form input:hover,
        .contact-form textarea:hover,
        .contact-form select:hover {
          border-color: #f0a84a;
        }

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
          width: min(100%, 960px);
          grid-template-columns: repeat(2, minmax(0, 420px));
          justify-content: center;
          gap: clamp(32px, 5vw, 64px);
          margin: 80px auto 0;
          align-items: center;
        }

        .map-address {
          justify-self: start;
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
          width: min(100%, 420px);
          aspect-ratio: 2 / 2;
          justify-self: end;
          grid-column: 2;
          grid-row: 1;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .map-embed iframe {
          display: block;
          width: 100%;
          height: 100%;
          filter: invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2);
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }

        .footer-inner {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 80px var(--page-gutter) 60px;
          display: grid;
          grid-template-columns: 1.4fr 1.6fr;
          gap: 32px;
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
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 24px var(--page-gutter);
          text-align: left;
        }

        .footer-bottom span {
          font-size: 12px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 1px;
        }

        /* RESPONSIVE */
        @media (max-width: 1200px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 56px var(--page-gutter) 40px;
          }
        }

        @media (max-width: 980px) {
          :root {
            --page-gutter: clamp(12px, 2vw, 18px);
          }

          .footer-inner {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 56px var(--page-gutter) 40px;
          }

          .footer-links-group {
            gap: 24px;
          }

          .about-inner,
          .form-row {
            grid-template-columns: 1fr;
          }

          .map-section {
            grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
            gap: 24px;
          }

          .map-embed {
            width: min(100%, 340px);
          }

          .services-grid {
            width: 100%;
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
            margin-left: var(--page-gutter);
            margin-right: 60px;
          }

          .services-copy { width: 100%; }

          .feature-work-copy {
            left: var(--page-gutter);
            width: min(400px, 48vw);
          }

          .feature-work-side-note { display: none; }
          .feature-work-journey { left: 30px; right: 30px; }
          .feature-work-timeline { gap: 12px; }
          .feature-work-stage-label { gap: 5px; font-size: 7px; }
        }

        @media (max-width: 900px) {
          .nav {
            padding: 16px var(--page-gutter);
          }

          .nav-toggle {
            display: flex;
          }

          .nav-links {
            position: fixed;
            top: 0;
            right: 0;
            width: min(82vw, 340px);
            height: 100vh;
            height: 100dvh;
            background: rgba(10,10,10,0.98);
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 32px;
            transform: translateX(101%);
            visibility: hidden;
            transition: transform 0.4s ease, visibility 0.4s ease;
          }

          .nav-links.nav-open {
            transform: translateX(0);
            visibility: visible;
          }
        }

        @media (max-width: 768px) {
          :root {
            --page-gutter: clamp(12px, 2vw, 16px);
          }

          .services-grid {
            width: 100%;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }

          .service-row {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            align-items: stretch;
            gap: 10px;
          }

          .service-row:nth-child(4) {
            translate: none;
            margin-bottom: 0;
          }

          .service-card,
          .service-card.small {
            width: 100%;
            aspect-ratio: 0.92;
            min-height: 0;
          }

          .service-row:nth-child(odd) .service-card {
            grid-column: 1;
            grid-row: 1;
          }

          .service-row:nth-child(odd) .service-detail {
            grid-column: 2;
            grid-row: 1;
          }

          .service-row:nth-child(even) .service-card {
            grid-column: 2;
            grid-row: 1;
          }

          .service-row:nth-child(even) .service-detail {
            grid-column: 1;
            grid-row: 1;
          }

          .service-detail,
          .service-row:nth-child(even) .service-detail {
            max-width: none;
            padding: 12px 4px;
            align-self: center;
          }

          .service-detail-index {
            margin-bottom: 8px;
            font-size: 0.5rem;
            letter-spacing: 0.14em;
          }

          .service-detail h3 {
            max-width: none;
            margin-bottom: 8px;
            font-size: clamp(1.15rem, 4.6vw, 1.8rem);
            line-height: 1.02;
          }

          .service-detail p {
            font-size: clamp(0.68rem, 2.7vw, 0.82rem);
            line-height: 1.55;
          }

          .service-detail-line {
            width: min(100%, 110px);
            margin-top: 18px;
          }

          .contact-section,
          .about-section {
            padding: 70px var(--page-gutter);
          }

          .map-section {
            grid-template-columns: minmax(0, 1fr);
            gap: 28px;
            justify-items: center;
          }

          .map-address {
            width: min(100%, 420px);
          }

          .map-embed {
            width: min(100%, 420px);
            grid-column: 1;
            grid-row: auto;
            justify-self: center;
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
          .team-top-header { padding: 0 var(--page-gutter); }
          .process-merged-track {
            height: clamp(300px, 62svh, 460px);
            margin-left: var(--page-gutter);
            margin-right: 40px;
          }

          .process-slider-viewport {
            overflow-x: auto;
            overflow-y: hidden;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }
          .process-slider-viewport::-webkit-scrollbar { display: none; }
          .process-merged-track { transform: none !important; }
          .process-merged-panel { scroll-snap-align: start; }
          .process-scroll-hint-desktop { display: none; }
          .process-scroll-hint-mobile { display: inline; }
          .process-merged-panel {
            width: clamp(400px, 82.6667svh, 613.33px);
          }
          .work-gallery-page {
            padding: 24px 20px 56px;
          }
          .work-gallery-topbar {
            gap: 12px;
            padding-bottom: 16px;
          }
          .work-gallery-back {
            flex: 0 0 auto;
            min-height: 44px;
            margin: 0;
            padding: 10px 0;
          }
          .work-gallery-index {
            text-align: right;
            font-size: 0.52rem;
            letter-spacing: 0.12em;
          }
          .work-gallery-header {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
            padding: 50px 0 32px;
          }
          .work-gallery-header h1 {
            font-size: clamp(3.2rem, 15vw, 6rem);
            line-height: 0.9;
          }
          .work-gallery-header p {
            max-width: 100%;
            font-size: 0.9rem;
          }
          .team-scroll-track {
            padding-left: var(--page-gutter);
            padding-right: 60px;
          }
          .team-scroll-viewport {
            overflow-x: auto;
            overflow-y: hidden;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }
          .team-scroll-viewport::-webkit-scrollbar { display: none; }
          .team-scroll-track { transform: none !important; }
          .team-slide-card { scroll-snap-align: start; }
          .team-scroll-hint-desktop { display: none; }
          .team-scroll-hint-mobile { display: inline; }
          .team-slide-card { width: 290px; flex: 0 0 290px; }
          .work-gallery-grid { grid-template-columns: 1fr; }
          .work-gallery-item,
          .work-gallery-item-wide {
            grid-column: auto;
            aspect-ratio: 1.15 / 1;
          }
        }

        @media (max-width: 600px) {
          :root {
            --page-gutter: 12px;
          }

          html,
          body {
            overflow-x: hidden;
          }

          .nav {
            padding: calc(10px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 10px max(16px, env(safe-area-inset-left));
          }

          .nav-scrolled {
            padding-top: calc(8px + env(safe-area-inset-top));
            padding-bottom: 8px;
          }

          .nav-brand {
            font-size: clamp(12px, 3.6vw, 15px);
            letter-spacing: 0.08em;
          }

          .nav-toggle {
            width: 44px;
            height: 44px;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .nav-links a {
            min-height: 44px;
            display: flex;
            align-items: center;
            font-size: 14px;
          }

          .hero {
            height: 100svh;
            min-height: 100svh;
            padding-right: var(--page-gutter);
            padding-left: var(--page-gutter);
            padding-top: calc(72px + env(safe-area-inset-top));
          }

          .section-heading,
          .about-heading,
          .contact-heading,
          .work-heading,
          .services-heading,
          .team-heading {
            overflow-wrap: anywhere;
          }

          .section-label {
            padding-left: 28px;
            font-size: 10px;
            letter-spacing: 0.22em;
          }

          .section-label::before {
            width: 18px;
          }

          .about-section,
          .contact-section {
            padding: 64px var(--page-gutter);
          }

          .about-inner {
            gap: 32px;
          }

          .about-heading {
            font-size: clamp(2.1rem, 8.5vw, 3rem);
            line-height: 1.02;
            margin-bottom: 20px;
          }

          .about-text {
            font-size: 15px;
            line-height: 1.8;
          }

          .about-team-photo-header {
            gap: 8px;
            font-size: 8px;
            letter-spacing: 0.08em;
          }

          .about-team-placeholder span {
            font-size: 15px;
            letter-spacing: 0.2em;
          }

          .about-team-placeholder small {
            font-size: 8px;
            letter-spacing: 0.12em;
          }

          .marquee-section {
            gap: 12px;
            padding: 20px 0;
          }

          .hero-bg-video {
            animation: none;
            transform: scale(1.04);
          }

          .marquee-track {
            gap: 12px;
          }

          .marquee-item {
            width: min(72vw, 300px);
            height: auto;
            aspect-ratio: 3 / 2;
          }

          .marquee-fade-left,
          .marquee-fade-right {
            width: 48px;
          }

          .services-section {
            padding: 48px var(--page-gutter) 36px;
          }

          .services-header {
            gap: 18px;
            margin-bottom: 22px;
          }

          .services-heading {
            font-size: clamp(2rem, 8.5vw, 3.25rem);
            line-height: 0.98;
            letter-spacing: -0.06em;
          }

          .services-label {
            font-size: 0.65rem;
          }

          .services-copy {
            font-size: 0.9rem;
            line-height: 1.65;
          }

          .services-meta {
            gap: 10px 12px;
            font-size: 0.55rem;
            letter-spacing: 0.14em;
          }

          .services-grid {
            gap: 10px;
          }

          .service-card,
          .service-card.small {
            min-width: 0;
            aspect-ratio: 6 / 3;
            min-height: 0;
          }

          .service-card-content {
            padding: 8px;
          }

          .service-topline {
            margin-bottom: 4px;
          }

          .service-number {
            font-size: clamp(1.15rem, 6vw, 1.5rem);
          }

          .service-kicker {
            display: none;
          }

          .service-card h3 {
            margin-bottom: 4px;
            font-size: clamp(0.85rem, 4.2vw, 1.1rem);
            line-height: 0.98;
            letter-spacing: -0.045em;
          }

          .service-card p {
            display: -webkit-box;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            font-size: clamp(0.52rem, 2.25vw, 0.66rem);
            line-height: 1.3;
          }

          .service-cta {
            min-height: 30px;
            width: fit-content;
            justify-content: flex-start;
            margin: 7px 0 0;
            padding: 6px;
            gap: 4px;
            font-size: clamp(0.36rem, 1.8vw, 0.46rem);
            letter-spacing: 0.035em;
          }

          .services-footer {
            gap: 8px;
            font-size: 0.56rem;
            letter-spacing: 0.1em;
          }

          .process-pinned-wrap {
            height: 100svh;
            min-height: 560px;
            padding: max(18px, env(safe-area-inset-top)) 0 max(18px, env(safe-area-inset-bottom));
          }

          .process-top-header,
          .team-top-header {
            padding: 0 var(--page-gutter);
            gap: 12px;
          }

          .process-top-header {
            margin-bottom: 14px;
          }

          .process-heading {
            font-size: clamp(1.55rem, 7vw, 2.4rem);
            line-height: 1.05;
          }

          .process-scroll-hint {
            gap: 7px;
            font-size: 8px;
            letter-spacing: 0.16em;
          }

          .process-progress-bar {
            width: min(180px, 46vw);
          }

          .process-merged-track {
            gap: 14px;
            height: clamp(220px, 48svh, 340px);
            margin-left: var(--page-gutter);
            margin-right: 24px;
          }

          .process-merged-panel {
            width: min(calc(100vw - 36px), 453.33px);
            height: auto;
            aspect-ratio: 4 / 3;
            align-self: center;
            border-radius: 12px;
          }

          .process-panel-keywords {
            gap: 5px;
          }

          .process-panel-keywords li {
            font-size: 9px;
            letter-spacing: 0.16em;
          }

          .team-pinned-wrap {
            height: 100svh;
            min-height: 600px;
            padding: max(22px, env(safe-area-inset-top)) 0 max(22px, env(safe-area-inset-bottom));
          }

          .team-top-header {
            margin-bottom: 14px;
          }

          .team-heading {
            font-size: clamp(2rem, 8vw, 3rem);
            line-height: 1;
          }

          .team-scroll-track {
            gap: 16px;
            padding-left: var(--page-gutter);
            padding-right: 32px;
          }

          .team-slide-card {
            width: min(290px, calc(100vw - 40px));
            flex: 0 0 min(290px, calc(100vw - 40px));
            border-radius: 12px;
          }

          .team-slide-img-wrap {
            height: clamp(180px, 29svh, 250px);
          }

          .team-slide-body {
            padding: 16px 18px 18px;
          }

          .team-slide-role {
            font-size: 9px;
            letter-spacing: 0.16em;
          }

          .team-slide-name {
            font-size: 19px;
            margin-bottom: 10px;
          }

          .team-slide-highlights {
            gap: 6px;
            margin-bottom: 14px;
          }

          .team-slide-highlights li {
            font-size: 12px;
          }

          .team-slide-more {
            min-height: 40px;
            display: inline-flex;
            align-items: center;
          }

          .team-modal-backdrop {
            padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
          }

          .team-modal {
            max-height: 90svh;
            overflow-y: auto;
            padding: 28px 22px;
            border-radius: 16px;
          }

          .contact-heading,
          .contact-heading-highlight {
            font-size: clamp(2rem, 8.5vw, 3rem);
            line-height: 1.05;
          }

          .contact-heading {
            margin-bottom: 28px;
          }

          .contact-form {
            gap: 24px;
          }

          .form-row {
            gap: 22px;
          }

          .form-group label {
            font-size: 10px;
            letter-spacing: 0.18em;
          }

          input,
          textarea,
          select {
            min-height: 48px;
            font-size: 16px;
          }

          .contact-form button {
            min-height: 52px;
            width: 100%;
            padding: 16px 20px;
            align-self: stretch;
            font-size: 12px;
          }

          .map-section {
            gap: 24px;
            margin-top: 48px;
          }

          .address-text {
            font-size: 15px;
          }

          .footer-inner {
            gap: 30px;
            padding: 40px var(--page-gutter) 32px;
          }

          .footer-brand-col {
            display: grid;
            grid-template-columns: 44px minmax(0, 1fr);
            align-items: center;
            column-gap: 14px;
          }

          .footer-logo {
            width: 44px;
            margin: 0;
            grid-row: span 2;
          }

          .footer-brand-name {
            margin: 0;
            font-size: 14px;
            line-height: 1.35;
          }

          .footer-copy {
            grid-column: 1 / -1;
            margin-top: 18px;
          }

          .footer-links-group {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px 20px;
          }

          .footer-links-group > .footer-col:last-child {
            grid-column: 1 / -1;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }

          .footer-col h4 {
            margin-bottom: 14px;
            font-size: 10px;
            letter-spacing: 0.14em;
          }

          .footer-col a,
          .footer-col p {
            font-size: 13px;
          }

          .footer-col a {
            width: fit-content;
            min-height: 36px;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
          }

          .footer-bottom-inner {
            padding: 20px 16px max(20px, env(safe-area-inset-bottom));
          }

          .footer-bottom span {
            font-size: 10px;
            line-height: 1.6;
          }

          .work-gallery-item-info {
            left: 14px;
            right: 14px;
            bottom: 14px;
          }

          .fullscreen {
            padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
          }

          .fullscreen img,
          .fullscreen video {
            max-width: 100%;
            max-height: 88svh;
          }
        }

        @media (max-width: 380px) {
          .nav {
            padding-right: max(12px, env(safe-area-inset-right));
            padding-left: max(12px, env(safe-area-inset-left));
          }

          .nav-brand {
            font-size: 11px;
            letter-spacing: 0.06em;
          }

          .about-section,
          .contact-section,
          .services-section {
            padding-right: var(--page-gutter);
            padding-left: var(--page-gutter);
          }

          .footer-inner {
            padding-right: 16px;
            padding-left: 16px;
          }

          .footer-links-group {
            gap: 24px 12px;
          }

          .process-top-header,
          .team-top-header {
            padding-right: var(--page-gutter);
            padding-left: var(--page-gutter);
          }

          .process-merged-track,
          .team-scroll-track {
            margin-left: 0;
            padding-left: var(--page-gutter);
          }

          .process-merged-track {
            margin-left: 0;
          }
        }

        @media (max-width: 600px) and (max-height: 700px) {
          .team-pinned-wrap {
            min-height: 560px;
          }

          .team-slide-img-wrap {
            height: clamp(160px, 25svh, 190px);
          }

          .process-pinned-wrap {
            min-height: 520px;
          }
        }

        @media (max-width: 900px) and (max-height: 500px) {
          .process-pinned-wrap,
          .team-pinned-wrap {
            height: 100svh;
            min-height: 320px;
            padding: 12px 0;
          }

          .process-top-header,
          .team-top-header {
            flex-direction: row;
            align-items: flex-end;
            margin-bottom: 8px;
          }

          .process-heading,
          .team-heading {
            font-size: clamp(1.35rem, 4vw, 2rem);
          }

          .process-scroll-hint {
            flex-shrink: 0;
          }

          .process-merged-track {
            height: clamp(160px, 55svh, 220px);
            margin-left: 18px;
          }

          .process-merged-panel {
            width: min(293.33px, 73.33svh);
          }

          .team-slide-card {
            flex-direction: row;
            width: min(430px, calc(100vw - 36px));
            flex: 0 0 min(430px, calc(100vw - 36px));
            min-height: 220px;
            max-height: 270px;
          }

          .team-slide-img-wrap {
            height: auto;
            flex: 0 0 38%;
            align-self: stretch;
          }

          .team-slide-body {
            min-width: 0;
            padding: 12px 14px;
          }

          .team-slide-role {
            font-size: 8px;
            letter-spacing: 0.12em;
          }

          .team-slide-name {
            font-size: 17px;
            margin-bottom: 6px;
          }

          .team-slide-highlights {
            gap: 4px;
            margin-bottom: 8px;
          }

          .team-slide-highlights li {
            font-size: 10px;
            line-height: 1.3;
          }

          .team-slide-more {
            min-height: 34px;
            font-size: 9px;
          }
        }

        @media (hover: none) {
          .service-card:hover,
          .team-slide-card:hover {
            transform: none;
          }

          .service-card:hover .service-media img,
          .service-card:hover .service-media video,
          .team-slide-card:hover .team-slide-img-wrap img {
            transform: none;
          }
        }
      `}</style>
      <style>{`
        html {
          background: #0d0d0e;
        }

        body {
          background: transparent;
        }

        .bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
          background: #0d0d0e;
        }

        .o {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .o1 {
          width: 62vw;
          height: 62vw;
          left: -18vw;
          top: 8vh;
          background: radial-gradient(circle, rgba(240,168,74,.24), transparent 66%);
          animation: drift1 26s ease-in-out infinite alternate;
          translate: 0 var(--bg-parallax-o1, 0px);
        }

        .o2 {
          width: 52vw;
          height: 52vw;
          right: -14vw;
          top: 46vh;
          background: radial-gradient(circle, rgba(70,140,205,.16), transparent 66%);
          animation: drift2 32s ease-in-out infinite alternate;
          translate: 0 var(--bg-parallax-o2, 0px);
        }

        .o3 {
          width: 44vw;
          height: 44vw;
          left: 28vw;
          bottom: -18vh;
          background: radial-gradient(circle, rgba(184,106,240,.12), transparent 66%);
          animation: drift1 38s ease-in-out infinite alternate-reverse;
        }

        @keyframes drift1 {
          to { transform: translate3d(9vw, 6vh, 0) scale(1.12); }
        }

        @keyframes drift2 {
          to { transform: translate3d(-8vw, -7vh, 0) scale(1.1); }
        }

        .bg .grid {
          position: absolute;
          inset: -72px 0 0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 72px 72px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 38%, #000, transparent 72%);
          mask-image: radial-gradient(ellipse at 50% 38%, #000, transparent 72%);
          translate: 0 var(--bg-parallax-grid, 0px);
        }

        .motes {
          position: absolute;
          inset: 0;
        }

        .mote {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #ffe2b0;
          box-shadow: 0 0 6px #ffcf8a;
          opacity: 0;
          animation: mote linear infinite;
        }

        @keyframes mote {
          0% { transform: translate3d(0,0,0); opacity: 0; }
          15% { opacity: .75; }
          100% { transform: translate3d(var(--dx),-42vh,0); opacity: 0; }
        }

        .hero::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 72%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          background: conic-gradient(
            from 196deg at 100% 0,
            transparent 0deg,
            rgba(255,217,160,.15) 10deg,
            transparent 20deg,
            rgba(255,217,160,.1) 31deg,
            transparent 43deg,
            rgba(255,217,160,.07) 56deg,
            transparent 70deg
          );
          -webkit-mask-image: linear-gradient(to bottom left, #000, transparent 78%);
          mask-image: linear-gradient(to bottom left, #000, transparent 78%);
        }

        #about,
        #services,
        #process,
        #team,
        #contact {
          position: relative;
          border-top: 1px solid rgba(255,255,255,.05);
        }

        #about::after,
        #services::after,
        #process::after,
        #team::after,
        #contact::after {
          content: "";
          position: absolute;
          top: -1px;
          left: 8%;
          width: 28%;
          height: 1px;
          z-index: 2;
          pointer-events: none;
          opacity: .7;
          background: linear-gradient(90deg, transparent, #f0a84a, transparent);
        }

        #about > .about-inner,
        #services > .services-header,
        #services > .services-grid,
        #process > .process-pinned-wrap,
        #team > .team-pinned-wrap,
        #contact > .contact-inner {
          position: relative;
          z-index: 1;
        }

        #about {
          background: radial-gradient(520px 380px at 82% 55%, rgba(240,168,74,.1), transparent 70%);
        }

        #process {
          background: rgba(8,8,8,.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        #team {
          background: rgba(8,8,8,.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }

        #contact {
          background:
            radial-gradient(520px 420px at 86% 42%, rgba(240,168,74,.16), transparent 70%),
            radial-gradient(circle at 86% 42%, transparent 8%, #0d0d0e 72%),
            repeating-radial-gradient(circle at 86% 42%, rgba(255,217,160,.09) 0 1px, transparent 1px 58px);
        }

        .process-merged-track {
          position: relative;
        }

        .process-merged-panel::before,
        .process-merged-panel::after {
          content: "";
          position: absolute;
          left: 0;
          width: 100%;
          height: 22px;
          z-index: 3;
          pointer-events: none;
          background:
            radial-gradient(ellipse 4px 6px at center, #080808 0 72%, rgba(240,168,74,.72) 82% 100%, transparent 110%)
              12px center / 28px 14px repeat-x,
            linear-gradient(180deg, rgba(31,23,14,.98), rgba(8,8,8,.98));
          border-color: rgba(240,168,74,.2);
        }

        .process-merged-panel::before {
          top: 0;
          border-bottom: 1px solid rgba(240,168,74,.2);
        }

        .process-merged-panel::after {
          bottom: 0;
          border-top: 1px solid rgba(240,168,74,.2);
        }

        .process-merged-panel {
          border-color: rgba(240,168,74,.28);
          border-radius: 10px;
          box-shadow:
            0 20px 48px rgba(0,0,0,.5),
            inset 0 0 0 1px rgba(255,217,160,.08);
        }

        .process-concept-full-img {
          inset: 22px 0;
          width: 100%;
          height: calc(100% - 44px);
        }

        .process-panel-content {
          padding-top: 38px;
          padding-bottom: 38px;
        }

        .team-slide-card,
        .service-card {
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.015));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
        }

        .service-card,
        .team-slide-card,
        .service-media,
        .team-slide-img-wrap,
        .process-merged-panel,
        .work-gallery-item {
          box-shadow:
            0 36px 80px -36px rgba(0,0,0,.8),
            inset 0 1px 0 rgba(255,255,255,.09);
        }

        .section-heading,
        .about-heading,
        .contact-heading,
        .work-heading,
        .services-heading,
        .team-heading,
        .process-heading {
          text-shadow: 0 0 46px rgba(240,168,74,.14);
        }

        .contact-disclaimer,
        .footer-copy,
        .footer-bottom span,
        .footer-col p,
        .footer-col a,
        .footer-col h4,
        .team-slide-role,
        .team-slide-highlights li,
        .form-group label {
          color: #b5b5b5;
        }

        @media (max-width: 700px) {
          .o3,
          .mote:nth-child(n+13) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .o,
          .mote {
            animation: none;
            translate: none;
          }

          .bg .grid {
            translate: none;
          }
        }
      `}</style>
    </>
  );
}