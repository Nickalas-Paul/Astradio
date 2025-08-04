# 🎨 UI Designer Onboarding Guide

## Welcome to Astradio! 🎵

This guide will help you understand the project structure, design system, and key areas where your expertise is most valuable.

## 📋 Project Overview

**Astradio** transforms astrological charts into personalized musical experiences. Users can:
- Generate astrological charts from birth data
- Create unique musical compositions based on planetary positions
- Export and share their musical sessions
- Compare multiple charts in overlay mode
- Experiment with interactive sandbox features

## 🏗️ Project Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js
- **Audio**: Tone.js
- **State Management**: Zustand

### Backend Stack
- **Runtime**: Node.js with Express
- **Database**: SQLite
- **Authentication**: JWT
- **API**: RESTful endpoints

## 📁 Key Frontend Files for Designers

### Core Components
```
apps/web/src/components/
├── AstrologicalWheel.tsx          # Main chart visualization
├── ToneAudioControls.tsx          # Audio playback controls
├── BirthDataForm.tsx              # User input form
├── ExportControls.tsx             # Export/share functionality
├── ChartLayoutWrapper.tsx         # Layout management
├── UnifiedAudioControls.tsx       # Enhanced audio controls
├── GenreDropdown.tsx              # Music genre selection
└── SandboxComposer.tsx            # Interactive sandbox
```

### Pages
```
apps/web/src/app/
├── page.tsx                       # Landing page
├── chart/page.tsx                 # Chart generation
├── overlay/page.tsx               # Dual chart comparison
└── sandbox/page.tsx               # Interactive sandbox
```

### Styling
```
apps/web/src/
├── globals.css                    # Global styles
├── tailwind.config.js             # Tailwind configuration
└── components/ui/                 # Reusable UI components
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: #6366f1;      /* Indigo */
--secondary: #8b5cf6;    /* Violet */
--accent: #06b6d4;       /* Cyan */

/* Background Colors */
--bg-primary: #ffffff;    /* White */
--bg-secondary: #f8fafc; /* Gray-50 */
--bg-dark: #0f172a;      /* Slate-900 */

/* Text Colors */
--text-primary: #1e293b; /* Slate-800 */
--text-secondary: #64748b; /* Slate-500 */
--text-muted: #94a3b8;   /* Slate-400 */

/* Status Colors */
--success: #10b981;       /* Emerald */
--warning: #f59e0b;       /* Amber */
--error: #ef4444;         /* Red */
```

### Typography
```css
/* Headings */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
```

### Spacing System
```css
/* Based on Tailwind's spacing scale */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
```

## 🎯 Key Design Areas to Focus On

### 1. Landing Page Experience
**Current State**: Auto-playing chart with today's astrological data
**Design Opportunities**:
- Hero section with clear value proposition
- Call-to-action buttons for chart generation
- Visual hierarchy for feature highlights
- Loading states and animations

**Files to Review**:
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/AstrologicalWheel.tsx`

### 2. Chart Generation Flow
**Current State**: Form-based birth data input
**Design Opportunities**:
- Streamlined form design
- Progress indicators
- Success/error states
- Mobile-optimized input fields

**Files to Review**:
- `apps/web/src/app/chart/page.tsx`
- `apps/web/src/components/BirthDataForm.tsx`

### 3. Audio Controls Interface
**Current State**: Basic play/pause and volume controls
**Design Opportunities**:
- Intuitive audio visualization
- Genre selection interface
- Advanced audio controls
- Real-time audio feedback

**Files to Review**:
- `apps/web/src/components/ToneAudioControls.tsx`
- `apps/web/src/components/UnifiedAudioControls.tsx`
- `apps/web/src/components/GenreDropdown.tsx`

### 4. Export and Share Features
**Current State**: Basic export functionality
**Design Opportunities**:
- Share dialog design
- Export format selection
- Social sharing integration
- Success confirmation states

**Files to Review**:
- `apps/web/src/components/ExportControls.tsx`

### 5. Overlay Mode Interface
**Current State**: Dual chart comparison
**Design Opportunities**:
- Split-screen layout optimization
- Chart switching controls
- Comparison highlighting
- Responsive design for different screen sizes

**Files to Review**:
- `apps/web/src/app/overlay/page.tsx`

### 6. Sandbox Mode Interface
**Current State**: Interactive chart manipulation
**Design Opportunities**:
- Tool palette design
- Canvas interaction feedback
- Control panel layout
- Real-time preview updates

**Files to Review**:
- `apps/web/src/app/sandbox/page.tsx`
- `apps/web/src/components/SandboxComposer.tsx`

## 🔧 Development Setup for Designers

### Prerequisites
- Node.js 18+ installed
- Git for version control
- VS Code (recommended)
- Browser developer tools

### Local Development
```bash
# Clone the repository
git clone [repository-url]
cd Astradio

# Install dependencies
npm install

# Build packages
cd packages/types && npm run build && cd ../..
cd packages/astro-core && npm run build && cd ../..
cd packages/audio-mappings && npm run build && cd ../..

# Start the development server
cd apps/web
npm run dev
```

### Environment Setup
Create `.env.local` in `apps/web/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎨 Design Tools Integration

### Figma Integration
- **Design System**: Create reusable components
- **Prototypes**: Interactive prototypes for user testing
- **Collaboration**: Share designs with development team
- **Handoff**: Export assets and specifications

### Design Tokens
```json
{
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#06b6d4"
  },
  "typography": {
    "fontFamily": {
      "heading": "Inter",
      "body": "Inter"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem"
  }
}
```

## 📱 Responsive Design Guidelines

### Breakpoints
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2XL devices */
```

### Component Adaptations
- **Mobile**: Stacked layouts, touch-friendly buttons
- **Tablet**: Side-by-side layouts, optimized touch targets
- **Desktop**: Full feature set, hover states, keyboard navigation

## ♿ Accessibility Guidelines

### WCAG 2.1 Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Clear focus states for all elements

### Implementation Checklist
- [ ] Semantic HTML structure
- [ ] ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Color contrast compliance
- [ ] Alternative text for images
- [ ] Focus management

## 🎵 Audio Design Considerations

### Visual Audio Feedback
- **Waveform Visualization**: Real-time audio representation
- **Volume Indicators**: Visual feedback for audio levels
- **Playback States**: Clear play/pause/loading states
- **Genre Indicators**: Visual cues for different music styles

### Audio Controls Design
- **Intuitive Layout**: Logical placement of controls
- **Touch-Friendly**: Large touch targets for mobile
- **Visual Hierarchy**: Important controls prominently placed
- **State Feedback**: Clear indication of current audio state

## 📊 User Experience Metrics

### Key Performance Indicators
- **Time to First Chart**: < 30 seconds
- **Audio Generation Time**: < 5 seconds
- **Export Success Rate**: > 95%
- **Mobile Usability Score**: > 90%

### User Journey Optimization
1. **Landing Page**: Clear value proposition and CTA
2. **Chart Generation**: Streamlined form flow
3. **Audio Experience**: Intuitive controls and feedback
4. **Export/Share**: Easy sharing options
5. **Advanced Features**: Discoverable overlay and sandbox modes

## 🔄 Design Iteration Process

### Feedback Collection
- **User Testing**: Regular usability testing sessions
- **Analytics**: Track user behavior and conversion rates
- **A/B Testing**: Compare design variations
- **Stakeholder Reviews**: Regular design reviews with team

### Design System Evolution
- **Component Library**: Maintain and expand reusable components
- **Design Tokens**: Keep design tokens updated
- **Documentation**: Maintain design documentation
- **Version Control**: Track design system changes

## 🚀 Deployment Preparation

### Design Assets
- [ ] Export all design assets in appropriate formats
- [ ] Optimize images and icons for web
- [ ] Create design specifications for developers
- [ ] Prepare design handoff documentation

### Quality Assurance
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit
- [ ] Performance optimization review

## 📞 Communication Channels

### Team Collaboration
- **Design Reviews**: Weekly design review sessions
- **Developer Handoff**: Clear specifications and assets
- **User Testing**: Regular feedback collection
- **Stakeholder Updates**: Progress reports and milestone reviews

### Tools and Platforms
- **Figma**: Design collaboration and prototyping
- **GitHub**: Code and issue tracking
- **Slack/Teams**: Team communication
- **Notion**: Documentation and project management

---

**🎨 Ready to Design!**

This guide provides the foundation for understanding Astradio's design system and key areas for improvement. Focus on creating intuitive, accessible, and visually appealing user experiences that enhance the astrological music generation workflow. 