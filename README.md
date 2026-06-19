# EcoTrack — Carbon Footprint Awareness Platform
## Challenge: [Challenge 3] Carbon Footprint Awareness Platform

### Chosen Vertical
Individual carbon footprint tracking and reduction through AI-powered personalized insights and gamification.

### Approach and Logic
EcoTrack adopts a 5-category emission model spanning **transport, energy, food, shopping, and waste**. Calculations use official **DEFRA/IPCC 2023 emission coefficients** to ensure scientifically grounded data-rich tracking. 
Personalization is driven by the **Anthropic Claude API (Claude 3.5 Sonnet)**, which contextualizes carbon logs, level progress, and active streaks to suggest highly relevant actions. 
Gamification mechanics reward users with points (XP) for logging entries and completing daily sustainable actions, encouraging habit building through levels, milestone badges, and weekly challenges.

### How the Solution Works
1. **Register**: User creates an account secured by password hashing and synced to InsForge Auth.
2. **Onboard**: A 5-step onboarding wizard collects country context, household size, transport, diet, energy, and shopping habits to calculate baseline footprints.
3. **Calculate**: Interactive tabbed calculators estimate transit, utilities, shopping, and waste emissions on demand.
4. **Track**: Overview dashboard displays daily average metrics, monthly tallies, and trend lines compared to global average benchmarks.
5. **Act**: Completed recommended actions earn XP points and increment active streaks.
6. **Improve**: AI assistant (EcoBot) streams real-time contextual tips to identify top opportunities and roadmap plans.

### Key Features
- **Ticking Global Emission Counter**: Real-time counter on the landing page showing global CO₂ tonnage ticking up.
- **12-Column Responsive Dashboard**: Metrics cards, Recharts Area chart, category Donut breakdown, and gamification trackers.
- **Onboarding Wizard**: Estimates initial baseline footprint to pre-populate charts immediately.
- **Floating AI Advisor**: EcoBot panel with streaming responses, conversation history, and quick prompts.
- **Confetti Rewards**: Celebrates completed daily actions with confetti bursts.
- **Milestone Badges**: Awarded for streaks (3, 7, 30, 100 days) and rank milestones.

### AI Integration
EcoTrack uses the **Anthropic Claude API** with Server-Sent Events (SSE) to stream responses. The system prompts inject the user's weekly carbon totals, top category emissions, current level, and streak count, enabling EcoBot to provide concrete, highly contextual advice.

### Carbon Calculation Methodology
We utilize standard DEFRA/IPCC 2023 factors:
- **Transport**: Petrol car (0.170 kg/km), Diesel (0.163 kg/km), Hybrid (0.105 kg/km), Electric (0.053 kg/km), Bus (0.089 kg/km), Train (0.041 kg/km), Short flight (0.255 kg/km/pax), Long flight (0.195 kg/km/pax).
- **Food**: Beef (6.61 kg/serving), Lamb (5.84 kg/serving), Pork (1.24 kg/serving), Chicken (0.69 kg/serving), Fish (0.49 kg/serving), Eggs (0.25 kg/serving), Dairy (0.34 kg/serving), Plant-based (0.12 kg/serving).
- **Energy**: India grid (0.708 kg/kWh), Gas (2.04 kg/m³), LPG (1.51 kg/L).
- **Shopping**: Clothing (8.0 kg/item), Electronics (150.0 kg/device), Deliveries (1.5 kg/delivery).
- **Waste**: Baseline waste (0.5 kg/kg) offset by recycling (-0.3 kg/kg) and composting (-0.2 kg/kg).

### Assumptions Made
- India electricity grid intensity is used as the default grid factor (0.708 kg CO₂e / kWh).
- Monthly logs are aggregated from weekly averages to generate chart timelines.
- Streaks reset to 1 if consecutive actions are missed beyond a 24-hour grace window.

### Running Locally
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Initialize local SQLite database and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Run Jest tests:
   ```bash
   npm run test
   ```

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn components
- **Database**: SQLite via Prisma ORM
- **Authentication**: NextAuth.js v5 with InsForge SDK synchronization
- **AI Agent**: Anthropic Claude API (claude-3-5-sonnet)
- **Testing**: Jest & React Testing Library
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Rewards**: Canvas Confetti
