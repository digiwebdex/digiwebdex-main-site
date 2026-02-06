

# Digiwebdex - SaaS + Service Marketplace

## Project Overview
A modern, bilingual (Bangla/English) service marketplace website with a clean, minimal design featuring subtle glassmorphism effects. Built with React + Vite + Tailwind CSS + Supabase.

---

## Phase 1: Foundation & Core Pages

### 1.1 Design System & Layout
- **Clean & Minimal theme** with subtle glassmorphism cards and light gradients
- Dark/Light mode toggle with smooth transitions
- Mobile-first responsive design with modern micro-animations
- Consistent typography with Bangla font support (Noto Sans Bengali)

### 1.2 Multi-language Architecture
- URL-based language routing (`/bn/*` and `/en/*`)
- Default language: Bangla
- Language switcher in navigation bar
- Translation system for all content

### 1.3 Core Navigation & Layout
- Responsive header with logo, navigation menu, language switcher, and theme toggle
- Sticky navigation with blur effect
- Mobile hamburger menu with slide-out panel
- Footer with contact info, quick links, and social media

---

## Phase 2: Public Pages

### 2.1 Home Page
- Hero section with animated headline and call-to-action
- Featured services carousel
- Statistics/trust badges section
- Testimonials slider
- Latest blog posts preview
- Newsletter signup

### 2.2 Service Pages
- **Domain & Hosting** - Plans, features, domain search ready structure
- **Web Development** - Portfolio showcase, process timeline, packages
- **Software Development** - Technologies, case studies, custom quote form
- **Digital Marketing** - Services breakdown, results showcase

### 2.3 Pricing Page
- Interactive pricing tables with toggle (monthly/yearly)
- Feature comparison matrix
- Popular plan highlight
- Coupon code input field ready
- Call-to-action buttons

### 2.4 Order System
- Service selection flow
- Package customization
- Order summary with price breakdown
- Client information form
- Payment integration ready structure (placeholder for gateway)
- Order confirmation page

### 2.5 Additional Pages
- **Contact** - Form with validation, map placeholder, contact info
- **About** - Team section, company story, values
- **Blog** - Blog listing with categories, search, individual post pages

---

## Phase 3: Authentication & User Roles

### 3.1 Authentication System
- Email/password signup and login
- Password reset flow
- Email verification ready
- Role-based access control (Admin, Staff, Client)

### 3.2 Client Dashboard
- Order history with status tracking
- Active services overview
- Invoice list with PDF download
- Profile management
- Support ticket placeholder

---

## Phase 4: Admin Panel

### 4.1 Dashboard
- Overview statistics (orders, revenue, users)
- Recent orders widget
- Quick actions

### 4.2 Service & Pricing Management
- CRUD for services with rich text descriptions
- Pricing plans management
- Feature toggles and customization
- Service categories

### 4.3 Order & Invoice Management
- Orders list with filters and search
- Order status management
- Auto-generated invoices (PDF ready structure)
- Payment status tracking

### 4.4 Blog & SEO Management
- Blog post editor with rich text
- Category and tag management
- Dynamic meta titles and descriptions per page
- SEO settings panel

### 4.5 User Management
- User list with role badges
- Role assignment (Admin, Staff, Client)
- User activity overview

---

## Phase 5: Advanced Features (Structure Ready)

### 5.1 Notification System Structure
- Email notification templates
- SMS ready integration points
- WhatsApp ready integration points
- In-app notification system

### 5.2 Coupon & Affiliate System
- Coupon creation and management
- Affiliate tracking database structure
- Referral link generation ready

### 5.3 SEO & Performance
- Dynamic OpenGraph meta tags
- Schema markup structure
- Sitemap generation approach
- Image optimization with lazy loading

---

## Database Schema Overview

**Core Tables:**
- `users` (via Supabase Auth) + `profiles`
- `user_roles` (admin, staff, client)
- `services` (categories, descriptions, images)
- `pricing_plans` (linked to services)
- `orders` (user orders with status)
- `invoices` (generated from orders)
- `blog_posts` (with categories)
- `coupons`
- `seo_settings` (per-page meta data)

---

## Technical Highlights

- **Supabase** for authentication, database, and real-time features
- **Row-Level Security** for data protection
- **Responsive design** tested on all device sizes
- **Accessibility** compliance with ARIA labels
- **Clean code architecture** with reusable components

