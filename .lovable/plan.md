

# ESG Intelligence Platform — Dark Theme Upgrade Plan

## Overview
Transform the entire platform from a light SaaS theme into a dark, futuristic intelligence interface inspired by Bloomberg Terminal / Palantir Foundry. All existing features and sections are preserved — only the visual layer and layout density change, plus 3 new modules are added.

## 1. Dark Theme Foundation (`src/index.css`)

Rewrite all CSS custom properties to a dark palette:
- Background: deep charcoal (`220 25% 6%`) → midnight blue tones
- Cards: translucent glassmorphism (`220 20% 12% / 0.7`) with `backdrop-filter: blur(16px)`
- Borders: subtle cyan/green glow (`142 50% 40% / 0.15`)
- Text: cool whites and blue-grays
- Accent colors: neon green (`142 70% 50%`), cyan (`180 80% 55%`), violet (`270 70% 60%`)
- Sidebar: darker with gradient glow accents

Add new utility classes:
- `.glass-card` — glassmorphism card with blur + border glow
- `.glow-border` — animated soft glow on hover
- `.neon-text` — text-shadow glow for key metrics
- Animated grid/particle background via CSS (`radial-gradient` dots + subtle animation)

## 2. Sidebar Upgrade (`DashboardSidebar.tsx`)

- Dark gradient background with subtle scan-line texture
- Active item: neon green left border + glow icon
- Hover: soft cyan highlight
- Logo gets a subtle glow effect
- Add a "LIVE" pulsing indicator dot near the logo

## 3. Homepage Layout Restructure (`HomePage.tsx`)

Reorganize into the requested Command Center tiers while keeping all existing components:

**Top Row (3 cols):** ESG Score | Emission Trends (NEW) | Sustainability Goals
**Middle Row (3 cols):** Supply Chain Intelligence (NEW) | Carbon Cost Simulator (NEW) | Global Impact Map  
**Bottom Row (3 cols):** Risk Network Graph (reuse RiskInsightFeed, enhanced) | Attention Panel | Quick Actions

Add an animated particle/grid CSS background to the page container.

## 4. Component Visual Upgrades (all existing files)

### ESGScoreOverview.tsx
- Dark glass card background
- Score ring: neon green glow stroke with animated pulse on load
- Pillar bars: gradient fills with glow
- Add animated number counter effect

### ESGRadarChart.tsx
- Dark theme: transparent grid, cyan stroke, neon fill
- Glowing data points

### RiskInsightFeed.tsx
- Dark severity cards with glowing left borders
- Pulsing dot for critical alerts
- Severity colors: neon red/amber/green

### SustainabilityGoals.tsx
- Progress bars with gradient glow fills
- Animated percentage counters

### GlobalImpactMap.tsx
- Dark map background with glowing continent shapes
- Pulsing markers with neon status colors
- Glowing connection lines between nodes

### AttentionPanel.tsx & QuickActions.tsx
- Glass card styling, glow hover effects, neon icon accents

### DashboardContent.tsx
- Dark header bar, glass stat cards with glow borders

## 5. New Components

### `EmissionTrends.tsx`
- Area chart (recharts) showing 12-month emission trend
- Gradient fill under curve, glowing line
- Dummy data: monthly CO2 values with downward trend
- Mini stat badges: "Peak", "Current", "Target"

### `SupplyChainIntelligence.tsx`
- Animated donut chart of supplier ESG distribution
- Supplier ranking list (3-5 dummy suppliers with scores)
- Animated compliance badges (green/yellow/red with glow)
- Hover reveals metric tooltip

### `CarbonCostSimulator.tsx`
- Interactive carbon price slider (using Radix Slider)
- Animated cost counter (motion number)
- Mini line chart showing projected costs
- Dummy: 12,400 tons × $90/ton = $1.1M
- Glowing cost indicator that changes color by severity

## 6. Tailwind Config Updates (`tailwind.config.ts`)

- Add `neon-green`, `neon-cyan`, `neon-violet` color tokens
- Add `glow-sm`, `glow-md`, `glow-lg` box-shadow utilities
- Add `pulse-glow` keyframe animation

## Files to Create
- `src/components/home/EmissionTrends.tsx`
- `src/components/home/SupplyChainIntelligence.tsx`
- `src/components/home/CarbonCostSimulator.tsx`

## Files to Edit
- `src/index.css` — full dark theme rewrite
- `tailwind.config.ts` — new tokens and animations
- `src/components/DashboardSidebar.tsx` — dark glow styling
- `src/components/DashboardContent.tsx` — dark theme
- `src/components/home/HomePage.tsx` — new layout grid + new components
- `src/components/home/ESGScoreOverview.tsx` — dark glass + glow ring
- `src/components/home/ESGRadarChart.tsx` — dark chart theme
- `src/components/home/RiskInsightFeed.tsx` — dark severity cards
- `src/components/home/SustainabilityGoals.tsx` — glow progress bars
- `src/components/home/GlobalImpactMap.tsx` — dark map + glow markers
- `src/components/home/AttentionPanel.tsx` — glass cards
- `src/components/home/QuickActions.tsx` — glow hover effects

No features are removed. All existing data structures and interactions are preserved — only enhanced visually.

