# UI/UX Enhancement Rules for Intern Community Hub

## Purpose

Quy t này cungúc các nguyên t và h d ng cho vi c c i thi n và nâng c p giao di n ng i dùng (UI/UX) cho d án Intern Community Hub, m t s n t n ng cho TD developer community.

---

## Project Context

**Tech Stack:** Next.js 15 + TypeScript + Tailwind CSS + Prisma
**Design System:** Tailwind CSS utility-first approach
**Target Users:** TD developers, interns, maintainers
**Platform:** Web application with responsive design

---

## Guiding Principles

### 1. Developer Experience First
- Code must be maintainable by other developers
- Follow existing patterns in the codebase
- Document complex interactions

### 2. Performance Matters
- Optimize for Core Web Vitals
- Use Next.js built-in optimizations
- Lazy load heavy components

### 3. Accessibility is Non-negotiable
- Follow WCAG 2.1 AA standards
- Test with screen readers
- Ensure keyboard navigation

---

## Design System Rules

### Colors (Tailwind Variables)
```css
/* Primary */
--color-primary: blue-600
--color-primary-hover: blue-700
--color-primary-light: blue-50

/* Semantic */
--color-success: green-600
--color-warning: yellow-600
--color-error: red-600
--color-neutral: gray-600
```

### Typography Scale
- **Headings:** `text-2xl` (H1), `text-xl` (H2), `text-lg` (H3)
- **Body:** `text-sm` (default), `text-xs` (small)
- **Font:** Geist (system font stack)
- **Line Height:** `leading-6` (body), `leading-tight` (headings)

### Spacing System
- Base unit: 4px (Tailwind's default)
- Common: `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Component spacing: `space-y-4`, `space-y-6`
- Section spacing: `space-y-8`, `space-y-12`

---

## Component Guidelines

### 1. Buttons
```tsx
// Primary Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
  Action
</button>

// Secondary Button  
<button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
  Secondary
</button>

// Icon Button
<button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Action">
  <Icon />
</button>
```

**Rules:**
- Always have hover state with `transition-colors`
- Primary buttons use blue-600
- Include `aria-label` for icon-only buttons
- Use `disabled:opacity-50` for disabled state

### 2. Forms
```tsx
// Input Field
<div className="space-y-2">
  <label htmlFor="field" className="block text-sm font-medium text-gray-700">
    Label
  </label>
  <input
    id="field"
    type="text"
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  />
  {error && <p className="text-xs text-red-600">{error}</p>}
</div>
```

**Rules:**
- Always associate label with input using `htmlFor`
- Use consistent focus states (`focus:border-blue-500 focus:ring-1 focus:ring-blue-500`)
- Show error messages below inputs
- Use `space-y-2` for vertical spacing

### 3. Cards
```tsx
<article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <p className="mt-2 text-sm text-gray-600">Description</p>
</article>
```

**Rules:**
- Use `rounded-xl` for modern look
- Add `shadow-sm` with `hover:shadow-md` for depth
- Include `transition-shadow` for smooth hover
- Use semantic HTML (`<article>`, `<section>`)

---

## Layout Patterns

### 1. Page Structure
```tsx
<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
  <div className="space-y-6">
    {/* Page content */}
  </div>
</main>
```

### 2. Grid System
```tsx
// Responsive Grid
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>

// Flex Layout
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  {/* Content */}
</div>
```

### 3. Navigation
```tsx
<nav className="flex items-center gap-4">
  <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
    Back
  </Link>
</nav>
```

---

## UX Patterns

### 1. Loading States
```tsx
// Button Loading
<button disabled={isLoading} className="...">
  {isLoading ? (
    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
  ) : (
    'Submit'
  )}
</button>

// Skeleton Loading
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### 2. Feedback Messages
```tsx
// Success
<div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
  Operation completed successfully
</div>

// Error
<div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
  Something went wrong
</div>
```

### 3. Empty States
```tsx
<div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
  <p className="text-gray-500">No items found</p>
  <button className="mt-4 text-sm text-blue-600 hover:underline">
    Add first item
  </button>
</div>
```

---

## Accessibility Rules

### 1. Semantic HTML
- Use proper heading hierarchy (`h1` > `h2` > `h3`)
- Use `<button>` for actions, `<a>` for navigation
- Use `<main>`, `<nav>`, `<section>`, `<article>` appropriately

### 2. ARIA Attributes
```tsx
// Icon Buttons
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Form Validation
<input aria-invalid={hasError} aria-describedby="error-message" />
<p id="error-message" className="text-red-600">{error}</p>
```

### 3. Keyboard Navigation
- Ensure all interactive elements are focusable
- Use `tabindex` appropriately
- Test with Tab key navigation

---

## Performance Guidelines

### 1. Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### 2. Code Splitting
```tsx
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
})
```

### 3. Bundle Optimization
- Use Next.js built-in optimization
- Avoid large libraries for simple functionality
- Use tree-shakable imports

---

## Responsive Design

### Breakpoints (Tailwind Default)
- `sm`: 640px (tablet)
- `md`: 768px (tablet landscape)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Mobile-First Approach
```tsx
// Base styles (mobile)
<div className="flex flex-col gap-4">
  {/* Content */}
</div>

// Desktop overrides
<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
  {/* Content */}
</div>
```

---

## Animation Guidelines

### 1. Transitions
```tsx
// Smooth color transitions
className="transition-colors duration-200 hover:bg-gray-100"

// Smooth transform
className="transition-transform duration-200 hover:scale-105"
```

### 2. Micro-interactions
```tsx
// Button press
className="active:scale-95 transition-transform"

// Loading spinner
className="animate-spin"

// Pulse effect
className="animate-pulse"
```

### 3. Page Transitions
- Use Next.js `<Link>` for automatic page transitions
- Add `transition-all duration-300` for layout shifts
- Avoid jarring animations

---

## Code Quality Rules

### 1. Component Structure
```tsx
// Good component structure
interface ComponentProps {
  // Define props clearly
}

export function Component({ prop }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

### 2. Naming Conventions
- Components: PascalCase (`ModuleCard`)
- Props: camelCase (`isLoading`)
- Classes: kebab-case in CSS, camelCase in JSX
- Files: kebab-case (`module-card.tsx`)

### 3. Reusability
- Extract common patterns into reusable components
- Use composition over inheritance
- Keep components focused and single-purpose

---

## Testing Guidelines

### 1. Visual Testing
- Test on multiple screen sizes
- Test with different browsers
- Test with high contrast mode

### 2. Accessibility Testing
- Use screen reader (NVDA, VoiceOver)
- Test keyboard navigation
- Check color contrast with tools

### 3. Performance Testing
- Use Lighthouse for performance scores
- Test Core Web Vitals
- Monitor bundle size

---

## What to Avoid

### Don't:
- Break existing functionality without reason
- Use inline styles extensively
- Hard-code colors and spacing
- Ignore accessibility requirements
- Create overly complex animations
- Use `!important` in CSS

### Do:
- Follow existing patterns
- Test thoroughly
- Document complex changes
- Consider performance impact
- Maintain backward compatibility
- Write clean, readable code

---

## Review Process

### Before Submitting Changes:
1. **Code Review**: Check for consistency with existing patterns
2. **Design Review**: Ensure visual consistency
3. **Accessibility Review**: Test with screen readers
4. **Performance Review**: Check impact on load times
5. **Mobile Review**: Test on various screen sizes

### PR Requirements:
- Include screenshots for visual changes
- Explain design decisions
- Test on multiple devices
- Update documentation if needed

---

## Resources

### Design Inspiration
- [Tailwind UI](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)
- [Radix UI](https://www.radix-ui.com/)

### Accessibility Tools
- [WAVE](https://wave.webaim.org/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Performance Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://bundlephobia.com/)

---

*This document is a living guide. Update it as the project evolves and new patterns emerge.*
