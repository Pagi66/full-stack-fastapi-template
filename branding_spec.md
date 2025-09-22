# Apex Investments - Branding & UI Asset Specification

## Overview

This document provides exact specifications for all visual assets required to implement the Apex Investments UI/UX. All assets must convey **trust, innovation, and institutional-grade quality**.

## 1. Color Palette (CSS Variables)

**Primary Brand Colors:** (To be used in `frontend/src/providers/theme-provider.tsx`)

- `--color-apex-deepblue: #0f172a;` (Dark Navy: Primary background, text)
- `--color-apex-gold: #d4af37;` (Gold: Accents, buttons, highlights)
- `--color-apex-green: #059669;` (Emerald Green: Profit, success states)
- `--color-apex-slate: #94a3b8;` (Light Slate: Secondary text, borders)

## 2. Logo Assets

**File Format:** SVG (preferred) & PNG (fallback)
**Location:** `frontend/public/assets/branding/`

| Asset Name | Dimensions | Background | Use Case |
| :--- | :--- | :--- | :--- |
| `logo-full.svg` | 320 x 80px | Transparent | Navigation Header |
| `logo-icon.svg` | 48 x 48px | Transparent | Favicon, App Icon |
| `logo-dark-bg.png` | 320 x 80px | `#0f172a` | For light-themed pages |

## 3. Key Illustration Placeholders

**File Format:** SVG
**Style:** Modern, minimalist, corporate-finance themed line art.
**Location:** `frontend/public/assets/illustrations/`

| Component | Illustration File | Description & Required Elements |
| :--- | :--- | :--- |
| **Empty Dashboard** | `empty-portfolio.svg` | A sleek, empty chart with a trending arrow upwards. Should include a subtle "AI" icon integrated into the design. |
| **Login/Signup** | `login-hero.svg` | An abstract visualization of a secure, interconnected network with shield and graph elements. |
| **Pro Trader Page** | `pro-trader.svg` | Silhouettes of two figures, one larger (the pro trader) and a smaller one following behind (the copy trader). |
| **Success State** | `success-checkmark.svg` | A stylized checkmark integrated with a growth chart. |

## 4. Iconography

**Library:** [Lucide React](https://lucide.dev/) (already included with Untitled UI)
**Custom Icons Needed (SVG):** Place in `frontend/src/components/ui/illustrations/`

- `AIBrainIcon.svg`: A minimalist brain circuit with a chart trend line.
- `AlgorithmIcon.svg`: An icon representing automation (gears) and data flow.

## 5. UI Copy & Tone

**Tone:** Authoritative, reassuring, and slightly aspirational.
**Example Headlines:**

- "Your Capital is Deployed by Institutional-Grade Algorithms"
- "Real-Time AI Analysis for Optimized Returns"
- "Copy the Strategies of Our Most Successful Proprietary Traders"

## 6. Legal Footer Text (Placeholder Copy)

**Location:** `frontend/src/components/footer.tsx`
