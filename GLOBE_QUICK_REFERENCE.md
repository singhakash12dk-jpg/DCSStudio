# Globe Background - Quick Reference

## ✅ What's Been Implemented

A premium animated globe background that:
- ✓ Rotates slowly and continuously in the background
- ✓ Pauses when user drags to interact
- ✓ Resumes auto-rotation after 3 seconds of inactivity
- ✓ Semi-transparent (35% opacity) so foreground content is always visible
- ✓ Features glowing cyan markers (#33CCDD) at project locations
- ✓ GPU-optimized for smooth 60 FPS performance
- ✓ Responsive - automatically scales with viewport
- ✓ Proper z-index layering for content interactivity

## 📍 Current Project Locations

The globe displays markers at these locations:
- Mumbai
- Lucknow
- Himachal Pradesh
- North East India
- Delhi
- Japan
- China

## 🎨 Customization

### Add or Edit Project Locations

Edit: `src/config/projectLocations.ts`

```typescript
export const projectLocations: ProjectLocation[] = [
  { name: "Your City", lat: 28.6139, lng: 77.2090, size: 0.4 },
  { name: "Another City", lat: 51.5074, lng: -0.1278, size: 0.35 },
];
```

### Adjust Globe Opacity

Edit: `src/components/GlobeBackground.tsx` line ~143
```typescript
opacity: 0.35, // Change to 0.25-0.45
```

### Change Rotation Speed

Edit: `src/components/GlobeBackground.tsx` line ~51
```typescript
state.phi += 0.0003; // Increase = faster, Decrease = slower
```

### Modify Marker Color

Change `#33CCDD` to your desired color in the Cobe library or marker rendering logic.

## 🔧 File Structure

```
src/
├── components/
│   └── GlobeBackground.tsx          # Main globe component
├── config/
│   └── projectLocations.ts          # Location data
└── App.jsx                          # Main app with globe integration
```

## 📊 Performance Tips

- Globe maintains 60 FPS on modern devices
- Renders at 2x devicePixelRatio for crisp display
- Interaction events are pointer-based (not mousemove)
- Canvas uses GPU acceleration with blend modes

## 🎯 Z-Index Stack

```
-1: Canvas/Particles (behind everything)
 0: Globe Background
 1: Globe fade overlay (inside container)
10: Main content (above globe)
20: Navbar (top layer)
```

## 🔄 How It Works

1. **Auto-Rotation**: Phi angle increases by 0.0003 radians per frame
2. **User Interaction**: Pointer events track mouse/touch position
3. **Smooth Animation**: 10% smoothing applied to user input
4. **Resume After 3s**: Auto-rotation resumes 3 seconds after user stops dragging

## 📱 Responsive Behavior

- Automatically resizes canvas on window resize
- Maintains aspect ratio across all viewports
- Touch-friendly on mobile devices
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## 🚀 Future Enhancements

Potential additions:
- Hover tooltips showing project names
- Click handlers to navigate to projects
- Different marker styles for different project types
- Animated connecting lines between locations
- Real-time data integration

## 📚 Documentation

For detailed implementation docs, see: `GLOBE_IMPLEMENTATION.md`

## ❓ Troubleshooting

**Globe not visible?**
- Check browser console for errors
- Verify z-index values in App.jsx
- Ensure GlobeBackground component is imported

**Performance issues?**
- Reduce opacity value
- Reduce number of project locations
- Check browser performance monitor (F12 > Performance tab)

**Markers not showing?**
- Verify projectLocations array is populated
- Check coordinate format (lat: -90 to 90, lng: -180 to 180)
- Ensure markers are within valid ranges
