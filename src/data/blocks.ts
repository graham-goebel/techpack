import type { Block, BlockStatus, Tier } from '../types';

function tierRange(
  minRequired: Tier,
  minRecommended?: Tier,
  minOptional?: Tier,
): (tier: Tier) => BlockStatus {
  return (tier: Tier): BlockStatus => {
    if (tier >= minRequired) return 'required';
    if (minRecommended && tier >= minRecommended) return 'recommended';
    if (minOptional && tier >= minOptional) return 'optional';
    return 'hidden';
  };
}

export const blocks: Block[] = [
  {
    id: 'visual-ui',
    name: 'Visual Language / UI',
    summary: 'How your project looks — colors, fonts, spacing, and component styles.',
    explanation:
      'This is your project\'s visual identity. It defines the color palette, typography (fonts and sizes), spacing system, and how individual elements like buttons, cards, and forms look. Think of it as your project\'s "outfit" — it sets the tone and feel for everything users see.',
    whyNeeded:
      'Without a visual language, your project will look inconsistent and unprofessional. Defining these rules up front saves you from ad-hoc design decisions later and makes the whole thing feel cohesive.',
    minTier: 1,
    statusForTier: tierRange(1),
    techOptionIds: ['tailwind', 'css-modules', 'styled-components', 'vanilla-css'],
    libraryIds: [
      'heroicons', 'lucide', 'phosphor', 'tabler-icons',
      'framer-motion', 'gsap', 'auto-animate', 'tailwind-animate', 'lottie',
      'shadcn-ui', 'radix-primitives', 'headless-ui', 'react-aria',
      'fontsource', 'google-fonts',
    ],
  },
  {
    id: 'markup-structure',
    name: 'Markup & Structure',
    summary: 'The HTML skeleton — semantic tags, page layout, and accessibility.',
    explanation:
      'HTML is the bones of every web page. Good markup uses the right tags for the right content (headings, lists, buttons) so that screen readers, search engines, and browsers all understand your page. This block covers how your pages are structured and organized.',
    whyNeeded:
      'Proper structure makes your site accessible to people with disabilities, improves SEO, and makes your code easier to maintain. It\'s the foundation everything else sits on top of.',
    minTier: 1,
    statusForTier: tierRange(1),
    techOptionIds: [],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    summary: 'WCAG compliance, screen reader support, keyboard navigation, and contrast ratios.',
    explanation:
      'Accessibility (a11y) means making your app usable by everyone, including people with visual, motor, cognitive, or hearing disabilities. This covers WCAG 2.0/2.1 guidelines, AA contrast ratios (4.5:1 for text, 3:1 for large text), keyboard navigation, screen reader compatibility, focus management, ARIA attributes, and reduced-motion preferences.',
    whyNeeded:
      'About 15% of people worldwide have some form of disability. Accessible design isn\'t just ethical — in many jurisdictions it\'s legally required (ADA, EAA). Beyond compliance, accessible apps are better for everyone: keyboard shortcuts help power users, good contrast helps in bright sunlight, and clear focus states help anyone navigating with a keyboard.',
    minTier: 3,
    statusForTier: tierRange(5, 3),
    techOptionIds: ['axe-core', 'eslint-a11y', 'pa11y'],
  },
  {
    id: 'functionality',
    name: 'Functionality / Interactivity',
    summary: 'Client-side JavaScript that makes things interactive.',
    explanation:
      'This is the code that makes your project do things — respond to clicks, validate forms, animate elements, toggle menus, fetch data from elsewhere. Without it, your page is static and can\'t react to what users do.',
    whyNeeded:
      'Unless you\'re building a pure visual reference, users expect things to respond to their actions. JavaScript powers all the interactivity that makes a project feel alive.',
    minTier: 2,
    statusForTier: tierRange(2),
    techOptionIds: ['react', 'vue', 'svelte', 'vanilla-js'],
    libraryIds: [
      'react-hook-form', 'tanstack-query', 'tanstack-table',
      'dnd-kit', 'recharts', 'date-fns', 'sonner',
    ],
  },
  {
    id: 'routing',
    name: 'Routing & Navigation',
    summary: 'How users move between pages or views in your project.',
    explanation:
      'Routing is the system that decides what content to show when a user visits a URL like /about or /dashboard. It\'s what makes your browser\'s back button work and lets you share links to specific pages. Think of it as a map for your project.',
    whyNeeded:
      'Any project with more than one page needs routing. Without it, users can\'t navigate, bookmark pages, or share links. It\'s essential for multi-page experiences.',
    minTier: 4,
    statusForTier: tierRange(4, 3),
    techOptionIds: ['react-router', 'nextjs-routing', 'tanstack-router'],
  },
  {
    id: 'state-management',
    name: 'State Management',
    summary: 'How your app tracks and shares data between components.',
    explanation:
      'State is any data your app needs to remember — is the menu open? What did the user type? Which items are in the cart? State management is the system for storing this data and keeping your entire UI in sync when it changes. Without it, different parts of your app can get "out of sync" and show conflicting information.',
    whyNeeded:
      'Simple projects can get by with local component state, but once you have data shared across many parts of your app (like a logged-in user\'s info appearing in the header, sidebar, and profile page), you need a strategy to keep it all consistent.',
    minTier: 5,
    statusForTier: tierRange(5, 4),
    techOptionIds: ['zustand', 'react-context', 'redux-toolkit', 'jotai'],
  },
  {
    id: 'backend-api',
    name: 'Backend / API Layer',
    summary: 'Server-side code that processes requests and talks to databases.',
    explanation:
      'The backend is the "behind the scenes" part of your app that users never see. It receives requests from the frontend, processes them (validate data, check permissions, talk to the database), and sends back responses. An API (Application Programming Interface) is the set of rules for how the frontend and backend communicate.',
    whyNeeded:
      'If your app needs to store data permanently, process payments, send emails, or do anything that shouldn\'t be visible to users (like checking passwords), it needs a backend. The frontend alone can\'t do these things securely.',
    minTier: 5,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['nextjs-api', 'supabase-edge', 'express', 'fastify'],
  },
  {
    id: 'database',
    name: 'Database & Data Modeling',
    summary: 'Where your app\'s data lives permanently.',
    explanation:
      'A database is like a sophisticated spreadsheet that your app reads from and writes to. Data modeling is the process of deciding how to organize that data — what tables (or collections) you need, what columns they have, and how they relate to each other. For example, a "users" table might connect to an "orders" table.',
    whyNeeded:
      'If users create accounts, post content, or generate any data that needs to persist after they close the browser, you need a database. It\'s the permanent memory of your application.',
    minTier: 6,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['supabase-db', 'firebase-firestore', 'planetscale', 'neon'],
  },
  {
    id: 'auth',
    name: 'Authentication & Authorization',
    summary: 'User login, accounts, roles, and permissions.',
    explanation:
      'Authentication is verifying who someone is (login). Authorization is deciding what they\'re allowed to do (permissions). Together, they control access to your app. This includes sign-up flows, password resets, session management, and role-based access (e.g., admin vs. regular user).',
    whyNeeded:
      'Any app with user accounts needs auth. Without it, anyone could access anyone else\'s data. It\'s one of the most important security features and typically one of the first things to set up.',
    minTier: 6,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['supabase-auth', 'clerk', 'next-auth', 'firebase-auth'],
  },
  {
    id: 'security',
    name: 'Security & Sensitive Data',
    summary: 'Protecting your app and user data from attacks.',
    explanation:
      'Security covers all the measures that protect your app from malicious actors. This includes encrypting data in transit (HTTPS), validating user input to prevent injection attacks, setting up proper CORS policies (which websites can talk to your API), and following OWASP best practices. It\'s not glamorous, but skipping it can be catastrophic.',
    whyNeeded:
      'Every app that accepts user input or handles data needs basic security. A security breach can destroy user trust and, depending on the data involved, have legal consequences. Better to build it in from the start than bolt it on later.',
    minTier: 5,
    statusForTier: tierRange(6, 5, 3),
    techOptionIds: ['helmet', 'rate-limiting', 'input-validation'],
  },
  {
    id: 'file-storage',
    name: 'File Storage & Media',
    summary: 'Uploading, storing, and serving images, videos, and documents.',
    explanation:
      'When users upload profile pictures, attach documents, or share videos, those files need to be stored somewhere and served back efficiently. File storage services handle this — they store files in the cloud and provide URLs to access them. They also handle things like image resizing and format conversion.',
    whyNeeded:
      'If your app allows any kind of file upload (avatars, documents, media), you need a storage solution. Storing files in your database is expensive and slow — dedicated storage services are built for this.',
    minTier: 6,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['supabase-storage', 'cloudflare-r2', 'aws-s3', 'uploadthing'],
  },
  {
    id: 'payments',
    name: 'Payments & Billing',
    summary: 'Accepting payments, subscriptions, and invoicing.',
    explanation:
      'If you charge money — one-time payments, subscriptions, or usage-based billing — you need a payment processor. These services handle the complex (and legally regulated) process of charging credit cards, managing subscriptions, handling refunds, and generating invoices. You never store credit card numbers yourself.',
    whyNeeded:
      'Monetization is what makes a SaaS sustainable. Payment processors handle PCI compliance (credit card security regulations) so you don\'t have to. They also manage subscription lifecycle, failed payments, and invoicing.',
    minTier: 6,
    statusForTier: tierRange(7, 6),
    techOptionIds: ['stripe', 'lemon-squeezy', 'paddle'],
  },
  {
    id: 'email-notifications',
    name: 'Email & Notifications',
    summary: 'Sending emails, push notifications, and in-app alerts.',
    explanation:
      'Transactional emails are messages triggered by user actions — welcome emails, password resets, order confirmations. Push notifications alert users on their devices. Webhooks let your app notify other services when things happen. This block covers all the ways your app communicates with users outside the main interface.',
    whyNeeded:
      'Users expect confirmation emails, password reset links, and notifications about important events. Without them, your app feels incomplete and users lose trust. Webhooks enable integrations with other tools.',
    minTier: 6,
    statusForTier: tierRange(7, 6),
    techOptionIds: ['resend', 'sendgrid', 'postmark'],
  },
  {
    id: 'env-secrets',
    name: 'Environment & Secrets',
    summary: 'Managing API keys, tokens, and configuration securely.',
    explanation:
      'Your project uses API keys, database passwords, and service tokens that must stay secret. Environment variables let you store these outside your code so they\'re never accidentally shared. A .env file keeps them locally; hosting platforms have their own secrets management. This block ensures sensitive data is handled safely.',
    whyNeeded:
      'Accidentally committing an API key to a public repository can lead to unauthorized access and charges on your accounts. Proper secrets management prevents this and makes it easy to use different credentials for development vs. production.',
    minTier: 3,
    statusForTier: tierRange(5, 3),
    techOptionIds: ['dotenv', 'vercel-env', 'infisical'],
  },
  {
    id: 'hosting',
    name: 'Hosting & Deployment',
    summary: 'Where your project lives on the internet and how it gets there.',
    explanation:
      'Hosting is renting a server (or a piece of one) where your project runs and is accessible via a URL. Deployment is the process of sending your code to that server. Modern platforms make this nearly automatic — push your code, and it\'s live in minutes.',
    whyNeeded:
      'Your project exists only on your computer until it\'s hosted somewhere. Hosting makes it accessible to the world. Choosing the right platform affects cost, speed, and how easy it is to update.',
    minTier: 3,
    statusForTier: tierRange(4, 3),
    techOptionIds: ['vercel', 'netlify', 'cloudflare-pages', 'railway'],
  },
  {
    id: 'ci-cd',
    name: 'CI/CD & Dev Process',
    summary: 'Automated testing, code review, and deployment pipelines.',
    explanation:
      'CI/CD stands for Continuous Integration / Continuous Deployment. It means every time you push code, automated systems check for errors (run tests, lint code) and deploy it if everything passes. It also covers your development workflow — branching strategy, code review, and how changes get approved.',
    whyNeeded:
      'As your project grows, manually checking and deploying code becomes error-prone and slow. CI/CD catches bugs before they reach users and makes deployments predictable and reversible. It\'s essential for team projects.',
    minTier: 5,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['github-actions', 'vercel-ci'],
  },
  {
    id: 'analytics',
    name: 'Analytics & Monitoring',
    summary: 'Tracking usage, errors, and performance in production.',
    explanation:
      'Analytics tells you how people use your product — which pages they visit, which features they use, where they drop off. Monitoring watches for errors and performance issues in real time. Together, they answer "is it working?" and "are people using it?"',
    whyNeeded:
      'You can\'t improve what you don\'t measure. Analytics reveals what users actually do (vs. what you assumed). Monitoring catches errors before users report them, so you can fix issues quickly.',
    minTier: 5,
    statusForTier: tierRange(6, 5, 4),
    techOptionIds: ['plausible', 'posthog', 'sentry'],
  },
  {
    id: 'seo-performance',
    name: 'SEO & Performance',
    summary: 'Making your site fast and discoverable by search engines.',
    explanation:
      'SEO (Search Engine Optimization) is about making Google (and other search engines) understand and rank your pages. Performance is about making your site load quickly — Google actually penalizes slow sites. This covers meta tags, structured data, image optimization, caching, lazy loading, and Core Web Vitals.',
    whyNeeded:
      'If people can\'t find your site through search, it might as well not exist. And if it\'s slow, they\'ll leave before it loads. SEO and performance are often afterthoughts, but they\'re much easier to build in from the start.',
    minTier: 4,
    statusForTier: tierRange(4),
    techOptionIds: ['next-seo', 'lighthouse', 'web-vitals'],
  },
  {
    id: 'testing',
    name: 'Testing',
    summary: 'Automated checks that verify your code works correctly.',
    explanation:
      'Tests are small programs that automatically verify your app works as expected. Unit tests check individual functions. Integration tests check that pieces work together. End-to-end (E2E) tests simulate real user interactions in a browser. Good tests catch bugs before users do and give you confidence to make changes.',
    whyNeeded:
      'Without tests, every change is a gamble — you might break something without knowing it. Tests are especially important when multiple people work on a project or when the codebase gets large enough that you can\'t keep it all in your head.',
    minTier: 5,
    statusForTier: tierRange(6, 5),
    techOptionIds: ['vitest', 'playwright', 'testing-library'],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    summary: 'README files, API docs, and architecture decisions.',
    explanation:
      'Documentation is the written guide to your project — how to set it up, how it works, and why decisions were made. A README explains how to get started. API docs describe endpoints for other developers. Architecture Decision Records (ADRs) capture why you chose one approach over another.',
    whyNeeded:
      'Future you (or anyone else working on the project) needs to understand the codebase. Good documentation reduces onboarding time and prevents people from re-discovering things the hard way. Even solo projects benefit from documenting key decisions.',
    minTier: 5,
    statusForTier: tierRange(6, 5),
    techOptionIds: [],
  },
  {
    id: 'compliance',
    name: 'Compliance & Legal',
    summary: 'Privacy policies, terms of service, GDPR, and cookie consent.',
    explanation:
      'If you collect user data (even just email addresses), laws like GDPR (Europe), CCPA (California), and others require you to disclose what you collect, how you use it, and let users delete their data. This block covers privacy policies, terms of service, cookie consent banners, and data handling practices.',
    whyNeeded:
      'Legal compliance isn\'t optional — violating privacy laws can result in significant fines. Even small SaaS apps need a privacy policy and terms of service. It\'s also good practice: users trust apps that are transparent about data handling.',
    minTier: 6,
    statusForTier: tierRange(7, 6),
    techOptionIds: [],
  },
];
