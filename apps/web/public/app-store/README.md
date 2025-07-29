# App Store Assets

This directory contains the Astradio logo in various sizes for app store submissions.

## Required Sizes

### iOS App Store
- **App Icon**: 1024x1024px (PNG)
- **App Store Screenshots**: Various sizes for different devices
- **App Store Icon**: 512x512px (PNG)

### Google Play Store
- **App Icon**: 512x512px (PNG)
- **Feature Graphic**: 1024x500px (PNG)
- **Screenshots**: Various sizes for different devices

### Web App
- **Favicon**: 32x32px (ICO)
- **Apple Touch Icon**: 180x180px (PNG)
- **PWA Icon**: 512x512px (PNG)

## Logo Specifications

The Astradio logo features:
- **Shape**: Rounded square with 64px border radius
- **Background**: Solid black (#000000)
- **Foreground**: White cursive "A" with decorative loop
- **Style**: Modern, minimalist, sophisticated

## Usage Guidelines

1. **Minimum Size**: Never use smaller than 32x32px
2. **Background**: Always maintain the black background
3. **Padding**: Ensure adequate padding around the logo
4. **Format**: Use SVG for web, PNG for app stores
5. **Accessibility**: Ensure sufficient contrast for visibility

## File Structure

```
app-store/
├── ios/
│   ├── app-icon-1024.png
│   └── app-store-icon-512.png
├── android/
│   ├── app-icon-512.png
│   └── feature-graphic-1024x500.png
├── web/
│   ├── favicon-32.ico
│   ├── apple-touch-icon-180.png
│   └── pwa-icon-512.png
└── README.md
```

## Generation Instructions

1. Use the base `logo.svg` as the source
2. Export to PNG at required sizes
3. Ensure crisp edges and proper scaling
4. Test on different backgrounds
5. Verify accessibility compliance 