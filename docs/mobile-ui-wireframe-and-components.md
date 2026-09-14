# Mobile UI Wireframe + Component System

## 1. Wireframe Structure

### Screen: Home Mobile
1. Sticky Header
   - Logo on right
   - Theme toggle
   - Search icon
   - Menu icon

2. Hero Section
   - Large rounded card
   - Badge
   - Main headline
   - Supporting paragraph
   - Primary CTA
   - Secondary CTA
   - Quick action chips

3. Stats Row
   - 3 compact cards

4. Services Section
   - Section title
   - 3 service cards

5. Why Us Section
   - 2x2 grid of benefits

6. Process Section
   - Timeline or step cards

7. Social Proof
   - Testimonials carousel/cards

8. Blog Preview
   - 2–3 article cards

9. FAQ Accordion
   - Expand/collapse items

10. Footer CTA
   - Final call-to-action block

---

## 2. Recommended Component Library

### Atoms
- ButtonPrimary
- ButtonSecondary
- Badge
- IconBadge
- Chip
- Divider

### Molecules
- HeaderBar
- HeroCard
- StatCard
- FeatureCard
- CTASection
- ProcessStepCard
- TestimonialCard
- BlogCard
- FAQItem
- BottomNav

### Organisms
- MobileHomeScreen
- MobileServicesScreen
- MobileProcessScreen
- MobileAboutScreen
- MobileContactScreen

---

## 3. Style System

### Colors
- Primary: #6366f1
- Secondary: #8b5cf6
- Accent: #06b6d4
- Warm: #f59e0b
- Background: #060816
- Surface: rgba(255,255,255,0.06)
- Text: #FFFFFF
- Muted: rgba(255,255,255,0.70)

### Typography
- H1: 24–28px / Bold
- H2: 18–20px / Bold
- Body: 13–15px / Medium
- Small: 10–12px / Regular

### Spacing
- 8px base unit
- Section spacing: 24px
- Card padding: 16px
- Button height: 44–48px

### Radius
- Small: 12px
- Medium: 16px
- Large: 20–28px

---

## 4. Interaction Rules
- Cards: hover lift + slight scale
- Buttons: hover lift + shadow
- Tap: scale 0.97
- Accordion: smooth expand/collapse
- Sticky header: subtle blur

---

## 5. Figma Usage Notes
- Use auto-layout for all cards
- Keep 8px spacing rhythm
- Make hero and CTA sections visually dominant
- Use one primary CTA per section
- Build components so they can be reused across screens

---

## 6. Suggested Page Flow
1. Home
2. Services
3. Process
4. About
5. Contact

This provides a strong foundation for both Figma design and frontend implementation.
