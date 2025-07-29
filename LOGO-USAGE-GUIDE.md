# Astradio Logo Usage Guide

## Overview

The Astradio logo is a sophisticated, minimalist design featuring a stylized cursive "A" on a rounded black square background. This guide ensures consistent and professional use across all platforms and applications.

## Logo Specifications

### Design Elements
- **Shape**: Rounded square with 64px border radius
- **Background**: Solid black (#000000)
- **Foreground**: White cursive "A" (#FFFFFF)
- **Style**: Modern, minimalist, sophisticated
- **Aspect Ratio**: 1:1 (square)

### Typography
- **Font Style**: Cursive, flowing, elegant
- **Stroke Width**: 12px for main letter, 8px for crossbar
- **Line Caps**: Rounded
- **Line Joins**: Rounded

## File Formats & Sizes

### Web Usage
- **SVG**: `/public/logo.svg` (scalable, preferred for web)
- **Favicon**: `/public/app-store/web/favicon-32.ico` (32x32px)
- **Apple Touch Icon**: `/public/app-store/web/apple-touch-icon-180.png` (180x180px)
- **PWA Icon**: `/public/app-store/web/pwa-icon-512.png` (512x512px)

### App Store Usage
- **iOS App Icon**: `/public/app-store/ios/app-icon-1024.png` (1024x1024px)
- **Android App Icon**: `/public/app-store/android/app-icon-512.png` (512x512px)
- **Feature Graphic**: `/public/app-store/android/feature-graphic-1024x500.png` (1024x500px)

## Usage Guidelines

### Minimum Size Requirements
- **Web**: 32x32px minimum
- **Print**: 1 inch minimum
- **App Stores**: 512x512px minimum

### Clear Space
- Maintain clear space equal to 1/4 of the logo height on all sides
- Never place text or graphics within this clear space

### Background Usage
- **Preferred**: Use on white or light backgrounds
- **Acceptable**: Use on dark backgrounds with sufficient contrast
- **Avoid**: Using on busy or patterned backgrounds

### Color Variations
- **Primary**: Black background with white "A"
- **Reverse**: White background with black "A" (for light backgrounds)
- **Monochrome**: Single color version for specific use cases

## Implementation Examples

### Web Application
```html
<!-- Navigation -->
<img src="/logo.svg" alt="Astradio Logo" width="32" height="32" />

<!-- Favicon -->
<link rel="icon" href="/logo.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/app-store/web/apple-touch-icon-180.png" />
```

### React/Next.js
```jsx
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="Astradio Logo"
  width={32}
  height={32}
  className="w-full h-full"
/>
```

### CSS Styling
```css
.logo {
  /* Ensure proper scaling */
  width: 32px;
  height: 32px;
  /* Maintain aspect ratio */
  object-fit: contain;
  /* Smooth scaling */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
```

## App Store Requirements

### iOS App Store
- **App Icon**: 1024x1024px PNG
- **No transparency**: Must have solid background
- **No rounded corners**: iOS will apply corner radius automatically
- **No text**: Logo only, no additional text

### Google Play Store
- **App Icon**: 512x512px PNG
- **Feature Graphic**: 1024x500px PNG
- **No transparency**: Must have solid background
- **Safe zone**: Keep important elements within 80% of the image

### Web App Manifest
```json
{
  "icons": [
    {
      "src": "/logo.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

## Accessibility

### Contrast Requirements
- **WCAG AA**: 4.5:1 contrast ratio minimum
- **WCAG AAA**: 7:1 contrast ratio recommended
- **Test**: Verify contrast on various backgrounds

### Alt Text
```html
<img src="/logo.svg" alt="Astradio - Your Astrological Soundtrack" />
```

### Screen Reader Support
- Provide descriptive alt text
- Ensure logo is properly labeled
- Test with screen readers

## Brand Guidelines

### Do's
✅ Use the logo consistently across all platforms
✅ Maintain proper clear space
✅ Use high-resolution versions for print
✅ Test on different backgrounds
✅ Ensure accessibility compliance

### Don'ts
❌ Don't modify the logo design
❌ Don't change colors without approval
❌ Don't stretch or distort the logo
❌ Don't use low-resolution versions
❌ Don't place on busy backgrounds

## File Organization

```
public/
├── logo.svg                    # Main logo (SVG)
├── app-store/
│   ├── ios/                   # iOS app store assets
│   ├── android/               # Android app store assets
│   └── web/                   # Web app assets
└── favicon.ico               # Legacy favicon
```

## Generation Script

Use the provided script to generate all required sizes:

```bash
node scripts/generate-logos.js
```

This script creates all necessary logo files in the correct directories with proper specifications.

## Quality Assurance

### Before Deployment
- [ ] Test logo on different backgrounds
- [ ] Verify contrast ratios
- [ ] Check accessibility compliance
- [ ] Validate file sizes and formats
- [ ] Test on different devices and browsers

### Regular Maintenance
- [ ] Update logo files when design changes
- [ ] Regenerate assets for new platforms
- [ ] Review and update usage guidelines
- [ ] Monitor brand consistency

## Contact

For questions about logo usage or brand guidelines, contact the Astradio team.

---

*This guide ensures the Astradio logo is used consistently and professionally across all platforms and applications.* 