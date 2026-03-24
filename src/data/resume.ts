export type ResumeCategory = 'Education' | 'Experience' | 'Projects' | 'Interests';

export interface ResumeItem {
  id: string;
  title: string;
  category: ResumeCategory;
  subtitle?: string;
  date?: string;
  bullets: string[];

  // Consolidated Interest Data
  interestTitle: string;
  interestBullets: string[];

  // Centralized Asset Config
  modelUrl?: string;
  scale: number;
  hoverScale: number;
  glowEnabled: boolean;
  // Asset rotation in degrees: [x, y, z]
  rotation: [number, number, number];
  // Sci-Fi Room coordinates: [x, y, z]
  position: [number, number, number];
  // Primitive shape type to render (or custom group string)
  shape: string;
  // Neon color
  color: string;
  // Click behavior
  clickable?: boolean;
  // Custom camera target when zoomed in [x, y, z]
  zoomTarget?: [number, number, number];
  // Distance from object when zooming (defaults to +4 if zoomTarget not set)
  zoomDistance?: number;
  // Per-asset zoom limits (overrides cameraConfig)
  minZoom?: number;
  maxZoom?: number;
  // Preview box settings
  previewConfig?: {
    position?: [number, number, number];
    rotation?: [number, number, number]; // [x, y, z] in degrees
    rotationSpeed?: number;
    autoRotate?: boolean;
  };
  // Optional image preview instead of 3D
  imageUrl?: string;
}

export interface CameraConfig {
  minZoom: number;
  maxZoom: number;
  recenterRotation: { yaw: number; pitch: number };
  recenterZoom: number;
}

export const cameraConfig: CameraConfig = {
  minZoom: 0.5,
  maxZoom: 1.8,
  recenterRotation: { yaw: Math.PI / 4, pitch: 0.2 },
  recenterZoom: 1.0,
};

// =============================================================
// SCI-FI ROOM WORLD-SPACE REFERENCE:
//   Desk Pivot: [0, -1, 3.0]
//   Bed Surface: Y ≈ 0.4, Z ≈ -4.4
//   Table: Y ≈ 0.9
//   Floor: Y ≈ -1.0
// ==========================================================
export const resumeData: ResumeItem[] = [
  // 1. EDUCATION
  {
    id: 'osu',
    title: 'The Ohio State University',
    interestTitle: 'Education',
    category: 'Education',
    subtitle: 'Bachelor of Science in Business Administration',
    date: 'May 2027',
    bullets: [
      'Specialization: Economics and Finance | Minor: Computer Science | GPA: 3.88/4.00',
      'Maximus Scholarship Recipient',
      'Integrated Business and Engineering Software Innovation Track (IBE-SI)',
      'Consumer Packaged Goods Industry Immersion'
    ],
    interestBullets: ['Achieving academic excellence and pursuing cross-disciplinary innovation at OSU.'],
    modelUrl: '/models/diploma_frame.glb',
    scale: 1.5,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 90, 0],
    position: [-3, 1.35, -4.25],
    shape: 'certificate',
    color: '#00ffff',
    clickable: true,
    zoomTarget: [-1, 2.5, -3], // Close-up on diploma stand
    zoomDistance: 3,
    previewConfig: {
      rotation: [0, 90, 0],
      rotationSpeed: 0.005,
      autoRotate: true
    }
  },

  // 1.5 ABOUT ME (INTERNAL)
  {
    id: 'about-me',
    title: 'Aditya Induri',
    interestTitle: 'Profile',
    category: 'Experience',
    subtitle: 'Software Engineer & Innovator',
    date: 'Founding Future Interfaces',
    bullets: [
      "I'm a software engineer passionate about creating immersive digital experiences that blur the line between utility and art.",
      "Specializing in interactive 3D web applications, generative AI integration, and fintech prototypes.",
      "Dedicated to driving innovation at the intersection of economics, finance, and technology."
    ],
    interestBullets: ['Bridging the gap between complex data and intuitive human-centric design.'],
    imageUrl: '/Induri.Aditya_Headshot.jpg',
    scale: 1,
    hoverScale: 1,
    glowEnabled: false,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    shape: 'profile',
    color: '#000000',
    clickable: true
  },

  // 2. EXPERIENCE
  {
    id: 'morgan-stanley',
    title: 'Morgan Stanley',
    interestTitle: 'Trading / Financial News',
    category: 'Experience',
    subtitle: 'Risk Management Summer Analyst',
    date: 'June 2025 – August 2025',
    bullets: [
      'Rotated every 2 weeks across 4 ISG risk desks – Counterparty, Electronic Trading, Data & Cyber, and Financial Crimes',
      'Discovered 4 use cases for AI & Automation of which 3 were immediately adopted making tasks 65% more efficient',
      'Compared key issues that led to the Citi Flash Crash against Morgan Stanley\'s current controls to identify and fix gaps'
    ],
    interestBullets: ['Fascinated by financial markets, quantitative strategies, and algorithmic trading.'],
    modelUrl: '/models/charging_bull.glb',
    scale: 1.5,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-3.75, 0.9, -1],
    shape: 'bull',
    color: '#ffaa00',
    clickable: true,
    zoomTarget: [-2, 2.5, 2], // View from the side/front of the table
    zoomDistance: 4,
    previewConfig: {
      rotation: [45, 45, 0],
      rotationSpeed: 0.01,
      autoRotate: true
    }
  },

  {
    id: 'emsi',
    title: 'Excel Management Systems, Inc. (EMSI)',
    interestTitle: 'Chess',
    category: 'Experience',
    subtitle: 'Growth and Strategy Intern',
    date: 'May 2022 – June 2025',
    bullets: [
      'Identified software and hardware reselling to state, local, and educational departments (SLED) as a pivotal area of expansion and personally won $265,000+ worth of reselling opportunities',
      'Completed a successful transition process creating a new company division generating $1,000,000+ of annual revenue',
      'Assisted from deal origination and diligence to strategy implementation, contributing to a successful acquisition'
    ],
    interestBullets: ['Deeply interested in strategic chess gameplay and tactical analysis.'],
    modelUrl: '/models/chessboard.glb',
    scale: 0.75,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [0, -1, 1.5],
    shape: 'chessboard',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 3.5
  },

  {
    id: 'keybank',
    title: 'KeyBank',
    interestTitle: 'Badminton',
    category: 'Experience',
    subtitle: 'Wealth Management Analytics Intern',
    date: 'June 2024 – August 2024',
    bullets: [
      'Developed a real-time dashboard by utilizing Tableau that compared the performance of client relationship managers',
      'Separated and sorted components of a data dictionary reducing processing time by 80% by coding multiple Excel Macros',
      'Documented the front and back-end processes of transactions to identify overall net flows for KeyBank using Miro'
    ],
    interestBullets: ['Enjoy playing badminton competitively and for fitness.'],
    modelUrl: '/models/hyper_badminton.glb',
    scale: 1.0,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [0.8, 0.25, -4.4],
    shape: 'racket',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 3, // Closer view of badminton racket
    previewConfig: {
      rotation: [0, 45, 90],
      position: [0, -0.5, 0],
      rotationSpeed: 0.02,
      autoRotate: true
    }
  },

  {
    id: 'columbus-capital',
    title: 'Columbus Capital Holding',
    interestTitle: 'Virtual Reality',
    category: 'Experience',
    subtitle: 'Wealth Management Intern',
    date: 'January 2023 – May 2024',
    bullets: [
      'Managed a $400,000 portfolio and invested by reviewing investment strategies, potentials, and drawbacks with client',
      'Parsed 2,500+ bank statements using Python, Playwright, and an LLM to consolidate relevant financial data'
    ],
    interestBullets: ['Exploring immersive virtual reality environments and technologies.'],
    modelUrl: '/models/vr_headset_free_model.glb',
    scale: 0.1,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-0.6, 0.4, -4.4],
    shape: 'vr',
    color: '#2e2e2c',
    clickable: true,
    zoomDistance: 2.5,
    previewConfig: {
      rotation: [0, 180, 0],
      rotationSpeed: 0.005,
      autoRotate: true
    }
  },

  // 3. PROJECTS
  {
    id: 'delphi',
    title: 'Delphi Investment',
    interestTitle: 'Video Games',
    category: 'Projects',
    subtitle: 'Founder and CEO',
    date: 'August 2023 – June 2024',
    bullets: [
      'Founded a fintech startup that makes structured notes more accessible by acting as a pooling and secondaries platform',
      'Performed customer/market validation, communicated with subject-matter-experts and mentors, and researched competitors',
      'Designed and developed an alpha version of the website using various front and back-end systems as well as APIs'
    ],
    interestBullets: ['Passionate about exploring game mechanics, level design, and immersive storytelling.'],
    scale: 0.6, // Used as monitorPivot scale
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [0, 2.53, 0.1], // Relative to deskPivot
    shape: 'monitor',
    color: '#00ffff',
    clickable: true,
    zoomDistance: 3.5,
    previewConfig: {
      rotation: [0, 45, 0],
      rotationSpeed: 0.005,
      autoRotate: true
    }
  },

  {
    id: 'arbitrage-app',
    title: 'Arbitrage App',
    interestTitle: 'SFF PC Building',
    category: 'Projects',
    subtitle: 'Founder',
    date: 'December 2022 – June 2023',
    bullets: [
      'Engineered an automated sports-betting arbitrage application using Python and Playwright that scraped various sportsbooks to identify odds discrepancies and optimized bonus bets usage, resulting in ~$10,000 of risk-free earnings'
    ],
    interestBullets: ['Building and modifying Small-Form-Factor (SFF) desktop PCs for optimized performance and aesthetics.'],
    scale: 0.48, // Used as pcPivot scale
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-4, 2.5, -1.5],
    shape: 'computer',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 4,
    previewConfig: {
      rotation: [0, -45, 0],
      rotationSpeed: 0.005,
      autoRotate: true
    }
  },

  {
    id: 'hephasbot',
    title: 'Hephasbot',
    interestTitle: 'Robotics',
    category: 'Projects',
    subtitle: 'Founder',
    date: 'January 2026 – Present',
    bullets: [
      'Assembled the SO-ARM101 follower and leader arms based on the Hugging Face Lerobot framework',
      'Coded the first website that allows non-technical users to configure motors, calibrate, and teleoperate a robot'
    ],
    interestBullets: ['Building and programming autonomous systems and robotic arms.'],
    modelUrl: '/models/robot_character.glb',
    scale: 2.0,
    hoverScale: 1.6,
    glowEnabled: true,
    rotation: [0, -90, 0],
    position: [0, -1.0, 1.0],
    shape: 'robot',
    color: '#00ccff',
    clickable: true,
    zoomTarget: [3, 2, 5], // Wide view of the robot
    zoomDistance: 6,
    previewConfig: {
      rotation: [0, -90, 0],
      rotationSpeed: 0.015,
      autoRotate: true
    }
  }
];
