# Authentication Integration Copilot Instructions

This document provides guidance for working with the authentication system and landing page implementation added in commit `606cbca`.

## Overview

This commit introduces a complete authentication flow with login and signup pages, plus a comprehensive marketing landing page with animations. The implementation strictly follows the existing React/TypeScript stack and Untitled UI component library.

## Authentication System

### Pages Structure
```
src/pages/
├── login.tsx          # Login page wrapper with animations
├── signup.tsx         # Signup page wrapper with animations
├── landing.tsx        # Marketing landing page
└── ...
```

### Components Used
- **Login**: `LoginSplitCarousel` from `@/components/shared-assets/login/`
- **Signup**: `SignupSplitCarousel` from `@/components/shared-assets/signup/`
- **Animations**: Motion library with fade-in transitions (0.5s duration)

### Routing Configuration
Located in `src/main.tsx`:
```tsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/home" element={<HomeScreen />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Component Architecture

### Authentication Components

#### LoginSplitCarousel
- **Location**: `src/components/shared-assets/login/login-split-carousel.tsx`
- **Features**: Email/password form, Google OAuth, forgot password, remember me
- **Layout**: Split-screen with form on left, carousel on right
- **Navigation**: Link to signup page

#### SignupSplitCarousel
- **Location**: `src/components/shared-assets/signup/signup-split-carousel.tsx`
- **Features**: First/last name, email, password, terms agreement, Google OAuth
- **Layout**: Matches login design for consistency
- **Navigation**: Link to login page

### Page Components Pattern
All authentication pages follow this pattern:
```tsx
import { motion } from "motion/react";
import { ComponentName } from "@/components/shared-assets/...";

export const PageName = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <ComponentName />
        </motion.div>
    );
};
```

## Landing Page Implementation

### Structure
The landing page includes comprehensive marketing sections:
- **Hero Section**: Main call-to-action with animated buttons
- **Demo Video**: Floating animation with play button
- **About Section**: Company information with animated stats
- **Features**: Service highlights with icon animations
- **Testimonials**: Customer reviews with avatar integration
- **Pricing**: Plans with hover effects
- **FAQ**: Expandable questions with animations
- **CTA**: Final conversion section
- **Newsletter**: Email signup
- **Footer**: Complete site navigation

### Animation Patterns
Using Motion library for professional interactions:
```tsx
// Staggered animations
<motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
>

// Hover effects
<motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ duration: 0.2 }}
>

// Interactive buttons
<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    animate={{ boxShadow: [...] }}
>
```

## Navigation Integration

### Header Component Updates
Location: `src/components/marketing/header-navigation/header.tsx`

**Desktop Navigation**:
```tsx
<Button color="secondary" size={isFloating ? "md" : "lg"} href="/login">
    Log in
</Button>
<Button color="primary" size={isFloating ? "md" : "lg"} href="/signup">
    Sign up
</Button>
```

**Mobile Navigation**:
```tsx
<Button size="lg" href="/signup">Sign up</Button>
<Button color="secondary" size="lg" href="/login">
    Log in
</Button>
```

## Theme System

### Theme Toggle Integration
- **Component**: `ThemeToggle` from `@/components/base/buttons/theme-toggle`
- **Location**: Header navigation (desktop and mobile)
- **States**: Light, dark, system
- **Persistence**: localStorage with `theme-provider`

### Theme Provider
- **Location**: `src/providers/theme-provider.tsx`
- **Wraps**: Entire application in `main.tsx`
- **Features**: Automatic system theme detection, persistence

## Development Patterns

### Adding New Auth Pages
1. Create page component in `src/pages/`
2. Add Motion wrapper with fade-in animation
3. Import and use existing UI components
4. Add route to `main.tsx`
5. Update navigation links if needed

### Component Library Usage
Always use components from the established library:
```tsx
// UI Components
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Form } from "@/components/base/form/form";

// Marketing Components
import { Header } from "@/components/marketing/header-navigation/header";
import { CTAAbstractImagesBrand } from "@/components/marketing/cta/...";
```

### Animation Guidelines
- **Page Transitions**: 0.5s fade-in for consistency
- **Scroll Animations**: Use `whileInView` for sections
- **Interactive Elements**: Subtle hover/tap effects
- **Performance**: Use `motion` components sparingly, prefer CSS for simple animations

## Form Handling

### Authentication Forms
All forms follow this pattern:
```tsx
<Form
    onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        console.log("Form data:", data);
        // Handle submission
    }}
    className="flex flex-col gap-6"
>
    {/* Form fields */}
</Form>
```

### Validation
- **Required Fields**: Use `isRequired` prop on inputs
- **Custom Validation**: Use `validate` prop for complex rules
- **Error Handling**: Built into form components

## Styling Conventions

### Tailwind CSS Usage
- **Responsive Design**: Mobile-first with `md:`, `lg:` prefixes
- **Color System**: Use semantic tokens (`primary`, `secondary`, `tertiary`)
- **Spacing**: Consistent scale with gap classes
- **Typography**: Design system typography classes

### Component Styling
```tsx
// Consistent button styling
<Button 
    color="primary|secondary|link-color" 
    size="sm|md|lg"
    href="/path" // for navigation
>

// Form layout
<div className="flex flex-col gap-5">
    <Input label="..." name="..." />
</div>
```

## Testing Considerations

### Route Testing
- Verify all routes render correctly
- Test navigation between pages
- Confirm animations don't break functionality

### Form Testing
- Test form submission handling
- Verify validation works
- Test social auth buttons

### Responsive Testing
- Mobile menu functionality
- Theme toggle on all devices
- Animation performance on slower devices

## Performance Notes

### Code Splitting
- Pages are already split at route level
- Motion components load on demand
- UI components are tree-shakeable

### Animation Performance
- Use `transform` properties for animations
- Avoid animating expensive properties
- Use `will-change` sparingly

## Security Considerations

### Form Data
- Currently logs to console (development only)
- Replace with secure API calls in production
- Validate on both client and server

### Authentication
- Social auth buttons are UI-only
- Implement actual OAuth flows
- Add proper session management

## Next Steps for Development

1. **Backend Integration**: Connect forms to FastAPI authentication endpoints
2. **State Management**: Add auth state management (user context)
3. **Protected Routes**: Implement route guards for authenticated pages
4. **Error Handling**: Add proper error states and messages
5. **Testing**: Add comprehensive test coverage

## Common Patterns to Follow

### New Marketing Sections
```tsx
// Section wrapper with scroll animation
<motion.section
    className="py-16 px-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
>
    {/* Section content */}
</motion.section>
```

### Interactive Cards
```tsx
<motion.div
    className="card-styles"
    whileHover={{ y: -5, boxShadow: "..." }}
    transition={{ duration: 0.2 }}
>
    {/* Card content */}
</motion.div>
```

This authentication system provides a solid foundation for user management while maintaining the high-quality design and user experience standards of the Untitled UI component library.