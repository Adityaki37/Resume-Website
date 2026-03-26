'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';

const journalEntries = [
  {
    day: 'Day 1',
    paragraphs: [
      'I set out to create the Fireboy & Watergirl AI. Since it was a Flash game, I was able to find the game\'s .swf files and get it running through Ruffle. For the model, I used Stable-Baselines3 with PPO on top of the OpenAI Gymnasium framework.',
      'I spent the rest of the day setting up the automation pipeline and the model itself. The initial rewards were based on gem proximity, gem collection, door proximity, and level completion, while the penalties were based on time spent and death.',
      'It was able to collect gems in under 50 episodes. However, it only seemed to consistently collect the red gem and not the blue gem.',
    ],
  },
  {
    day: 'Day 2',
    paragraphs: [
      'I let the AI run overnight, and there were several cases where it spent more than 20 minutes without going for any gems. That made me think the time penalty was too small and the gem reward was too weak. However, none of the reward tweaks seemed to work.',
      'I decided I needed a way to test multiple models with different variables in parallel, so I built run_parallel_training.py. I also used AutoHotkey so multiple Ruffle windows could stay open and receive their own keyboard and mouse inputs without interfering with one another.',
      'I also added an exploration feature that rewarded the AI for visiting new x-y coordinates during a run. It still did not work reliably.',
      'I thought the model might benefit from recognizing more environmental features like buttons, hazards, and barriers, so I added support for those and spent time debugging the OpenCV pipeline and building a visual overlay to make sure the detections were correct.',
    ],
  },
  {
    day: 'Day 3',
    paragraphs: [
      'I let the AI run overnight, and it turned out that all of the models only collected the red gem while Watergirl kept falling behind. I decided that I needed to add more targeted rewards and penalties. Here are some of the changes I made:',
    ],
    bullets: [
      'Made the time penalty become exponential after one minute',
      'Added both a proximity reward and a direct reward for Watergirl entering water',
      'Added alternating gem rewards so Watergirl would be rewarded much more strongly for moving toward her gem once Fireboy had already collected his',
    ],
    paragraphsAfterBullets: [
      'None of those changes seemed to solve the problem. Fireboy kept getting his gem, but Watergirl was still behind, which led me to create a setup where Fireboy stopped moving and only Watergirl moved. That was when I started noticing strange behaviors, like Watergirl repeatedly jumping in place and moving back and forth.',
      'To better understand this I added a reward log to the visual overlay to debug exactly which rewards and penalties were being triggered in real time. It turned out that Watergirl was not being tracked consistently, and by jumping up and down or moving back and forth she could briefly become null, which caused the system to reset and accidentally reward that behavior.',
      'I fixed that problem and decided to run another parallelized setup overnight to see how it performed the next day.',
    ],
  },
  {
    day: 'Day 4',
    paragraphs: [
      'It still did not work, so I tried a number of different approaches. One of them was scattershot tuning, where I would give a model a low and high range for a variable and run ten instances of it for 35 episodes each to see which settings performed best. Eventually, I realized that instead of manually running multiple scattershots, I could build a script called recursive_reward_search.py that automatically tweaked variables across multiple rounds and changed what it focused on each time in order to search for the best setup. However, neither of those approaches solved the core issue.',
      'I ended up watching replays through replay_episode.py and realized that the movement itself was off. Whenever Watergirl attempted a diagonal jump, she would begin the jump but then fall straight down or drift the other way in the middle. This was happening because the model was sending inputs so quickly that it struggled to commit to a risky jump long enough to learn how to clear the fire hazard properly.',
      'Because of that, I changed the diagonal jump logic so the input would be held for 1.5 seconds, and that was the breakthrough. Once it finally started working, I left a recursive search script running overnight to try to find the best-performing model.',
    ],
  },
  {
    day: 'Day 5',
    paragraphs: [
      'The recursive search finally started producing models that could collect both gems without stalling. That was a huge step forward. However, it still could not do so reliably.',
      'At first, I thought the issue was simply that the models had not trained long enough, so I tried training different ones for anywhere from 100 to 1,000 episodes. None of them ever became consistently reliable.',
      'That was the point where I realized I would probably need imitation learning to make the behavior stable. I created review_good_episodes.py so I could review successful episodes and select them to be used for training.',
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
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-black/60 md:text-lg">
              Watch the video to see where the AI is currently at and/or read the build log to see my progress. Note: The visual overlay and reward log are off in the video due to it being a demonstration of a replay rather than a live run.
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
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tighter md:text-5xl">Video Demonstration</h2>
            <div className="h-px w-12 bg-black/20" />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-[#f4f4f2]/80 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-4">
              <div className="aspect-video overflow-hidden rounded-[1.5rem] bg-black">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/IgyvnI8UbjY"
                  title="Fireboy and Watergirl AI video demonstration"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
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
            <div className="absolute bottom-0 left-[9px] top-4 w-px bg-black/10 md:left-[11px] md:top-5" />
            {journalEntries.map((entry, index) => (
              <article
                key={entry.day}
                className="relative pl-10 pb-10 md:pl-12 md:pb-14"
              >
                <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-black bg-white md:left-0 md:top-2 md:h-6 md:w-6" />
                <div className="space-y-5">
                  <div className="flex min-h-8 flex-col justify-center gap-3 md:min-h-10 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight md:text-4xl">{entry.day}</h3>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {entry.paragraphs && (
                        <div className="space-y-4">
                          {entry.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="text-sm font-medium leading-7 text-black/68 md:text-base md:leading-8">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}

                      {entry.bullets && (
                        <ul className="space-y-3">
                          {entry.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="grid grid-cols-[0.375rem_minmax(0,1fr)] items-start gap-x-3 text-sm font-medium leading-7 text-black/68 md:text-base md:leading-8"
                            >
                              <span className="flex h-7 items-center justify-center md:h-8">
                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                              </span>
                              <span className="min-w-0">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {entry.paragraphsAfterBullets && (
                        <div className="space-y-4">
                          {entry.paragraphsAfterBullets.map((paragraph) => (
                            <p key={paragraph} className="text-sm font-medium leading-7 text-black/68 md:text-base md:leading-8">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}
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
