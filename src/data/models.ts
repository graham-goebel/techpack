import type { ModelRecommendation, ToolRecommendation } from '../types';

export const modelRecommendations: ModelRecommendation[] = [
  {
    id: 'sonnet-fast',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    tiers: [1, 2],
    description:
      'Fast and capable — handles CSS, simple scripts, and plugin logic with ease. Cost-effective for straightforward tasks.',
    reasoning:
      'Mood boards and plugins are tightly scoped projects. Sonnet can handle these confidently without needing deep architectural reasoning.',
    url: 'https://anthropic.com',
  },
  {
    id: 'gpt4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    tiers: [1, 2],
    description:
      'Very fast and cheap. Good for simple code generation, CSS, and small scripting tasks.',
    reasoning:
      'For small, well-defined tasks, a lighter model saves cost and time without sacrificing quality.',
    url: 'https://openai.com',
  },
  {
    id: 'sonnet-mid',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    tiers: [3, 4],
    description:
      'Strong multi-file reasoning. Handles prototypes and websites with routing, components, and SEO considerations.',
    reasoning:
      'Prototypes and websites involve multiple files and concerns (structure, styling, interactivity, SEO). Sonnet handles this scope well.',
    url: 'https://anthropic.com',
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tiers: [3, 4],
    description:
      'Well-rounded model with good coding ability. Reliable for multi-page sites and interactive prototypes.',
    reasoning:
      'GPT-4o has strong coding skills and broad knowledge, making it reliable for medium-complexity projects.',
    url: 'https://openai.com',
  },
  {
    id: 'sonnet-thinking',
    name: 'Claude Sonnet (extended thinking)',
    provider: 'Anthropic',
    tiers: [5, 6],
    description:
      'Extended thinking mode lets the model reason through complex architecture before writing code. Ideal for apps with auth, databases, and security.',
    reasoning:
      'Web apps and SaaS platforms have many interconnected concerns. Extended thinking helps the model plan architecture, data models, and security before generating code.',
    url: 'https://anthropic.com',
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'OpenAI',
    tiers: [5, 6],
    description:
      'Advanced reasoning model. Thinks step-by-step through complex problems. Good for system design and security-critical code.',
    reasoning:
      'The reasoning capabilities help with architectural decisions, security considerations, and complex data modeling.',
    url: 'https://openai.com',
  },
  {
    id: 'opus',
    name: 'Claude Opus',
    provider: 'Anthropic',
    tiers: [7],
    description:
      'The most capable model for complex, multi-service architectures. Deep reasoning across many interconnected systems.',
    reasoning:
      'Platform-scale projects require reasoning about service boundaries, data flows, security across services, deployment strategies, and more. Opus excels at this level of complexity.',
    url: 'https://anthropic.com',
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    tiers: [7],
    description:
      'Top-tier reasoning model. Excels at complex system design, security analysis, and multi-step architectural planning.',
    reasoning:
      'For platform-level architecture, o1\'s deep reasoning helps plan service interactions, security boundaries, and scaling strategies.',
    url: 'https://openai.com',
  },
];

export const toolRecommendations: ToolRecommendation[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    tiers: [1, 2, 3, 4, 5, 6, 7],
    description:
      'AI-powered code editor. Write code alongside an AI agent that can read your codebase, run commands, and make changes across files. Best for building real projects from scratch.',
    reasoning:
      'Cursor gives the AI full context of your project and the ability to create, edit, and run files. This makes it the most versatile tool for any project size.',
    url: 'https://cursor.com',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    tiers: [3, 4, 5, 6, 7],
    description:
      'Terminal-based AI coding agent. Runs in your terminal, reads your codebase, and makes changes with your approval. Great for experienced developers who prefer the command line.',
    reasoning:
      'Claude Code works directly in your development environment. It\'s powerful for complex projects where you want fine-grained control over AI actions.',
    url: 'https://docs.anthropic.com/en/docs/claude-code',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    tiers: [3, 4, 5, 6, 7],
    description:
      'OpenAI\'s cloud-based coding agent. Runs tasks in a sandboxed environment and creates pull requests. Good for delegating well-defined tasks.',
    reasoning:
      'Codex excels at self-contained tasks you can clearly describe. It runs in the cloud so it won\'t disrupt your local environment.',
    url: 'https://openai.com/codex',
  },
  {
    id: 'v0',
    name: 'v0 by Vercel',
    tiers: [1, 2, 3, 4],
    description:
      'AI-powered UI generator. Describe what you want and get a working component or page. Best for generating UI quickly without writing code yourself.',
    reasoning:
      'v0 excels at translating descriptions into polished UI components. Perfect for visual projects and prototypes where the look matters most.',
    url: 'https://v0.dev',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    tiers: [1, 2, 3, 4, 5],
    description:
      'Browser-based AI development environment. Build and deploy web apps directly in your browser with AI assistance. No local setup needed.',
    reasoning:
      'Bolt is great for getting started quickly without installing anything. It handles deployment automatically, which reduces setup friction.',
    url: 'https://bolt.new',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    tiers: [1, 2, 3, 4, 5],
    description:
      'AI-powered app builder that generates full-stack applications from descriptions. Focuses on speed and visual output with built-in deployment.',
    reasoning:
      'Lovable is designed for non-technical users to build functional apps quickly. Best for prototypes and MVPs where speed matters more than customization.',
    url: 'https://lovable.dev',
  },
];
