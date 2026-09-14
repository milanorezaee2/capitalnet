# Mobile UI Figma Spec v2

## هدف
این نسخه برای طراحی دقیق‌تر در Figma و همچنین پیاده‌سازی نزدیک به UI آماده است. تمرکز روی تجربه‌ی موبایل، هویت برند، و ساختار قابل تکرار است.

## 1. Page Goal
صفحه‌ی اصلی موبایل باید حس زیر را منتقل کند:
- حرفه‌ای
- سریع
- مدرن
- قابل اعتماد
- مناسب برای جذب سرمایه‌گذار و مشتری

## 2. Layout Structure

### A. Top Bar
- height: 56px
- sticky
- background: glass blur
- right side: logo + brand name
- left side: theme, search, menu
- border radius: 24px

### B. Hero Section
- background: dark gradient + soft glass card
- border radius: 28px
- padding: 20px
- headline: 2 lines max
- subtitle: 1 paragraph, justified text
- CTA row: primary + secondary button
- chips row: 4 quick links

### C. Trust Strip
- 3 mini cards
- each: strong metric + label

### D. Services Section
- section title
- 3 cards with icon, title, short paragraph, feature bullets

### E. Why Us Section
- 4 small cards in 2x2 grid
- each with icon + short copy

### F. Process Section
- left vertical line + 4 step cards
- numbered circle badge

### G. Social Proof
- testimonial cards in horizontal scroll
- 1 card per testimonial

### H. Blog Preview
- 2–3 cards with title, excerpt, metadata

### I. FAQ Section
- accordion items with question and answer

### J. Final CTA
- strong conversion block with one primary CTA

---

## 3. Visual System

### Colors
- Background: #060816
- Surface: rgba(255,255,255,0.06)
- Surface Strong: rgba(255,255,255,0.10)
- Border: rgba(255,255,255,0.12)
- Primary Purple: #6366f1
- Secondary Violet: #8b5cf6
- Cyan: #06b6d4
- Warm Amber: #f59e0b
- Text Main: #FFFFFF
- Text Secondary: rgba(255,255,255,0.70)

### Typography
- Hero Title: 24–28px / Bold / 1.2 line-height
- Section Title: 18–20px / Bold
- Card Title: 14–16px / Bold
- Paragraph: 13–15px / Medium
- Caption: 10–12px / Regular

### Shadows
- soft shadow for cards
- subtle glow on CTA buttons
- depth only, not heavy

### Radius
- 12px for small chips
- 16px for cards
- 20–28px for hero and major containers

---

## 4. Component Specs

### Button Primary
- height: 44px
- padding: 0 16px
- border radius: 14px
- background: linear gradient from purple to cyan
- text: white / bold

### Button Secondary
- height: 44px
- border: 1px solid white/10
- background: transparent or glass
- text: white

### Card Base
- padding: 16px
- radius: 16px
- background: rgba(255,255,255,0.04)
- border: rgba(255,255,255,0.08)
- hover: translateY(-2px), scale(1.01)

### Section Divider
- small label with line on both sides
- uppercase, muted, 10px

### FAQ Item
- rounded card
- question row with arrow icon
- answer revealed below

---

## 5. Interaction Details
- hover/tap: slight lift and scale
- cards: transition duration 250ms
- buttons: slight shadow increase on hover
- FAQ: expand with smooth height transition
- header: blur backdrop on scroll

---

## 6. Content Hierarchy
1. Hero / Value proposition
2. Trust indicators
3. Core services
4. Why us
5. Process
6. Testimonials / social proof
7. Blog / extra value
8. Final CTA

---

## 7. Figma Implementation Notes
- Build all cards with Auto Layout
- Use a 4px/8px spacing system
- Make the hero card the visual anchor
- Keep the UI airy but dense enough for information
- Favor consistency over novelty

## 8. Best Direction
The strongest version is a polished “app-like mobile landing page” with:
- glassmorphism shell
- bold hero
- structured cards
- soft motion
- minimal but premium UI

This is the best balance between modern visuals and real-world usability.
