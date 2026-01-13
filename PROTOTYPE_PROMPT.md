# Portfolio Prototype - Build Instructions

## Objective
Create a basic React prototype with all sections visible to validate structure and design direction.

---

## Setup Commands

```bash
cd D:\Projects\Portfolio
npm create vite@latest . -- --template react-ts
npm install
npm install tailwindcss @tailwindcss/vite framer-motion lucide-react react-router-dom
```

---

## Requirements

### 1. Tailwind Configuration
- Use Tailwind v4 with Vite plugin
- Dark theme as default
- Custom colors:
  - Background: `#0a0a0a` (darkest), `#121212` (cards)
  - Accent: `#d4a853` (amber)
  - Text: `#e5e5e5` (primary), `#888888` (secondary)

### 2. Sections to Build (All Placeholder Content OK)

**Hero Section**
- Full viewport height
- Placeholder background (solid dark or gradient for now)
- "Jan Wilhelm" as main heading
- Tagline: "Building digital experiences & capturing moments"
- Subtle scroll indicator at bottom

**About Section**
- Brief intro paragraph (placeholder text fine)
- Simple, clean layout

**Projects Section**
- Two project cards: Lutem and SQL Scrolls
- Each card shows: Title, description, tech tags, links
- Dark card background with subtle border

**Skills/Experience Section**
- Tech stack as visual pills/badges
- Simple timeline for education and work
- Keep it minimal for prototype

**Photography Section**
- Grid of placeholder boxes (6-9 items)
- Aspect ratio maintained
- No lightbox yet, just layout

**Contact Section**
- Simple centered layout
- Placeholder icons for: Email, LinkedIn, GitHub
- Footer with copyright

### 3. Navigation
- Fixed navbar with section links
- Smooth scroll to sections on click
- Minimal styling (logo/name + nav links)

### 4. Animations (Keep Simple)
- Fade-in on scroll for sections (Framer Motion)
- Hover effects on cards and buttons
- Nothing fancy yet

---

## File Structure to Create

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   ├── Photography.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## Design Notes

- **Font:** Use Inter from Google Fonts (or system sans-serif fallback)
- **Spacing:** Generous padding between sections (py-20 or more)
- **Cards:** Rounded corners (rounded-xl), subtle shadows
- **Accent usage:** Links, buttons, highlights only - not everywhere

---

## What We're NOT Doing Yet

- No actual photos (placeholders only)
- No contact form functionality
- No lightbox/gallery modal
- No responsive fine-tuning (basic mobile OK)
- No deployment

---

## Success Criteria

After running `npm run dev`, we should see:
1. All 6 sections visible on scroll
2. Dark theme applied consistently
3. Navbar navigation works (smooth scroll)
4. Cards look presentable
5. Overall vibe matches: dark, moody, professional

---

## Notes for AI Assistant

- Use Context7 MCP for React/Tailwind/Framer Motion documentation
- Desktop Commander for all file operations
- Keep components simple and functional
- Placeholder content is fine - we'll refine later
- If something looks off, flag it for discussion rather than over-engineering
