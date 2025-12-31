# PollNaija - Nigeria's #1 Public Opinion & Polling Platform

PollNaija is a modern, realtime polling platform built specifically for Nigerians. Create polls, vote, and see what Naija is thinking - all in realtime with no refresh needed!

## ✨ Features

### 🚀 **Realtime Everything**
- **Polls**: New polls appear instantly in feed/categories/trending
- **Votes**: Vote counts and percentages update live everywhere
- **Comments**: New comments and replies appear instantly
- **Reports**: Admin panel shows new reports in realtime

### 🎨 **Beautiful UI/UX**
- Consistent green-white-green Nigerian theme
- Smooth animations and transitions
- Fully responsive (mobile-first design)
- Dark mode toggle with next-themes
- Accessibility-first with ARIA labels and keyboard navigation

### 🔐 **Secure Authentication**
- Phone/SMS OTP authentication (Nigerian optimized)
- Email magic link fallback
- Automatic logout with session clearing
- Admin panel for content moderation

### 📱 **PWA Ready**
- Offline-capable with service worker
- Installable on mobile devices
- Native app-like experience

### 🌍 **Multi-language Support**
- English and Nigerian Pidgin
- Easy to extend with more languages

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State**: TanStack Query + React Context
- **Animations**: Framer Motion + Tailwind CSS
- **PWA**: Vite PWA Plugin
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd naijapulse

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The `vercel.json` is already configured for optimal deployment.

## 🎯 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin panel components
│   ├── auth/           # Authentication modals
│   ├── comments/       # Comment system
│   ├── home/           # Homepage sections
│   ├── layout/         # Layout components (Header, Footer)
│   ├── polls/          # Poll-related components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
│   ├── useRealtime*.ts # Realtime subscription hooks
│   └── use*.ts         # Other utility hooks
├── pages/              # Route components
├── integrations/       # External service integrations
├── i18n/               # Internationalization files
└── lib/                # Utility functions
```

## 🔄 Realtime Implementation

### Custom Hooks
- `useRealtimeVotes()` - Global and per-poll vote subscriptions
- `useRealtimeComments()` - Comment subscriptions with threading
- `useRealtimeReports()` - Admin report monitoring
- `useRealtimeNotifications()` - Global activity toasts

### Database Schema
- **Polls**: Questions, options, metadata
- **Votes**: User votes with option indices
- **Comments**: Threaded discussions
- **Reports**: Content moderation system
- **Profiles**: User profiles with admin flags

## 🎨 Design System

### Colors
- **Primary**: Nigerian Green (#009A44)
- **Secondary**: Light green variations
- **Accent**: Gold accents
- **Dark Mode**: Carefully crafted dark theme

### Typography
- **Headings**: Poppins (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Pidgin**: Special styling for Nigerian Pidgin

### Animations
- Smooth page transitions
- Loading skeletons
- Hover effects and micro-interactions
- Staggered content reveals

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run build        # Build for production
vercel --prod        # Deploy to Vercel
```

## 📊 Performance & SEO

- **SEO**: Dynamic meta tags, Open Graph, Twitter Cards
- **Performance**: Code splitting, lazy loading, optimized images
- **PWA**: Service worker, offline caching, install prompts
- **Analytics**: Google Analytics integration (GA_MEASUREMENT_ID needed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is built with modern web technologies and is ready for production deployment.

---

**Built with ❤️ for Nigeria** 🇳🇬
