# Frontend Copilot Instructions - Full-Stack FastAPI Template

## Project Overview
This is a modern React frontend built with Vite, designed to complement a FastAPI backend. The frontend features a comprehensive design system with Untitled UI components, TailwindCSS styling, and React Router for navigation.

## Architecture Overview

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x with SWC compiler
- **Styling**: TailwindCSS 4.x with PostCSS
- **Routing**: React Router 7.x (browser routing)
- **UI Components**: Custom component library based on React Aria Components
- **Icons**: Untitled UI Icons library
- **Animations**: Motion (Framer Motion successor)
- **Development**: TypeScript ESLint, Prettier with sort imports

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Component library organized by type
│   │   ├── base/           # Core UI primitives (buttons, inputs, etc.)
│   │   ├── foundations/    # Logo, icons, basic elements
│   │   ├── application/    # Complex app components (tables, modals)
│   │   ├── marketing/      # Marketing/landing page components
│   │   └── shared-assets/  # Shared resources
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── providers/          # Context providers (theme, router)
│   ├── styles/             # Global CSS and theme definitions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
└── package.json           # Dependencies and scripts
```

## Component Architecture

### Component Organization
Components are organized into logical categories:

- **`base/`**: Fundamental UI components (buttons, inputs, forms, etc.)
- **`foundations/`**: Basic building blocks (logo, icons, ratings)
- **`application/`**: Complex application components (tables, modals, navigation)
- **`marketing/`**: Landing page and marketing-focused components
- **`shared-assets/`**: Shared resources and assets

### Design System Pattern
Follow the established component patterns:
```tsx
// Import structure
import { Icon } from "@untitledui/icons";
import { BaseComponent } from "@/components/base/component";

// Component definition with TypeScript
interface ComponentProps {
  // Define props with proper types
}

export const Component = ({ prop }: ComponentProps) => {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
};
```

### Styling Conventions
- Use TailwindCSS utility classes exclusively
- Follow the established color system (primary, secondary, tertiary)
- Use responsive design patterns with mobile-first approach
- Leverage TailwindCSS typography plugin for text styles

## Development Patterns

### Routing
The app uses React Router with a simple structure:
```tsx
// In main.tsx
<BrowserRouter>
  <RouteProvider>
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </RouteProvider>
</BrowserRouter>
```

To add new routes:
1. Create page component in `src/pages/`
2. Add route to the Routes component in `main.tsx`
3. Use React Router hooks for navigation

### State Management
- Use React's built-in state management (useState, useContext)
- Theme management via ThemeProvider context
- Router integration via RouteProvider wrapper

### Custom Hooks
Located in `src/hooks/`, including:
- `use-clipboard.ts`: Clipboard operations with fallback
- `use-breakpoint.ts`: Responsive breakpoint detection
- `use-resize-observer.ts`: Element resize observation

### Theme System
- Light/dark/system theme support via ThemeProvider
- Theme persistence in localStorage
- CSS custom properties for consistent styling
- Theme toggle functionality built-in

## API Integration

### Client Generation
The project includes scripts for generating API clients from the FastAPI backend:
- Run `./scripts/generate-client.sh` to generate TypeScript client
- Generated client will be placed in `src/client/` directory
- Auto-formats generated code with Biome

### API Configuration
Configure API base URL via environment variables:
- `VITE_API_URL`: API base URL for frontend requests
- Set in Docker build args or `.env` file

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
- **Linting**: TypeScript ESLint with strict configuration
- **Formatting**: Prettier with import sorting plugin
- **Type Checking**: Strict TypeScript configuration

### Docker Development
- Multi-stage Dockerfile for production builds
- Nginx serving optimized for SPA routing
- Environment variable injection at build time

## UI Component Guidelines

### Base Components
When creating base components:
- Use React Aria Components for accessibility
- Follow established prop patterns and naming
- Include proper TypeScript interfaces
- Support theming via CSS custom properties

### Application Components
For complex application components:
- Compose from base components when possible
- Include proper loading and error states
- Support responsive design patterns
- Include comprehensive prop documentation

### Styling Best Practices
- Use semantic class names with TailwindCSS
- Follow the established spacing and sizing scale
- Maintain consistency with existing components
- Use CSS custom properties for theme-aware styling

## Testing Strategy

### Component Testing
- Test components in isolation
- Focus on user interactions and accessibility
- Use proper semantic queries
- Test responsive behavior

### Integration Testing
- Test page-level components
- Verify routing behavior
- Test theme switching functionality
- Validate API integration points

## Deployment Patterns

### Build Configuration
- Vite optimizations for production builds
- Asset optimization and code splitting
- Environment variable injection
- Source map generation for debugging

### Docker Deployment
- Multi-stage build for minimal production image
- Nginx configuration for SPA routing
- Health check endpoints
- Proper asset caching headers

## Adding New Features

### Adding a New Page
1. Create component in `src/pages/new-page.tsx`
2. Add route to main routing configuration
3. Update navigation components if needed
4. Add any required API integration

### Adding New Components
1. Determine appropriate category (base/application/etc.)
2. Create component with proper TypeScript interfaces
3. Follow established styling patterns
4. Include proper accessibility attributes
5. Add to appropriate barrel exports if needed

### Adding API Integration
1. Update backend API endpoints
2. Run client generation script
3. Create hooks for data fetching
4. Implement proper error handling
5. Add loading states and optimistic updates

## Performance Considerations

- Use React.memo for expensive components
- Implement proper code splitting for routes
- Optimize images and assets
- Use proper caching strategies
- Monitor bundle size with Vite's built-in analyzer

## Accessibility Standards

- Use React Aria Components for complex interactions
- Maintain proper semantic HTML structure
- Include ARIA labels and descriptions
- Test with keyboard navigation
- Ensure proper color contrast ratios
- Support screen readers

## Common Patterns to Follow

### Error Handling
```tsx
const [error, setError] = useState<string | null>(null);

try {
  // API call or operation
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

// Use loading state in UI
{isLoading ? <LoadingSpinner /> : <Content />}
```

### Responsive Design
```tsx
// Use TailwindCSS responsive prefixes
<div className="flex flex-col md:flex-row lg:gap-8">
  {/* Responsive content */}
</div>
```

This frontend is designed to be a modern, accessible, and maintainable React application that integrates seamlessly with the FastAPI backend while providing a rich user experience through the Untitled UI design system.