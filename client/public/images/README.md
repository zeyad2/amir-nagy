# Image Assets for Landing Page

This folder contains all images used in the landing page redesign.

## Required Images

Place your images in this folder (`client/public/images/`) with the following names:

### Logo & Branding
- `logo.png` - Main logo for navbar (square, recommended: 200x200px)
  - Fallback: Shows "AN" initials if image not found

### Hero Section
- `amir-nagy.jpg` - Mr. Amir Nagy's professional photo
  - Recommended: Square aspect ratio, min 800x800px
  - Fallback: Shows placeholder avatar icon

### Testimonials Section
- `student-1.jpg` - Student photo for Sarah M.
- `student-2.jpg` - Student photo for Ahmed K.
- `student-3.jpg` - Student photo for Layla H.
- `student-4.jpg` - Student photo for Omar F.
  - Recommended: Square aspect ratio, 400x400px each
  - Fallback: Shows student initials in colored circle

### Community Section (Carousel)
- `community-1.jpg` - Students collaborating in study group
- `community-2.jpg` - Students celebrating success
- `community-3.jpg` - Interactive classroom session
- `community-4.jpg` - Students working on practice problems
- `community-5.jpg` - Group discussion and learning
  - Recommended: 16:9 aspect ratio, min 1200x675px each
  - Fallback: Shows placeholder icon with caption

## Image Guidelines

### Format
- Use **JPG** for photos (better compression)
- Use **PNG** for logos with transparency
- Keep file sizes under 500KB for optimal loading

### Optimization
Before adding images, optimize them:
- Use tools like TinyPNG, ImageOptim, or Squoosh
- Target size: 200-300KB per image
- Maintain quality while reducing file size

### Aspect Ratios
- **Logo**: 1:1 (square)
- **Hero Image**: 1:1 (square)
- **Student Photos**: 1:1 (square)
- **Community Photos**: 16:9 (landscape)

## Fallback Behavior

All images have graceful fallbacks if not found:
- **Logo**: Shows "AN" initials in blue gradient
- **Hero Image**: Shows avatar icon with name
- **Student Photos**: Shows first letter of name in colored circle
- **Community Photos**: Shows group icon with caption text

This ensures the site looks professional even before images are added!

## Adding Images

1. Place your images in `client/public/images/` folder
2. Use exact names listed above
3. Refresh the page to see your images
4. No code changes needed - images will auto-load!

## Current Status

The `client/public/images/` folder is currently empty. Add your images here to replace the placeholders.
