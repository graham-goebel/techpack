import type { ProjectType } from '../types';

export const projectTypes: ProjectType[] = [
  {
    id: 'mood-board',
    name: 'Mood Board',
    tier: 1,
    tagline: 'Visual language only',
    icon: '🎨',
    description:
      'A mood board defines your visual identity — colors, typography, spacing, and component examples — all in pure HTML and CSS. No JavaScript, no servers, no complexity. Perfect for establishing a design direction before building anything.',
    examples: [
      'Brand mood board page',
      'Design token reference sheet',
      'CSS component showcase',
      'Stakeholder-friendly visual summary',
    ],
  },
  {
    id: 'plugin-extension',
    name: 'Plugin / Extension',
    tier: 2,
    tagline: 'Functionality within an existing platform',
    icon: '🔌',
    description:
      'A plugin or extension adds features to an existing app like Figma, After Effects, Chrome, or VS Code. You write code that runs inside someone else\'s platform, using their APIs. The platform handles the hard stuff — you just add your functionality.',
    examples: [
      'Figma plugin for design tokens',
      'Chrome extension for bookmarks',
      'After Effects script for batch export',
      'VS Code extension for snippets',
    ],
  },
  {
    id: 'prototype',
    name: 'Prototype',
    tier: 3,
    tagline: 'Interactive proof of concept',
    icon: '⚡',
    description:
      'A prototype is a working demo that proves your idea is feasible. It might be a single page or a few connected screens with real interactivity. It doesn\'t need to be production-ready — it just needs to demonstrate the concept convincingly.',
    examples: [
      'Interactive landing page concept',
      'Clickable app demo',
      'API integration proof of concept',
      'Animation and interaction showcase',
    ],
  },
  {
    id: 'website',
    name: 'Website',
    tier: 4,
    tagline: 'Multi-page static or light-dynamic site',
    icon: '🌐',
    description:
      'A website has multiple pages, navigation, and is meant to be found and used by real people. It needs to look good on all devices, load fast, and be discoverable by search engines. Think marketing sites, portfolios, blogs, or documentation.',
    examples: [
      'Company marketing website',
      'Personal portfolio',
      'Blog or content site',
      'Documentation site',
    ],
  },
  {
    id: 'web-app',
    name: 'Web App',
    tier: 5,
    tagline: 'Dynamic application with state and logic',
    icon: '💻',
    description:
      'A web app is interactive software that runs in the browser. Users do things — fill forms, filter data, interact with dashboards — and the app responds in real time. It may talk to external APIs or services, and typically uses a modern JavaScript framework with a build step.',
    examples: [
      'Dashboard or analytics tool',
      'Project management app',
      'Form builder or calculator',
      'Internal business tool',
    ],
  },
  {
    id: 'saas',
    name: 'SaaS',
    tier: 6,
    tagline: 'Multi-user app with accounts and data',
    icon: '🏢',
    description:
      'Software as a Service — a full application where multiple users sign up, log in, and work with their own data. It needs user accounts, a database, security, and often payments. This is a real product that people rely on.',
    examples: [
      'Invoicing / billing platform',
      'Team collaboration tool',
      'Booking or scheduling system',
      'Customer relationship manager (CRM)',
    ],
  },
  {
    id: 'platform',
    name: 'Platform',
    tier: 7,
    tagline: 'Complex multi-service system',
    icon: '🏗️',
    description:
      'A platform is a large-scale system with multiple interconnected services. Think user-facing apps, admin dashboards, APIs for third parties, background jobs, file storage, and more. It requires careful architecture, security, and operational planning from day one.',
    examples: [
      'Marketplace (buyers + sellers + admin)',
      'Social network with feeds and messaging',
      'Developer platform with API and docs',
      'Enterprise suite with multiple apps',
    ],
  },
];
