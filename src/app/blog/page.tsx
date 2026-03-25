'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';

const journalEntries = [
  {
    day: 'Day 1',
    paragraphs: [
      'I set out to create the Fireboy AI. I had it running and thought to let an AI create the model. It recommended Stable Baselines3 based on the OpenAI Gymnasium framework using PPO.',
      'The rewards it created were 50 for a gem, -0.1 for time, +0.1 for proximity to the nearest gem, +0.1 for proximity to the door, -100 for death, 50 for getting a gem, 250 for one of the characters getting to a door, and 500 for completion.',
      'It got gems in under 50 episodes. Interestingly, there were times where it got either the red gem or the blue gem. In the meantime, I got worried that gem sensitivity might stray it in scenarios where the gem or door is right above it but it needs to route to the side to get there, which made me delete it.',
      'I also had to add something in to make sure gems, hazards, buttons, barriers, levels, and player characters were detected.',
    ],
  },
  {
    day: 'Day 2',
    paragraphs: [
      'I let the AI run for a while overnight, but forgot to loop it so it stopped in the middle. It seemed like there were instances where it went for 20+ minutes. That made me think the gem reward was too low, so I made it higher and increased the time penalty.',
      'That surprisingly made it worse or had no change, because it kept stalling and running to 60+ minutes after around 50 episodes. I decreased the gem reward to 15 and it did better, but had the same issue where it would stall in safe areas after becoming too afraid of the death penalty after around 75 episodes.',
      'This made me add in an exploration feature where it would get rewards of 0.1 for visiting new x, y coordinates in a run. It seemed to work a bit better, but I thought it would be better if I could test out multiple theories at once.',
      'While a reward for unexplored areas initially worked better, after more episodes the agents kept stalling. I thought that it would benefit from adding in more things such as a way to recognize buttons, hazards, barriers, and more. I added it in, noticed some unusual behavior, and also added a visual overlay and kept tweaking things until it was right.',
      'I built a parallelized environment where I could test different runs with different variable settings. I also learned that changing the PPO learning period was an important variable I had to consider.',
    ],
  },
  {
    day: 'Day 3',
    paragraphs: [
      'I let the AI run overnight and it turned out that all of them only got the red gem and Water Girl was lagging behind. I decided that I needed to add in more different rewards and penalties.',
    ],
    bullets: [
      'Reinstate gem sensitivity but make it character dependent so Firebox is only attracted to red gems.',
      'Reinstate door proximity reward.',
      'Limit the death penalty.',
      'Make the time sensitivity penalty become exponential after one minute.',
      'If an AI sees a barrier and the door is on the other side, reward getting on the other side.',
      'Have a lever or button proximity reward.',
      'Have a proximity and actual reward for Water Girl getting in the water.',
      'Add a death penalty specifically for when Water Girl is in the fire so the AI is better steered and understands why it died.',
    ],
    paragraphsAfterBullets: [
      'It also made me wonder if the way I needed to make a generalizable AI was to perhaps have an overarching AI where there would be multiple agents running their own versions and the generalizable ones would have simple rewards and penalties while the mini ones would have complex ones. The overarching simple one could then take the data and choose the best model.',
      'I also thought of a semi-imitation based idea where it would only use good data with the lowest time and highest gems and train on that. I also considered swapping PPO for MuZero.',
      'None of them seemed to work. Firebox kept getting his gem but Water Girl was behind, which led me to make something where Firebox stopped moving and only Water Girl moved. Then I noticed a couple of weird actions like Water Girl jumping up and going back and forth.',
      'I thought it somehow cheated the algorithm, so I created another visual overlay to live debug what rewards and penalties were being inflicted. It turns out Water Girl was not able to be tracked all the time and by jumping up and down and moving back and forth she would become null, which reset and rewarded the behavior.',
      'I fixed this problem and decided to just run a simple parallelizable setup again in the night and see how it did the next day.',
    ],
  },
  {
    day: 'Day 4',
    bullets: [
      'Implemented scattershot to test out different things.',
      'Implemented recursive.',
    ],
  },
  {
    day: 'Day 5',
    bullets: [
      'Use the dataset of one model plugged into another model. For instance, if they share the common reward of gem, you can have one AI have a reward for going right, another for going up, and then once right gets the gem it pairs with the going up one.',
      'Make gem sensitivity so that if the closest gem does not change after 10 seconds it moves to the second closest.',
      'Develop an imitation learning model.',
      'Make it a visual model.',
      'Learning is that if you are looking for new interactions, 35 episodes is enough.',
      'Structure prod rewards as check-ins rather than a constant pull.',
      'Create a parallel sizable thing for one model to learn fast.',
    ],
  },
  {
    day: 'Day 6',
    paragraphs: [
      'Created archive of 2 gem, refined replay, and added a review script for the imitation learning model.',
      'Ran for 1000 episodes but it did not work.',
    ],
  },
];

const arrowPaths = [
  'M15 50 L 85 50 L 65 35 M 85 50 L 65 65',
  'M10 10 Q 50 90 90 10 M 70 30 L 90 10 L 70 5',
  'M10 50 Q 25 25 50 50 T 90 50 M 75 35 L 90 50 L 75 65',
  'M10 90 L 90 10 M 70 10 L 90 10 L 90 30',
  'M20 50 C 20 80 80 80 80 50 C 80 20 20 20 20 50 M 35 35 L 20 50 L 35 65',
];

const backgroundArrows = [
  { top: '8%', left: '7%', rotate: -12, scale: 0.9, type: 1 },
  { top: '13%', right: '12%', rotate: 26, scale: 1.15, type: 3 },
  { top: '29%', left: '82%', rotate: -8, scale: 0.95, type: 0 },
  { top: '48%', left: '9%', rotate: 16, scale: 1.05, type: 4 },
  { top: '62%', right: '10%', rotate: -18, scale: 1.1, type: 2 },
  { top: '81%', left: '78%', rotate: 22, scale: 0.85, type: 1 },
];

const HandDrawnArrow = memo(({ type = 0, className = '' }: { type?: number; className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d={arrowPaths[type % arrowPaths.length]}
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));
HandDrawnArrow.displayName = 'HandDrawnArrow';

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
        {backgroundArrows.map((arrow, index) => (
          <div
            key={index}
            className="absolute text-black/35"
            style={{
              top: arrow.top,
              left: arrow.left,
              right: arrow.right,
              transform: `rotate(${arrow.rotate}deg) scale(${arrow.scale})`,
            }}
          >
            <HandDrawnArrow type={arrow.type} className="h-12 w-12" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-12 md:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-black/70 backdrop-blur-md transition-colors hover:border-black/20 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Portfolio
        </Link>

        <section className="grid grid-cols-1 gap-10 pt-12 md:grid-cols-[minmax(0,1.35fr)_360px] md:items-end">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-black/40">Project Journal</p>
            <h1 className="max-w-4xl text-5xl font-black uppercase italic leading-[0.88] tracking-tighter md:text-7xl">
              Fireboy and Watergirl AI
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-black/60 md:text-lg">
              Notes from building a cooperative reinforcement-learning agent: reward shaping, debugging overlays, overnight runs, imitation-learning ideas, and the kinds of failures that actually taught me what mattered.
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-[#f4f4f2]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between border-b border-black/6 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">Build Summary</span>
              <div className="h-px w-10 bg-black/10" />
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">Framework</p>
                <p className="mt-2 text-xl font-black tracking-tight">Gymnasium + PPO</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/35">Focus</p>
                <p className="mt-2 text-sm font-medium leading-7 text-black/65">
                  Multi-character cooperation, reward design, environment instrumentation, and parallel experimentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tighter md:text-5xl">Build Log</h2>
            <div className="h-px w-12 bg-black/20" />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute bottom-0 left-[15px] top-4 w-px bg-black/10 md:left-[19px]" />
            {journalEntries.map((entry, index) => (
              <article
                key={entry.day}
                className="relative pl-12 pb-10 md:pl-16 md:pb-14"
              >
                <div className="absolute left-0 top-2 h-8 w-8 rounded-full border-2 border-black bg-white md:left-0 md:h-10 md:w-10" />
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/35">Checkpoint</p>
                      <h3 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{entry.day}</h3>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/5 bg-[#f4f4f2]/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] backdrop-blur-md md:p-8">
                    {entry.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="text-sm font-medium leading-7 text-black/68 md:text-base">
                        {paragraph}
                      </p>
                    ))}

                    {entry.bullets && (
                      <ul className="space-y-3">
                        {entry.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-sm font-medium leading-7 text-black/68 md:text-base">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {entry.paragraphsAfterBullets?.map((paragraph) => (
                      <p key={paragraph} className="text-sm font-medium leading-7 text-black/68 md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
