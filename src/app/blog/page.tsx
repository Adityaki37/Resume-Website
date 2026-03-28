'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';

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
    <main className="relative min-h-screen bg-white text-black selection:bg-black/10">
      {/* Background Pattern */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-8 md:px-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-black/70 backdrop-blur-md transition-all hover:border-black/20 hover:text-black hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Portfolio
        </Link>

        <article className="mt-16 md:mt-24">
          <header className="mb-14 border-b border-black/5 pb-10">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-5xl text-[#0c0c0c] leading-tight">
              Musings about teleoperation
            </h1>
            <div className="mt-8 flex items-center gap-4 text-sm font-medium text-black/40 uppercase tracking-widest">
              <span>Dec 24 2025</span>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <span>Aditya Induri</span>
            </div>
          </header>

          <div className="text-[#2e2e2c]">
            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              Saw a video of 1X on WSJ. Knew about robots before, had seen companies like Figure, Unitree, and Tesla Optimus, but this was my first time seeing them do household tasks. While I could see the potential, I came away unimpressed from how it loaded the dishwasher. Specifically, the fact that even with it being teleoperated it wasn&rsquo;t able to close the dishwasher in one motion. Rather they had to design the house around the demo considering a lot of dishwashers, including mine, don&rsquo;t stay in a middle position and are either fully up or fully down.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              This video also showed me how companies thought of controlling robots in two ways. The first was teleoperation where a human would control the robot. This was mostly thought of as in interim solution which was used to collect data. On the other hand, the ultimate goal they were aiming for was an AI where they wanted the robot to move by itself. This was where most companies seemed to focus their investments.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              To me this seemed rushed. While I understood the focus on AI, I believed it would take too long to get a truly useable model. For instance, think of all the different home layouts that exist, the different types of door knobs and then the training required to get a robot to even open the door. Once you wrap your head around that think of 100x the amount of simple tasks like that which have a bunch of variations such as the type of dryer you use and the different settings it has. Then think of more complex tasks such as doing a full on deep clean of your bathroom, vacuuming, dusting, lugging that vacuum up the stairs, making sure your feet are clean if you were using water to clean the bathrooms, etc. Even just looking at home tasks it felt like it would take a while for these models to get up to pace. It seems like this is something 1X considered as well given how they employed teleoperators and had a system where people who initially buy 1X can use a schedule system to prebook teleoperators to do tasks.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              This made me think of creating a business that supplements the gap of teleoperators and the extra costs that may have in the US. There&rsquo;s already businesses centered around house maids, such as Pronto which is essentially like an Uber for cleaning in India. Can acquire a business like that, if not build a much smaller scale one with 10 people who are trained to teleoperate and run a 24/7 teleoperation system for other robotics companies. The company would gain revenue both through providing the teleoperation service and through selling the data gained to companies for training. Was reassured that this was a pretty good model by looking at companies like Scale AI which is essentially a data labeling company where cheap labor in the Philippines labels things that companies can use to train AI. Looked more into the founder Alexander Wang and how he grew the business and saw that he was a pretty good fundraiser. Essentially got a lot of money to grow the business, got in the right circles to be the preferred vendor to the AI companies, etc. Probably is a viable startup until AI can replace basic human tasks except for the risk factor that funding and getting in the right circles with the right customers is necessary. Also found out that countries like Nepal have 27% of their GDP generated through remittances which is money pumped back from foreign countries which is just insane. Having these robots means people can just teleoperate them from home for tasks even going beyond cleaning to factory and construction work which is also physically better for them.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              Diving deeper into this, even if those tasks become automated and are something AI can take over there&rsquo;s just too many specialized tasks where there isn&rsquo;t enough data to train models. For instance, repairing wind turbines, repairing a specific elevator brand that&rsquo;s not common, etc. There&rsquo;s hardly a chance those will be automated even if others are. That made me think of a possibility of the future where there&rsquo;s not a lot of technicians and you want to use them as much as possible. However, travel is essentially a quarter of their time making it not very efficient. To solve this you would use a self driving car that has a robot in it that delivers it to a specific location. From there a technician teleoperates the robot to complete the necessary task.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              If this is the future, a software only business centered around management and employee allocation and oversight could be beneficial. For both instances, you could imagine where there would be a company in charge of a certain number of people and would need to decide who gets to teleoperate what robot and has to assign employees. Additionally, the manager would have to have oversight of that employee, step in if anything goes wrong etc. they would have to do all of this in a secure, enterprise environment, something a lot of companies currently pay extra for. Can design a platform that does this which is essentially like Citrix, which essentially does all of this but for windows desktops&hellip; was sold for a couple billion dollars so is a decent model to work off of. Even considering a world where AI does most of the tasks this still pays off because of a) the incredibly niche tasks will be hard to get data on and automate and b) you would need someone to manage a cluster of ai&rsquo;s. For instance you could see someone using these platforms to manage a group of AIs&rsquo; by viewing its video and reasoning outputs and stepping in whenever the AI has trouble. In either future this app works out.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              Another one could be a Taskhuman for teleop, someone would request a certain activity, someone else could hop on and do it. We wouldn&rsquo;t need to invest in the capex for vr headsets etc. However, a risk of both of these software apps are that we may be too early to the game. I personally don&rsquo;t think so given how many yc startups only got traction years after being in the accelerator but being too early still is a viable concern and risk to keep in mind.
            </p>

            <div className="flex justify-center items-center my-12 text-black/20 font-bold overflow-hidden select-none whitespace-nowrap opacity-60">
              ------------------------------------------------------------------------------------------------
            </div>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              Was rewatching 1X&rsquo;s video and some other ones they put out and noticed the difference between their teleop and true human mimicry. What really solidified my thesis on this was the equipment they used. It turned out they were using a meta quest 3, and so were all of their robot competitors I later learned. While it&rsquo;s not a bad headset even I as an incredibly casual vr person who just did research on them knew it wasn&rsquo;t the best. Rather the leading technology in body tracking was steam base stations and it seemed incredibly odd to me that none of the players decided to go all out on making teleoperation as accurate as possible.
            </p>

            <p className="text-base leading-8 md:text-lg md:leading-9 mb-8">
              Thought this was interesting and decided that it was something I could look deeper into. As mentioned all of the other big robot companies seemed to use the quest 3 or Apple Vision Pro. The only one that I found to be doing something different was Unitree who had recently, in the past month or two, created a vest that people could wear called embodied avatar that could mimic a persons movement but not their hands. The only other ways for teleop I was able to find were things like Xsens motion capture which is incredibly time consuming, and one of the ways Detroit become human was made. Also discovered Manus later on for hand tracking.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
