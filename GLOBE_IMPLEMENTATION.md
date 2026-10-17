# Premium Animated Globe Background - Implementation Guide

## Overview

The globe background is a premium animated component that displays DreamCatchers Studio's project locations as glowing cyan markers on an interactive globe. The globe rotates continuously in the background behind the Hero section.

## Components

### 1. **GlobeBackground Component**
Location: `src/components/GlobeBackground.tsx`

- Uses Cobe library for the globe rendering
- Automatically rotates slowly in the background
- Interactive: users can drag to rotate, pauses auto-rotation during drag
- Semi-transparent (35% opacity) to not interfere with foreground content
- GPU-optimized with proper blend modes and filters

#### Features:
- **Continuous auto-rotation**: 0.0003 radians per frame
- **Smooth interpolation**: 10% smoothing on user interactions
- **Pause on drag**: Stops auto-rotation while user drags
- **Resume after 3 seconds**: Resumes auto-rotation 3 seconds after user stops dragging
- **Responsive**: Automatically resizes with viewport
- **Glowing edges**: Radial gradient fade at edges for natural blending

### 2. **Project Locations Configuration**
Location: `src/config/projectLocations.ts`

Defines all project locations with coordinates and marker sizing.

## Adding Project Locations

To add or modify project locations, edit `src/config/projectLocations.ts`:

```typescript
export const projectLocations: ProjectLocation[] = [
  { name: "Your City", lat: 28.6139, lng: 77.2090, size: 0.4 },
  // Add more locations...
];
```

### Latitude/Longitude Resources:
- Find coordinates at: [Google Maps Coordinates](https://maps.google.com)
- Format: `lat: -90 to 90` (North is positive)
- Format: `lng: -180 to 180` (East is positive)

### Size Property:
- Range: 0.2 to 0.6 (default: 0.4)
- Larger values = more prominent markers
- Affects glow radius and core size

## Z-Index Layering

Proper layering ensures content remains interactive:

```
Canvas/Particles: z-index -1 (behind everything)
↓
Globe Background: z-index 0 (background)
Globe Fade Overlay: z-index 1 (inside globe container)
↓
Main Content: z-index 10 (above globe)
↓
Navbar: z-index 20 (top layer)
```

## Marker Animations

Each marker features:

1. **Pulsing Glow**: Outer circle expands and contracts
2. **Pulse Ring**: Middle ring that fades in/out
3. **Core Bloom**: Gradient-based bloom effect around marker
4. **Bright Center**: Solid cyan core (#33CCDD)

All animations are GPU-optimized using canvas transforms and blend modes.

## Customization Options

### Opacity
Edit `GlobeBackground.tsx`, line ~143:
```typescript
opacity: 0.35, // Change to 0.25-0.40 for desired transparency
```

### Glow Color
Edit `projectLocations.ts` or modify the hardcoded `#33CCDD` values in the marker rendering logic.

### Auto-rotation Speed
Edit `GlobeBackground.tsx`, line ~51:
```typescript
state.phi += 0.0003; // Increase/decrease for faster/slower rotation
```

### Interaction Resume Time
Edit `GlobeBackground.tsx`, line ~80:
```typescript
interactionTimeout = setTimeout(() => { ... }, 3000); // 3000ms = 3 seconds
```

## Performance Notes

- **GPU-optimized**: Uses canvas `mixBlendMode: "screen"` and `drop-shadow` filters
- **60 FPS target**: Canvas rendering at devicePixelRatio 2 for Retina displays
- **Memory efficient**: Cobe library handles efficient globe mesh rendering
- **CPU efficient**: Interaction is throttled with pointer events, not mousemove

## Troubleshooting

### Globe not visible:
- Check z-index layering in App.jsx
- Verify GlobeBackground is imported correctly
- Check browser console for TypeScript errors

### Markers not showing:
- Verify `projectLocations` array is populated
- Check browser console for coordinate-related errors
- Ensure markers are within valid lat/lng ranges

### Low performance:
- Reduce `devicePixelRatio` in Cobe config
- Decrease opacity value to simplify rendering
- Reduce number of project locations

### Interaction feels sluggish:
- Check `smoothing` value (default: 0.1)
- Reduce interaction timeout
- Check browser performance monitor

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need vendor prefixes for some filters)
- Mobile: Full support with touch events

## Future Enhancements

Potential improvements:
- Add location labels/tooltips on hover
- Add click handlers to navigate to project details
- Implement different marker styles for different project types
- Add animated connection lines between locations
- Add data-driven statistics display
- Implement real-time project status updates
