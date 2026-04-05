import type { TechOption } from '../types';

export const techOptions: TechOption[] = [
  // ── Visual Language / UI ──────────────────────────
  {
    id: 'tailwind',
    blockId: 'visual-ui',
    name: 'Tailwind CSS',
    description:
      'Utility-first CSS framework. You style elements by adding small, reusable classes directly in your HTML instead of writing separate CSS files.',
    pros: ['Very fast to build with', 'Consistent design system built in', 'Huge community & ecosystem'],
    cons: ['HTML can look cluttered with many classes', 'Learning curve for utility names'],
    isDefault: true,
    url: 'https://tailwindcss.com',
  },
  {
    id: 'css-modules',
    blockId: 'visual-ui',
    name: 'CSS Modules',
    description:
      'Regular CSS files where class names are automatically scoped to the component that uses them. No risk of styles leaking between components.',
    pros: ['Familiar CSS syntax', 'Automatic scoping prevents conflicts', 'No extra dependencies'],
    cons: ['More files to manage', 'Less design system enforcement'],
    isDefault: false,
  },
  {
    id: 'styled-components',
    blockId: 'visual-ui',
    name: 'Styled Components',
    description:
      'Write CSS directly inside your JavaScript/TypeScript files using template literals. Each component carries its own styles.',
    pros: ['Styles live with components', 'Dynamic styles based on props', 'Good TypeScript support'],
    cons: ['Slightly slower at runtime', 'Different syntax to learn', 'Larger bundle size'],
    isDefault: false,
  },
  {
    id: 'vanilla-css',
    blockId: 'visual-ui',
    name: 'Vanilla CSS',
    description:
      'Plain CSS with no frameworks or tools. Write styles in .css files and link them to your HTML. The simplest approach.',
    pros: ['No dependencies', 'Nothing extra to learn', 'Maximum control'],
    cons: ['No built-in design system', 'Harder to stay consistent', 'Global scope can cause conflicts'],
    isDefault: false,
  },

  // ── Accessibility ───────────────────────────────────
  {
    id: 'axe-core',
    blockId: 'accessibility',
    name: 'axe-core',
    description:
      'The industry-standard accessibility testing engine. Run automated WCAG audits in the browser, in tests, or in CI to catch violations early.',
    pros: ['Comprehensive rule set', 'Integrates with testing frameworks', 'Zero false positives guarantee'],
    cons: ['Automated tests catch ~30-40% of issues', 'Needs manual review too'],
    isDefault: true,
    url: 'https://www.deque.com/axe',
  },
  {
    id: 'eslint-a11y',
    blockId: 'accessibility',
    name: 'eslint-plugin-jsx-a11y',
    description:
      'ESLint plugin that catches accessibility issues in JSX at development time — missing alt text, invalid ARIA attributes, missing labels, and more.',
    pros: ['Catches issues as you code', 'Zero runtime cost', 'Easy to set up'],
    cons: ['JSX/React only', 'Can\'t catch dynamic issues'],
    isDefault: true,
    url: 'https://github.com/jsx-eslint/eslint-plugin-jsx-a11y',
  },
  {
    id: 'pa11y',
    blockId: 'accessibility',
    name: 'Pa11y',
    description:
      'Command-line accessibility testing tool that runs against live URLs. Great for CI pipelines to gate deployments on WCAG compliance.',
    pros: ['CI-friendly', 'Tests real rendered pages', 'Configurable thresholds'],
    cons: ['Slower than static analysis', 'Needs a running server to test against'],
    isDefault: false,
    url: 'https://pa11y.org',
  },

  // ── Functionality / Framework ─────────────────────
  {
    id: 'react',
    blockId: 'functionality',
    name: 'React',
    description:
      'The most popular UI library. You build your interface from reusable "components" (small, self-contained pieces) that update efficiently when data changes.',
    pros: ['Largest ecosystem & community', 'Most AI tools know it well', 'Huge job market'],
    cons: ['Steeper learning curve', 'Needs additional libraries for routing, state, etc.'],
    isDefault: true,
    url: 'https://react.dev',
  },
  {
    id: 'vue',
    blockId: 'functionality',
    name: 'Vue',
    description:
      'A progressive framework that\'s easier to learn than React. Uses single-file components that combine HTML, CSS, and JavaScript in one file.',
    pros: ['Gentle learning curve', 'Great documentation', 'Batteries included (router, state built in)'],
    cons: ['Smaller ecosystem than React', 'Fewer AI training examples'],
    isDefault: false,
    url: 'https://vuejs.org',
  },
  {
    id: 'svelte',
    blockId: 'functionality',
    name: 'Svelte',
    description:
      'A compiler that turns your components into tiny, fast vanilla JavaScript at build time. No runtime library needed.',
    pros: ['Very fast performance', 'Less code to write', 'Simple, intuitive syntax'],
    cons: ['Smaller ecosystem', 'Fewer learning resources', 'Less AI tool familiarity'],
    isDefault: false,
    url: 'https://svelte.dev',
  },
  {
    id: 'vanilla-js',
    blockId: 'functionality',
    name: 'Vanilla JavaScript',
    description:
      'Plain JavaScript with no framework. Good for simple projects where a framework would be overkill.',
    pros: ['No dependencies', 'No build step needed', 'Maximum control'],
    cons: ['More manual work', 'Harder to scale', 'No component model'],
    isDefault: false,
  },

  // ── Routing ───────────────────────────────────────
  {
    id: 'react-router',
    blockId: 'routing',
    name: 'React Router',
    description:
      'The standard routing library for React apps. Handles URL-based navigation, nested routes, and route parameters.',
    pros: ['Industry standard', 'Well documented', 'Supports all routing patterns'],
    cons: ['Extra dependency', 'Can be complex for simple needs'],
    isDefault: true,
    url: 'https://reactrouter.com',
  },
  {
    id: 'nextjs-routing',
    blockId: 'routing',
    name: 'Next.js (file-based)',
    description:
      'Next.js uses your file/folder structure as your routes automatically. Create a file at pages/about.tsx and /about just works.',
    pros: ['Zero configuration', 'Server-side rendering included', 'API routes built in'],
    cons: ['Tied to Next.js framework', 'Opinionated structure', 'More complex deployment'],
    isDefault: false,
    url: 'https://nextjs.org',
  },
  {
    id: 'tanstack-router',
    blockId: 'routing',
    name: 'TanStack Router',
    description:
      'A modern, type-safe router for React with first-class TypeScript support and built-in search parameter management.',
    pros: ['Excellent TypeScript support', 'Type-safe route params', 'Built-in search params'],
    cons: ['Newer, smaller community', 'Steeper learning curve'],
    isDefault: false,
    url: 'https://tanstack.com/router',
  },

  // ── State Management ──────────────────────────────
  {
    id: 'zustand',
    blockId: 'state-management',
    name: 'Zustand',
    description:
      'A tiny, simple state management library. Create a "store" (a central place for shared data) with just a few lines of code.',
    pros: ['Very simple API', 'Tiny bundle size', 'No boilerplate'],
    cons: ['Less structure for large apps', 'Fewer dev tools'],
    isDefault: true,
    url: 'https://zustand-demo.pmnd.rs',
  },
  {
    id: 'react-context',
    blockId: 'state-management',
    name: 'React Context',
    description:
      'Built into React — no extra library needed. Pass data through your component tree without manually passing props at every level.',
    pros: ['No extra dependency', 'Built into React', 'Simple for small apps'],
    cons: ['Can cause unnecessary re-renders', 'Gets messy at scale'],
    isDefault: false,
  },
  {
    id: 'redux-toolkit',
    blockId: 'state-management',
    name: 'Redux Toolkit',
    description:
      'The official, modern way to use Redux. Provides a structured, predictable way to manage complex state with great dev tools.',
    pros: ['Predictable state updates', 'Excellent dev tools', 'Battle-tested at scale'],
    cons: ['More boilerplate', 'Steeper learning curve', 'Overkill for small apps'],
    isDefault: false,
    url: 'https://redux-toolkit.js.org',
  },
  {
    id: 'jotai',
    blockId: 'state-management',
    name: 'Jotai',
    description:
      'Atomic state management — break your state into small, independent pieces ("atoms") that components can subscribe to individually.',
    pros: ['Fine-grained reactivity', 'Simple mental model', 'Great for derived state'],
    cons: ['Different paradigm to learn', 'Smaller community'],
    isDefault: false,
    url: 'https://jotai.org',
  },

  // ── Backend / API ─────────────────────────────────
  {
    id: 'nextjs-api',
    blockId: 'backend-api',
    name: 'Next.js API Routes',
    description:
      'Build your API right alongside your frontend in the same project. Each file in the api/ folder becomes an endpoint.',
    pros: ['No separate server needed', 'Same language (TypeScript)', 'Easy deployment on Vercel'],
    cons: ['Tied to Next.js', 'Limited for complex backends', 'Cold starts on serverless'],
    isDefault: false,
    url: 'https://nextjs.org/docs/api-routes/introduction',
  },
  {
    id: 'supabase-edge',
    blockId: 'backend-api',
    name: 'Supabase Edge Functions',
    description:
      'Serverless functions that run close to your users worldwide. Write backend logic in TypeScript without managing servers.',
    pros: ['No server management', 'Global edge deployment', 'Integrates with Supabase DB'],
    cons: ['Limited runtime', 'Vendor lock-in', 'Cold start latency'],
    isDefault: true,
    url: 'https://supabase.com/edge-functions',
  },
  {
    id: 'express',
    blockId: 'backend-api',
    name: 'Express.js',
    description:
      'The classic Node.js web framework. Minimal and flexible — you build your API from scratch with full control.',
    pros: ['Maximum flexibility', 'Huge ecosystem', 'Well understood by AI tools'],
    cons: ['More setup required', 'Need to host a server', 'Security is your responsibility'],
    isDefault: false,
    url: 'https://expressjs.com',
  },
  {
    id: 'fastify',
    blockId: 'backend-api',
    name: 'Fastify',
    description:
      'A fast, modern Node.js framework with built-in schema validation and plugin system. Like Express but faster and more structured.',
    pros: ['Very fast', 'Built-in validation', 'Good TypeScript support'],
    cons: ['Smaller community than Express', 'Different plugin model'],
    isDefault: false,
    url: 'https://fastify.dev',
  },

  // ── Database ──────────────────────────────────────
  {
    id: 'supabase-db',
    blockId: 'database',
    name: 'Supabase (PostgreSQL)',
    description:
      'A hosted PostgreSQL database with a dashboard, auto-generated API, and real-time capabilities. Like Firebase but with a real SQL database.',
    pros: ['Full PostgreSQL power', 'Auto-generated REST API', 'Real-time subscriptions', 'Generous free tier'],
    cons: ['Vendor dependency', 'Learning SQL helps'],
    isDefault: true,
    url: 'https://supabase.com',
  },
  {
    id: 'firebase-firestore',
    blockId: 'database',
    name: 'Firebase Firestore',
    description:
      'A NoSQL document database from Google. Data is stored as "documents" in "collections" (like folders of JSON files) with real-time sync.',
    pros: ['Real-time by default', 'No SQL needed', 'Google-backed reliability'],
    cons: ['Vendor lock-in', 'Complex queries are limited', 'Can get expensive'],
    isDefault: false,
    url: 'https://firebase.google.com/products/firestore',
  },
  {
    id: 'planetscale',
    blockId: 'database',
    name: 'PlanetScale',
    description:
      'A serverless MySQL-compatible database built on Vitess (the technology that runs YouTube). Features database branching for safe schema changes.',
    pros: ['Database branching (like git)', 'Scales automatically', 'MySQL compatible'],
    cons: ['No foreign key constraints', 'MySQL-only', 'Free tier removed'],
    isDefault: false,
    url: 'https://planetscale.com',
  },
  {
    id: 'neon',
    blockId: 'database',
    name: 'Neon',
    description:
      'Serverless PostgreSQL with branching and scale-to-zero. Your database sleeps when not in use, saving costs.',
    pros: ['Scale to zero (saves money)', 'Database branching', 'Full PostgreSQL'],
    cons: ['Cold starts when waking up', 'Newer service'],
    isDefault: false,
    url: 'https://neon.tech',
  },

  // ── Auth ──────────────────────────────────────────
  {
    id: 'supabase-auth',
    blockId: 'auth',
    name: 'Supabase Auth',
    description:
      'Built-in authentication for Supabase projects. Supports email/password, magic links, and social logins (Google, GitHub, etc.) with row-level security.',
    pros: ['Integrates with Supabase DB', 'Row-level security', 'Many auth providers'],
    cons: ['Tied to Supabase', 'Less customizable UI'],
    isDefault: true,
    url: 'https://supabase.com/auth',
  },
  {
    id: 'clerk',
    blockId: 'auth',
    name: 'Clerk',
    description:
      'Drop-in authentication with beautiful, pre-built UI components. Handles sign-up, login, user profiles, and organizations.',
    pros: ['Beautiful pre-built UI', 'Very easy to integrate', 'Handles everything'],
    cons: ['Paid for production use', 'External dependency', 'Less control'],
    isDefault: false,
    url: 'https://clerk.com',
  },
  {
    id: 'next-auth',
    blockId: 'auth',
    name: 'NextAuth.js / Auth.js',
    description:
      'Open-source authentication for Next.js apps. Flexible, supports many providers, and you own all the data.',
    pros: ['Open source', 'Many providers', 'Full control over data'],
    cons: ['More setup required', 'Next.js focused', 'Session management complexity'],
    isDefault: false,
    url: 'https://authjs.dev',
  },
  {
    id: 'firebase-auth',
    blockId: 'auth',
    name: 'Firebase Auth',
    description:
      'Google\'s authentication service. Easy to set up with email/password, phone, and social logins.',
    pros: ['Easy setup', 'Google-backed', 'Phone auth included'],
    cons: ['Vendor lock-in', 'Limited customization'],
    isDefault: false,
    url: 'https://firebase.google.com/products/auth',
  },

  // ── Security ──────────────────────────────────────
  {
    id: 'helmet',
    blockId: 'security',
    name: 'Helmet.js',
    description:
      'Sets security-related HTTP headers automatically. Protects against common web vulnerabilities with one line of code.',
    pros: ['Simple to add', 'Covers many attack vectors', 'Industry standard'],
    cons: ['Node.js/Express only', 'Headers alone aren\'t enough'],
    isDefault: true,
    url: 'https://helmetjs.github.io',
  },
  {
    id: 'rate-limiting',
    blockId: 'security',
    name: 'Rate Limiting',
    description:
      'Limits how many requests a user can make in a given time period. Prevents abuse, brute-force attacks, and API overuse.',
    pros: ['Prevents abuse', 'Protects server resources', 'Simple concept'],
    cons: ['Needs tuning per endpoint', 'Can block legitimate users if too strict'],
    isDefault: true,
  },
  {
    id: 'input-validation',
    blockId: 'security',
    name: 'Input Validation (Zod)',
    description:
      'Validates and sanitizes all user input before processing it. Zod is a TypeScript-first schema validation library.',
    pros: ['Type-safe validation', 'Works on client and server', 'Great error messages'],
    cons: ['Extra code for every input', 'Learning curve for schemas'],
    isDefault: true,
    url: 'https://zod.dev',
  },

  // ── File Storage ──────────────────────────────────
  {
    id: 'supabase-storage',
    blockId: 'file-storage',
    name: 'Supabase Storage',
    description:
      'File storage integrated with Supabase. Upload, store, and serve files with access policies tied to your auth system.',
    pros: ['Integrates with Supabase auth', 'Built-in image transforms', 'Simple API'],
    cons: ['Tied to Supabase', 'Storage limits on free tier'],
    isDefault: true,
    url: 'https://supabase.com/storage',
  },
  {
    id: 'cloudflare-r2',
    blockId: 'file-storage',
    name: 'Cloudflare R2',
    description:
      'S3-compatible object storage with zero egress fees. Globally distributed and affordable for serving files.',
    pros: ['No egress fees', 'S3 compatible', 'Global CDN included'],
    cons: ['Separate from your app stack', 'More setup'],
    isDefault: false,
    url: 'https://developers.cloudflare.com/r2',
  },
  {
    id: 'aws-s3',
    blockId: 'file-storage',
    name: 'AWS S3',
    description:
      'The industry standard for file storage. Extremely reliable and scalable, but can be complex to set up.',
    pros: ['Industry standard', 'Infinitely scalable', 'Most tutorials available'],
    cons: ['Complex pricing', 'Egress fees', 'AWS learning curve'],
    isDefault: false,
    url: 'https://aws.amazon.com/s3',
  },
  {
    id: 'uploadthing',
    blockId: 'file-storage',
    name: 'UploadThing',
    description:
      'Simple file upload service designed for TypeScript apps. Drop-in components for upload UI and server-side handling.',
    pros: ['Very easy setup', 'Pre-built upload UI', 'TypeScript-first'],
    cons: ['Smaller service', 'Less control', 'Paid after free tier'],
    isDefault: false,
    url: 'https://uploadthing.com',
  },

  // ── Payments ──────────────────────────────────────
  {
    id: 'stripe',
    blockId: 'payments',
    name: 'Stripe',
    description:
      'The most popular payment platform for internet businesses. Handles one-time payments, subscriptions, invoicing, and more.',
    pros: ['Industry standard', 'Excellent documentation', 'Handles everything'],
    cons: ['Complex API', '2.9% + 30¢ per transaction', 'Account approval needed'],
    isDefault: true,
    url: 'https://stripe.com',
  },
  {
    id: 'lemon-squeezy',
    blockId: 'payments',
    name: 'Lemon Squeezy',
    description:
      'A merchant of record — they handle sales tax, VAT, and compliance for you. Simpler than Stripe if you\'re selling digital products.',
    pros: ['Handles tax compliance', 'Simpler than Stripe', 'Built for digital products'],
    cons: ['Higher fees', 'Less customizable', 'Fewer features'],
    isDefault: false,
    url: 'https://lemonsqueezy.com',
  },
  {
    id: 'paddle',
    blockId: 'payments',
    name: 'Paddle',
    description:
      'Another merchant of record option. They act as the seller on your behalf, handling tax, compliance, and billing.',
    pros: ['Full tax compliance', 'Invoice generation', 'Subscription management'],
    cons: ['Higher commission', 'Less control over checkout', 'Approval process'],
    isDefault: false,
    url: 'https://paddle.com',
  },

  // ── Email ─────────────────────────────────────────
  {
    id: 'resend',
    blockId: 'email-notifications',
    name: 'Resend',
    description:
      'Modern email API built for developers. Send transactional emails with React components as templates.',
    pros: ['React email templates', 'Simple API', 'Great developer experience'],
    cons: ['Newer service', 'Limited marketing features'],
    isDefault: true,
    url: 'https://resend.com',
  },
  {
    id: 'sendgrid',
    blockId: 'email-notifications',
    name: 'SendGrid',
    description:
      'Enterprise-grade email delivery from Twilio. Handles both transactional and marketing emails at scale.',
    pros: ['Battle-tested at scale', 'Marketing emails too', 'Generous free tier'],
    cons: ['Complex API', 'Can be overkill', 'UI is dated'],
    isDefault: false,
    url: 'https://sendgrid.com',
  },
  {
    id: 'postmark',
    blockId: 'email-notifications',
    name: 'Postmark',
    description:
      'Focused exclusively on transactional email delivery. Known for the fastest, most reliable delivery rates.',
    pros: ['Fastest delivery', 'Excellent deliverability', 'Simple API'],
    cons: ['Transactional only', 'Paid from day one'],
    isDefault: false,
    url: 'https://postmarkapp.com',
  },

  // ── Environment & Secrets ─────────────────────────
  {
    id: 'dotenv',
    blockId: 'env-secrets',
    name: '.env Files',
    description:
      'A simple .env file in your project root stores key-value pairs. Your code reads them as environment variables. Add .env to .gitignore so secrets never get committed.',
    pros: ['Simple and universal', 'No extra services', 'Works everywhere'],
    cons: ['No encryption', 'Easy to accidentally commit', 'Manual syncing across team'],
    isDefault: true,
  },
  {
    id: 'vercel-env',
    blockId: 'env-secrets',
    name: 'Vercel Environment Variables',
    description:
      'Store secrets in Vercel\'s dashboard. They\'re injected into your app at build and runtime. Supports different values for preview, development, and production.',
    pros: ['Encrypted storage', 'Per-environment values', 'No files to manage'],
    cons: ['Tied to Vercel', 'Needs dashboard access'],
    isDefault: false,
    url: 'https://vercel.com/docs/environment-variables',
  },
  {
    id: 'infisical',
    blockId: 'env-secrets',
    name: 'Infisical',
    description:
      'Open-source secrets management platform. Centralized, encrypted, and syncs secrets across your team and environments.',
    pros: ['Encrypted & centralized', 'Team-friendly', 'Open source'],
    cons: ['Extra service to manage', 'Learning curve'],
    isDefault: false,
    url: 'https://infisical.com',
  },

  // ── Hosting ───────────────────────────────────────
  {
    id: 'vercel',
    blockId: 'hosting',
    name: 'Vercel',
    description:
      'The platform behind Next.js. Optimized for frontend frameworks with instant global deployment, preview URLs for every commit, and serverless functions.',
    pros: ['Best-in-class DX', 'Automatic preview deployments', 'Global CDN', 'Generous free tier'],
    cons: ['Can get expensive at scale', 'Vendor lock-in for some features'],
    isDefault: true,
    url: 'https://vercel.com',
  },
  {
    id: 'netlify',
    blockId: 'hosting',
    name: 'Netlify',
    description:
      'Hosting platform for web projects with built-in CI/CD, serverless functions, and form handling. Great for static sites and Jamstack.',
    pros: ['Easy setup', 'Built-in forms', 'Good free tier'],
    cons: ['Slower builds than Vercel', 'Less framework optimization'],
    isDefault: false,
    url: 'https://netlify.com',
  },
  {
    id: 'cloudflare-pages',
    blockId: 'hosting',
    name: 'Cloudflare Pages',
    description:
      'Hosting on Cloudflare\'s edge network. Extremely fast globally with built-in Workers (serverless functions) and generous free tier.',
    pros: ['Very fast globally', 'Generous free tier', 'Workers for backend logic'],
    cons: ['Fewer integrations', 'Workers have size limits'],
    isDefault: false,
    url: 'https://pages.cloudflare.com',
  },
  {
    id: 'railway',
    blockId: 'hosting',
    name: 'Railway',
    description:
      'Deploy anything — frontend, backend, databases — from a single dashboard. Great for full-stack apps that need a traditional server.',
    pros: ['Deploy anything', 'Database hosting included', 'Simple pricing'],
    cons: ['No free tier anymore', 'Less CDN optimization'],
    isDefault: false,
    url: 'https://railway.app',
  },

  // ── CI/CD ─────────────────────────────────────────
  {
    id: 'github-actions',
    blockId: 'ci-cd',
    name: 'GitHub Actions',
    description:
      'Automated workflows built into GitHub. Run tests, lint code, and deploy on every push. Free for public repos, generous free tier for private.',
    pros: ['Built into GitHub', 'Free for public repos', 'Huge marketplace of actions'],
    cons: ['YAML configuration', 'Can be slow', 'Debugging is painful'],
    isDefault: true,
    url: 'https://github.com/features/actions',
  },
  {
    id: 'vercel-ci',
    blockId: 'ci-cd',
    name: 'Vercel CI/CD',
    description:
      'Automatic builds and deployments on every git push. Preview deployments for pull requests. Zero configuration needed.',
    pros: ['Zero config', 'Preview deployments', 'Fast builds'],
    cons: ['Limited to Vercel hosting', 'Less customizable'],
    isDefault: false,
    url: 'https://vercel.com',
  },

  // ── Analytics ─────────────────────────────────────
  {
    id: 'plausible',
    blockId: 'analytics',
    name: 'Plausible',
    description:
      'Privacy-friendly, lightweight analytics. No cookies needed, GDPR compliant out of the box. Shows you what matters without invading user privacy.',
    pros: ['Privacy-first (no cookies)', 'GDPR compliant', 'Simple dashboard'],
    cons: ['Paid only', 'Fewer features than Google Analytics'],
    isDefault: true,
    url: 'https://plausible.io',
  },
  {
    id: 'posthog',
    blockId: 'analytics',
    name: 'PostHog',
    description:
      'All-in-one product analytics — session recordings, feature flags, A/B testing, and funnels. Open source with a generous free tier.',
    pros: ['All-in-one platform', 'Open source', 'Session recordings'],
    cons: ['Can be complex', 'Heavier script', 'Learning curve'],
    isDefault: false,
    url: 'https://posthog.com',
  },
  {
    id: 'sentry',
    blockId: 'analytics',
    name: 'Sentry',
    description:
      'Error tracking and performance monitoring. Automatically captures crashes and slow transactions with full context for debugging.',
    pros: ['Automatic error capture', 'Stack traces & context', 'Performance monitoring'],
    cons: ['Can be noisy', 'Pricing based on volume'],
    isDefault: false,
    url: 'https://sentry.io',
  },

  // ── SEO ───────────────────────────────────────────
  {
    id: 'next-seo',
    blockId: 'seo-performance',
    name: 'Next SEO / Meta Tags',
    description:
      'Manage SEO meta tags, Open Graph images, and structured data. Makes your pages look good when shared on social media and in search results.',
    pros: ['Easy meta tag management', 'Social sharing previews', 'Structured data support'],
    cons: ['Requires server rendering for full effect'],
    isDefault: true,
  },
  {
    id: 'lighthouse',
    blockId: 'seo-performance',
    name: 'Lighthouse CI',
    description:
      'Google\'s automated tool for measuring page quality — performance, accessibility, SEO, and best practices. Run it in CI to catch regressions.',
    pros: ['Industry standard metrics', 'Actionable recommendations', 'Free'],
    cons: ['Scores can be noisy', 'Local vs. production differences'],
    isDefault: false,
    url: 'https://developer.chrome.com/docs/lighthouse',
  },
  {
    id: 'web-vitals',
    blockId: 'seo-performance',
    name: 'Web Vitals',
    description:
      'Track Core Web Vitals (loading speed, interactivity, visual stability) — the metrics Google uses to rank your site.',
    pros: ['Real user metrics', 'Google ranking factor', 'Small library'],
    cons: ['Only measures, doesn\'t fix', 'Needs real traffic for data'],
    isDefault: false,
    url: 'https://web.dev/vitals',
  },

  // ── Testing ───────────────────────────────────────
  {
    id: 'vitest',
    blockId: 'testing',
    name: 'Vitest',
    description:
      'A blazing-fast test runner built on Vite. Compatible with Jest\'s API but much faster. Perfect for unit and integration tests.',
    pros: ['Very fast', 'Vite-native', 'Jest-compatible API'],
    cons: ['Newer than Jest', 'Slightly smaller ecosystem'],
    isDefault: true,
    url: 'https://vitest.dev',
  },
  {
    id: 'playwright',
    blockId: 'testing',
    name: 'Playwright',
    description:
      'End-to-end testing framework from Microsoft. Controls real browsers to test your app exactly as users experience it.',
    pros: ['Cross-browser testing', 'Auto-waiting for elements', 'Excellent debugging'],
    cons: ['Slower than unit tests', 'More complex setup', 'Flaky if not careful'],
    isDefault: false,
    url: 'https://playwright.dev',
  },
  {
    id: 'testing-library',
    blockId: 'testing',
    name: 'Testing Library',
    description:
      'Test your components the way users interact with them — by finding buttons by their text, not by CSS selectors. Works with React, Vue, and more.',
    pros: ['User-centric testing', 'Framework agnostic', 'Discourages testing implementation details'],
    cons: ['Some patterns are verbose', 'Learning the query priority'],
    isDefault: false,
    url: 'https://testing-library.com',
  },
];
