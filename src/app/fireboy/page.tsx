import { redirect } from 'next/navigation';
import { FIREBOY_WATERGIRL_DEMO_URL } from '@/data/resume';

export default function FireboyPage() {
  redirect(FIREBOY_WATERGIRL_DEMO_URL);
}
