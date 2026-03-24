'use client';

import { useEffect, useState } from 'react';

const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i;
const MOBILE_WIDTH_THRESHOLD = 1024;

export function detectIsMobile() {
  return MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent) || window.innerWidth < MOBILE_WIDTH_THRESHOLD;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(detectIsMobile());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
