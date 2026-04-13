# Aditya Induri | Interactive Resume

An interactive resume and portfolio built with Next.js, React, Tailwind CSS, Framer Motion, and Three.js.

The homepage is a 3D desk scene where each object maps to experience, projects, or interests. The repo also includes supporting long-form pages for a robotics/AI blog entry and a Fireboy and Watergirl AI project journal.

## Stack

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Framer Motion
- Three.js

## Local Development

Install dependencies and start the dev server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `bun run dev` - start the local development server
- `bun run build` - create a production build
- `bun run start` - serve the production build
- `bun run lint` - run ESLint

## Project Structure

- `src/app` - routes, layout, metadata, and global styles
- `src/components` - the interactive desk scene and supporting UI
- `src/data/resume.ts` - resume content plus scene configuration
- `public` - static assets such as 3D models, icons, images, and the downloadable resume PDF

## Notes

- `public/Resume.pdf` is the resume surfaced in the site UI.
- Some bundled 3D assets are large, so Git LFS or asset optimization may be worth considering if the project grows.
- If you plan to publish the repo publicly, adding an explicit `LICENSE` file is a good next step.
