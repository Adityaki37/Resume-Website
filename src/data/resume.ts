export type ResumeCategory = 'Education' | 'Experience' | 'Involvements' | 'Projects' | 'Interests';

export interface ResumeItem {
  id: string;
  title: string;
  category: ResumeCategory;
  subtitle?: string;
  date?: string;
  bullets: string[];

  interestTitle: string;
  interestBullets: string[];

  modelUrl?: string;
  scale: number;
  hoverScale: number;
  glowEnabled: boolean;
  rotation: [number, number, number];
  position: [number, number, number];
  shape: string;
  color: string;
  clickable?: boolean;
  zoomTarget?: [number, number, number];
  zoomDistance?: number;
  minZoom?: number;
  maxZoom?: number;
  previewConfig?: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    rotationSpeed?: number;
    autoRotate?: boolean;
  };
  imageUrl?: string;
}

export interface CameraConfig {
  minZoom: number;
  maxZoom: number;
  introRotation: { yaw: number; pitch: number };
  recenterRotation: { yaw: number; pitch: number };
  recenterZoom: number;
  orbitRadius: number;
  recenterTarget: [number, number, number];
  recenterOffset: [number, number, number];
}

export const cameraConfig: CameraConfig = {
  minZoom: 0.5,
  maxZoom: 1.8,
  introRotation: { yaw: 0, pitch: 0.2 },
  recenterRotation: { yaw: 1.6387, pitch: 0.1872 },
  recenterZoom: 1.7,
  orbitRadius: 6,
  recenterTarget: [0, 0, 2],
  recenterOffset: [0, 1, 2],
};

export const signpostConfig = {
  position: [-2.5, 0, -2] as [number, number, number],
  rotationY: 90,
};

export const involvementsPreviewConfig = {
  rotation: [-8, 28, -2] as [number, number, number],
  position: [0, 0, 0] as [number, number, number],
  scale: 1.3,
  rotationSpeed: 0.005,
  autoRotate: true,
};

export const landingPageAbout = {
  headline: 'Passionate Builder & Operator',
  paragraphs: [
    "Hi! I'm Aditya Induri, a student studying Finance and Computer Science. I'm passionate about building and scaling ideas from concept to execution, particularly in areas I'm interested in like Robotics and AI. Feel free to check this website out and contact me if anything catches your eye!",
  ],
};

export const resumeData: ResumeItem[] = [
  {
    id: 'osu',
    title: 'The Ohio State University',
    interestTitle: 'Education',
    category: 'Education',
    subtitle: 'Bachelor of Science in Business Administration',
    date: 'May 2027',
    bullets: [
      'Specialization: Economics and Finance | Minor: Computer Science | GPA: 3.88/4.00',
      'Integrated Business and Engineering Software Innovation Track (IBE-SI): 1 of 18 business students admitted into a four-year interdisciplinary honors program that supplements student curriculum through specialized Engineering and MBA-style courses',
    ],
    interestBullets: ['Achieving academic excellence and pursuing cross-disciplinary innovation at OSU.'],
    modelUrl: '/models/diploma_frame.glb',
    scale: 1.4,
    hoverScale: 1.2,
    glowEnabled: true,
    rotation: [0, 90, 0],
    position: [-3.3, 2, -4.725],
    shape: 'certificate',
    color: '#00ffff',
    clickable: true,
    zoomTarget: [-1, 2.5, -3],
    zoomDistance: 3,
    previewConfig: {
      rotation: [0, 90, 0],
      scale: 1,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'about-me',
    title: 'Aditya Induri',
    interestTitle: 'Profile',
    category: 'Experience',
    subtitle: 'Passionate Builder & Operator',
    //date: 'Founding Future Interfaces',
    bullets: [
      "Hi! I'm Aditya Induri, a student studying Finance and Computer Science. I'm passionate about building and scaling ideas from concept to execution, particularly in areas I'm interested in like Robotics and AI. Feel free to check this website out and contact me if anything catches your eye!",
      'PS: The assets in the website are related to my interests and have an experience or project tied to them. Hover over and click an asset to explore or simply navigate using the previous and next buttons.',
    ],
    interestBullets: ['Bridging the gap between complex data and intuitive human-centric design.'],
    imageUrl: '/Induri.Aditya_Headshot.jpg',
    scale: 1,
    hoverScale: 1,
    glowEnabled: false,
    rotation: [0, 0, 90],
    position: [0, 0, 0],
    shape: 'profile',
    color: '#000000',
    clickable: true,
  },
  {
    id: 'morgan-stanley',
    title: 'Morgan Stanley',
    interestTitle: 'Trading / Financial News',
    category: 'Experience',
    subtitle: 'Risk Management Summer Analyst - Institutional Securities Group (ISG)',
    date: 'June 2025 - August 2025',
    bullets: [
      'Rotated every 2 weeks across 4 ISG risk desks - Counterparty, Electronic Trading, Data & Cyber, and Financial Crimes',
      'Discovered 4 use cases for AI & Automation of which 3 were immediately adopted making tasks 65% more efficient',
    ],
    interestBullets: ['Fascinated by financial markets, quantitative strategies, and algorithmic trading.'],
    modelUrl: '/models/charging_bull.glb',
    scale: 1.5,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-3.75, 2.77, -0.12],
    shape: 'bull',
    color: '#ffaa00',
    clickable: true,
    zoomTarget: [-2, 2.5, 2],
    zoomDistance: 4,
    previewConfig: {
      rotation: [0, 0, 0],
      scale: 2,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'emsi',
    title: 'Excel Management Systems, Inc. (EMSI)',
    interestTitle: 'Chess',
    category: 'Experience',
    subtitle: 'Growth and Strategy Intern',
    date: 'May 2022 - June 2025',
    bullets: [
      'Identified software and hardware reselling to governments as a pivotal area of expansion and personally won ~$300,000',
      'Created a new company division generating $1,000,000+ of annual revenue and completed a successful transition process',
      'Executed an acquisition and implemented strategies that increased profits of an Audio & Video Installation company by 20%',
    ],
    interestBullets: ['Deeply interested in strategic chess gameplay and tactical analysis.'],
    modelUrl: '/models/chessboard.glb',
    scale: 0.5,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [1.5, 1.2, 2.7],
    shape: 'chessboard',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 3.5,
    previewConfig: {
      rotation: [0, 0, 0],
      position: [0, 0, 0],
      scale: 1,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'keybank',
    title: 'KeyBank',
    interestTitle: 'Badminton',
    category: 'Experience',
    subtitle: 'Wealth Management Analytics Intern',
    date: 'June 2024 - August 2024',
    bullets: [
      'Developed a real-time dashboard by utilizing Tableau that compared the performance of client relationship managers',
      'Separated and sorted components of a data dictionary reducing processing time by 80% by coding multiple Excel Macros',
    ],
    interestBullets: ['Enjoy playing badminton competitively and for fitness.'],
    modelUrl: '/models/hyper_badminton.glb',
    scale: 1.0,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [0.8, 0.23, -4.4],
    shape: 'racket',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 3,
    previewConfig: {
      rotation: [90, 0, 90],
      position: [0, 0, 0],
      scale: 1.2,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'columbus-capital',
    title: 'Columbus Capital Holding',
    interestTitle: 'Virtual Reality',
    category: 'Experience',
    subtitle: 'Wealth Management Intern',
    date: 'January 2023 - May 2024',
    bullets: [
      'Managed a $400,000 portfolio and invested by reviewing investment strategies, potentials, and drawbacks with client',
      'Parsed 2,500+ bank statements using Python, Playwright, and an LLM to build a bot that consolidated relevant financial data',
    ],
    interestBullets: ['Exploring immersive virtual reality environments and technologies.'],
    modelUrl: '/models/vr_headset_free_model.glb',
    scale: 0.1,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-0.6, 0.42, -4.4],
    shape: 'vr',
    color: '#2e2e2c',
    clickable: true,
    zoomDistance: 2.5,
    previewConfig: {
      rotation: [0, 180, 0],
      scale: 1,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'fireboy-watergirl',
    title: 'Fireboy and Watergirl AI',
    interestTitle: 'Video Games',
    category: 'Projects',
    subtitle: 'Founder / Developer',
    date: 'March 2026 - Present',
    bullets: [
      'Training an AI based on OpenAI Gymnasium and PPO models to beat a game reliant on multi-character cooperation',
      'Implemented a vision overlay system using OpenCV that identifies moving objects based on templates, colors, and shapes',
    ],
    interestBullets: ['Passionate about game AI, reinforcement learning, and cooperative problem solving in interactive environments.'],
    scale: 0.7,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [0, 2.53, 0.1],
    shape: 'monitor',
    color: '#00ffff',
    clickable: true,
    zoomDistance: 3.5,
    previewConfig: {
      rotation: [0, 0, 0],
      scale: 1.6,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'hephasbot',
    title: 'Hephasbot',
    interestTitle: 'Robotics',
    category: 'Projects',
    subtitle: 'Founder / Developer',
    date: 'January 2026 - Present',
    bullets: [
      'Assembled the SO-ARM101 follower and leader arms based on the Hugging Face Lerobot framework',
      'Coded the first website that allows non-technical users to configure motors, calibrate, and teleoperate a robot using either a keyboard, gamepad, leader-follower mechanism, or direct joint control without using a terminal through a web-only interface',
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
    zoomTarget: [3, 2, 5],
    zoomDistance: 6,
    previewConfig: {
      rotation: [0, -90, 0],
      scale: 1.2,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'delphi',
    title: 'Delphi Investment',
    interestTitle: 'Weightlifting',
    category: 'Projects',
    subtitle: 'Founder / CEO',
    date: 'August 2023 - June 2024',
    bullets: [
      'Founded a fintech startup that made structured notes more accessible by acting as a pooling and secondaries platform',
      'Performed customer/market validation, researched competitors, communicated with SMEs, and developed an alpha website',
    ],
    interestBullets: ['Interested in weightlifting for the discipline, consistency, and long-term self-improvement it builds.'],
    modelUrl: '/models/dumbell.glb',
    scale: 1,
    hoverScale: 1.35,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [1.8, -0.78, 1],
    shape: 'dumbbell',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 2.8,
    previewConfig: {
      rotation: [0, 25, 0],
      scale: 1,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'arbitrage-app',
    title: 'Arbitrage App',
    interestTitle: 'SFF PC Building',
    category: 'Projects',
    subtitle: 'Founder / Developer',
    date: 'December 2022 - June 2023',
    bullets: [
      'Engineered an automated sports-betting arbitrage application using Python and Playwright that scraped various sportsbooks to identify odds discrepancies and optimized bonus bets usage, resulting in ~$10,000 of risk-free earnings',
    ],
    interestBullets: ['Building and modifying Small-Form-Factor (SFF) desktop PCs for optimized performance and aesthetics.'],
    scale: 0.48,
    hoverScale: 1.4,
    glowEnabled: true,
    rotation: [0, 0, 0],
    position: [-8.2, 0.6, -5.2],
    shape: 'computer',
    color: '#d0d0cc',
    clickable: true,
    zoomDistance: 4,
    previewConfig: {
      rotation: [0, 0, 0],
      scale: 1,
      rotationSpeed: 0.005,
      autoRotate: true,
    },
  },
  {
    id: 'consumer-packaged-goods',
    title: 'Consumer Packaged Goods Industry Immersion',
    interestTitle: 'Consumer Goods',
    category: 'Involvements',
    subtitle: 'Member',
    date: 'August 2025 - Present',
    bullets: [
      'Participating in a program designed to provide real-world experience through conversations with C-suite executives',
      'Working with a leading electric toothbrush company on methods to increase usage amongst the Generation Alpha cohort',
    ],
    interestBullets: ['Interested in how consumer behavior, product strategy, and brand execution come together in real-world markets.'],
    scale: 1,
    hoverScale: 1,
    glowEnabled: false,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    shape: 'column',
    color: '#000000',
    clickable: false,
  },
  {
    id: 'recalc-academy',
    title: 'Recalc Academy',
    interestTitle: 'Finance',
    category: 'Involvements',
    subtitle: 'Finance Accelerator Fellow',
    date: 'September 2024 - June 2025',
    bullets: [
      'Completed training in financial accounting, valuation, and investment analysis as 1 of 50 students selected to join',
    ],
    interestBullets: ['Enjoy building deeper technical finance intuition through structured training and analysis.'],
    scale: 1,
    hoverScale: 1,
    glowEnabled: false,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    shape: 'column',
    color: '#000000',
    clickable: false,
  },
];
