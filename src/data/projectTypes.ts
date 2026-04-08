import type { ProjectType, Tier } from '../types';

export const projectTypes: ProjectType[] = [
  {
    id: 'markdown',
    name: 'Markdown',
    tier: 1,
    tagline: 'Structured document — skill, rule, hook, or workflow',
    description:
      'A markdown-based deliverable like an AI skill file, cursor rule, automation hook, or workflow guide. These are structured text documents with clear sections, YAML frontmatter, and specific formatting conventions. No build step, no UI framework — just well-organized markdown that follows a defined schema.',
    examples: [
      'Cursor rule (.mdc)',
      'AI skill file (SKILL.md)',
      'Git hook or workflow config',
      'Automation runbook',
      'Process or decision playbook',
    ],
  },
  {
    id: 'mood-board',
    name: 'Mood Board',
    tier: 1,
    tagline: 'Visual language only',
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
    id: 'ios-mac-app',
    name: 'iOS / Mac App',
    tier: 5,
    tagline: 'Native Apple platform application',
    description:
      'A native application for iPhone, iPad, or Mac built with Swift and SwiftUI (or UIKit). It runs on Apple hardware, is distributed through the App Store or TestFlight, and follows Apple\'s Human Interface Guidelines. This covers everything from single-purpose utilities to full-featured apps with networking, persistence, and system integrations.',
    examples: [
      'Utility or productivity app',
      'Health or fitness tracker',
      'Media player or content app',
      'Camera or photo editing tool',
      'Companion app for a web service',
    ],
  },
  {
    id: 'platform',
    name: 'Platform',
    tier: 7,
    tagline: 'Complex multi-service system',
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

/** Resolve tier for a project type id (legacy ids included). */
export function getTierForProjectTypeId(typeId: string): Tier {
  if (!typeId) return 1;
  if (typeId === 'style-tile') return 1;
  const p = projectTypes.find((t) => t.id === typeId);
  return p?.tier ?? 1;
}
