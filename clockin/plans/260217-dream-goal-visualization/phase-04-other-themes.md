# Phase 4: Other Dream Goal Themes

## Context Links
- Plan: ./plan.md
- Previous: phase-03-mountain-scene.md
- Next: phase-05-ui-integration.md

## Overview
- **Priority**: Medium
- **Status**: Pending
- **Description**: Implement the remaining three themes: Castle Builder, Magical Tree, and Space Journey

## Theme 1: Castle Builder 🏰

### Visual Concept
- **0-10%**: Foundation and ground clearing
- **10-25%**: Castle walls and towers appear
- **25-50%**: Main keep and gatehouse built
- **50-75%**: Courtyard, stables, barracks added
- **75-100%**: Full kingdom with village, banners flying, celebration

### Scene Elements
- Modular castle pieces that appear at milestones
- Workers/guards that animate
- Day/night cycle based on progress
- Flag that rises at completion

### Technical Approach
```typescript
const CASTLE_PIECES = [
  { milestone: 0, component: 'foundation', position: [0, 0, 0] },
  { milestone: 1, component: 'walls', position: [...] },
  { milestone: 2, component: 'towers', position: [...] },
  { milestone: 3, component: 'keep', position: [...] },
  { milestone: 4, component: 'village', position: [...] },
];
```

## Theme 2: Magical Tree 🌳

### Visual Concept
- **0-10%**: Seed planted in soil
- **10-25%**: Sprout emerges, small trunk
- **25-50%**: Young tree with branches forming
- **50-75%**: Mature tree with full canopy
- **75-100%**: Cosmic tree reaching stars with magical glow

### Scene Elements
- Procedural tree growth animation
- Particle effects (fireflies, pollen, magic sparkles)
- Roots that spread with progress
- Bioluminescent effects at higher milestones
- Season changes (spring → summer → autumn → magical winter)

### Technical Approach
```typescript
// Recursive tree generation
const generateTreeBranch = (depth: number, length: number) => {
  if (depth === 0) return null;
  return {
    length: length * (0.7 + Math.random() * 0.3),
    angle: (Math.random() - 0.5) * 0.5,
    children: [
      generateTreeBranch(depth - 1, length * 0.7),
      generateTreeBranch(depth - 1, length * 0.7)
    ]
  };
};
```

## Theme 3: Space Journey 🚀

### Visual Concept
- **0-10%**: Launch pad on Earth
- **10-25%**: Leaving atmosphere, seeing curvature
- **25-50%**: Moon flyby, entering solar system
- **50-75%**: Passing Mars, asteroid belt
- **75-100%**: Reaching distant galaxy, nebula exploration

### Scene Elements
- Rocket ship that travels along path
- Planets that appear at milestones
- Starfield background
- Warp speed effect when progressing
- Planet details visible when nearby

### Technical Approach
```typescript
const PLANETS = [
  { milestone: 0, name: 'Earth', distance: 0, size: 10 },
  { milestone: 1, name: 'Moon', distance: 50, size: 3 },
  { milestone: 2, name: 'Mars', distance: 150, size: 5 },
  { milestone: 3, name: 'Jupiter', distance: 300, size: 15 },
  { milestone: 4, name: 'Nebula', distance: 500, size: 50 },
];
```

## Implementation Steps

### Castle Builder
1. Create modular castle components
2. Implement piece-by-piece reveal animation
3. Add worker characters with simple animations
4. Create kingdom completion celebration

### Magical Tree
1. Implement recursive tree generation
2. Create growth animation system
3. Add particle effects for magic/sparkles
4. Implement seasonal color transitions

### Space Journey
1. Create procedural starfield background
2. Model planets with textures
3. Implement rocket ship along spline path
4. Add warp speed transition effects

## Shared Components
All themes should reuse:
- `camera-controller.tsx` - Smooth camera transitions
- `progress-indicator-3d.tsx` - 3D progress visualization
- `milestone-celebration.tsx` - Milestone reached effects
- `theme-selector.tsx` - Switch between themes

## Success Criteria
- [ ] All 4 themes render without errors
- [ ] Theme switching preserves progress
- [ ] Each theme has distinct visual identity
- [ ] Mobile performance acceptable on all themes
- [ ] Users can preview themes before selecting

## Risk Assessment
- **Risk**: Castle theme may have too many draw calls
- **Mitigation**: Merge geometries, use LOD
- **Risk**: Space theme assets may be large
- **Mitigation**: Generate planets procedurally, use simple materials
