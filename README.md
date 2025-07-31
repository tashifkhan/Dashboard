# Docs - tashif.codes

A modern, responsive personal dashboard built with **Astro** that showcases projects, blog posts, coding achievements, and professional information. This dashboard serves as a comprehensive portfolio and personal brand hub.

![Dashboard Preview](https://img.shields.io/badge/Astro-5.6.1-FF5D01?logo=astro)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.3-38B2AC?logo=tailwind-css)

## Features

### Multi-Section Dashboard

- **Projects**: Showcase your GitHub repositories with filtering and search
- **Blog**: Technical articles and thoughts with category filtering
- **LeetCode**: Coding challenge statistics, contests, and badges
- **GitHub**: Comprehensive GitHub profile analytics and contributions
- **Resume**: Professional experience and skills
- **Community**: Social media links and professional connections

### Technical Features

- **Modern Stack**: Built with Astro, React, TypeScript, and Tailwind CSS
- **Real-time Data**: Fetches live data from GitHub, LeetCode, and custom APIs
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme toggle with persistent preferences
- **Search & Filter**: Advanced search functionality with fuzzy matching
- **Performance**: Fast loading with static generation and optimized assets

### Data Integration

- **GitHub API**: Repository stats, contributions, pull requests, and stars
- **LeetCode API**: Problem-solving stats, contest history, and achievements
- **Custom APIs**: Personal data endpoints for enhanced functionality
- **Dynamic Content**: Real-time updates from external services

## Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** (recommended)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tashifkhan/Dashboard
   cd Dashboard
   ```

2. **Install dependencies**

   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Start development server**

   ```bash
   # Using Bun
   bun run dev

   # Or using npm
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321` to view your dashboard

## Configuration

### Environment Setup

The dashboard uses several external APIs for data fetching. You'll need to configure these endpoints:

1. **GitHub Stats API**: `https://github-stats.tashif.codes/`
2. **LeetCode Stats API**: `https://leetcode-stats.tashif.codes/`

### Customization

#### Personal Information

Update your personal details in the main page:

- Profile picture and name
- Social media links
- Professional title

#### Data Sources

Modify the data fetching functions in `src/data/`:

- `projects.ts` - GitHub repositories
- `blog.ts` - Blog posts and articles
- `leetcode.ts` - LeetCode statistics
- `github.ts` - GitHub analytics

#### Styling

Customize the design using Tailwind CSS classes in:

- `src/styles/global.css`
- Component files in `src/components/`

## Project Structure

```
Dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BlogFilters.tsx
│   │   ├── ProjectFilters.tsx
│   │   ├── GitHubStats.astro
│   │   ├── LeetCodeStats.astro
│   │   └── ...
│   ├── data/               # Data fetching and types
│   │   ├── projects.ts
│   │   ├── blog.ts
│   │   ├── leetcode.ts
│   │   └── github.ts
│   ├── layouts/            # Page layouts
│   │   └── Layout.astro
│   ├── pages/              # Astro pages
│   │   ├── index.astro     # Main dashboard
│   │   ├── blog/[slug].astro
│   │   └── projects/[slug].astro
│   ├── styles/             # Global styles
│   │   └── global.css
│   └── utils/              # Utility functions
│       ├── formatTitle.ts
│       └── slugify.ts
├── public/                 # Static assets
├── astro.config.mjs        # Astro configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json
```

## Key Components

### Dashboard Sections

1. **Projects Tab**

   - Displays GitHub repositories with filtering
   - Search by title, description, or technologies
   - Links to live sites and GitHub repositories

2. **Blog Tab**

   - Technical articles and thoughts
   - Category-based filtering
   - Full-text search functionality

3. **LeetCode Tab**

   - Problem-solving statistics
   - Contest participation history
   - Achievement badges and rankings

4. **GitHub Tab**

   - Contribution analytics
   - Top programming languages
   - Pull requests and repository stats

5. **Resume Tab**

   - Professional experience
   - Skills and certifications
   - Downloadable resume

6. **Community Tab**
   - Social media links
   - Professional networking
   - Community engagement

### Advanced Features

- **Fuzzy Search**: Intelligent search with typo tolerance
- **Real-time Filtering**: Instant results as you type
- **Responsive Design**: Optimized for all screen sizes
- **Performance Optimized**: Fast loading with static generation
- **SEO Friendly**: Built-in sitemap and meta tags

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure build settings**:
   - Build Command: `bun run build`
   - Output Directory: `dist`
3. **Deploy automatically** on every push

### Other Platforms

The dashboard can be deployed to any static hosting platform:

- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**
- **AWS S3 + CloudFront**

## Development

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build

# Astro CLI
bun run astro        # Run Astro CLI commands
```

## Performance

- **SEO**: Proper Sitemap generation and static pages
- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for user experience
- **Bundle Size**: Minimal JavaScript bundle
- **Loading Speed**: Sub-second initial load times

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For questions or support, please open an issue or reach out via the contact information in the dashboard.
