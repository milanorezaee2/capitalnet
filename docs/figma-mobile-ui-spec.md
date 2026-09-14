# Figma-ready mobile UI spec

## هدف
این مستند یک نسخه‌ی ساختاری و نزدیک به Figma برای تجربه‌ی موبایل سایت Capital Network ارائه می‌دهد تا برای طراحی، بازبینی یا تبدیل به Component در Figma استفاده شود.

## سبک کلی
- روت: mobile-first
- حس: premium, glassy, app-like
- زبان: فارسی
- جهت: RTL
- لحن: مدرن، آرام، حرفه‌ای

## رنگ‌ها
- Primary: #6366f1
- Secondary: #8b5cf6
- Accent: #06b6d4
- Warm: #f59e0b
- Background dark: #060816
- Surface: rgba(255,255,255,0.06)
- Border: rgba(255,255,255,0.10)
- Text primary: #FFFFFF
- Text secondary: rgba(255,255,255,0.70)

## تایپوگرافی
- Heading: Almarai / Bold / 24–28px
- Subtitle: Almarai / Medium / 14–16px
- Body: Almarai / Regular / 13–15px
- Microcopy: 10–12px

## فاصله‌ها
- Section spacing: 24px
- Card padding: 16px
- Radius: 20–28px
- Shadow: soft, layered, low blur

## Layout mobile
### 1. Header
- sticky top bar
- logo on right
- theme toggle
- search icon
- menu icon
- glassmorphism background

### 2. Hero section
- large rounded card
- badge top-left
- title bold
- body paragraph with justified text
- 2 CTA buttons
- quick chips below

### 3. Stats row
- 3 small cards in a row
- strong numeric values

### 4. Main sections
- services
- why us
- process
- showcase
- testimonials
- blog preview
- FAQ

### 5. Bottom navigation
- 4–5 tabs
- active tab with pill background
- icon + label

## Component structure
- HeaderBar
- MobileHeroCard
- StatCard
- FeatureCard
- SectionDivider
- CTASection
- ProcessCard
- TestimonialCard
- BlogCard
- FAQAccordion
- BottomNav

## Interaction states
- hover on cards: slight lift, scale 1.01
- button hover: lift + shadow
- tap feedback: scale 0.97
- accordion expand: smooth height animation

## Content hierarchy
1. Hero
2. Trust / stats
3. Services
4. Why us
5. Process
6. Social proof
7. Blog / FAQ
8. CTA

## Figma-ready notes
- Use auto-layout for cards
- Maintain 8px spacing system
- Use rounded corners and subtle gradients
- Keep content density balanced for mobile
- Prefer one primary CTA per section

## Suggested screen order
- Home mobile screen
- Services page
- Process page
- About page
- Contact page
