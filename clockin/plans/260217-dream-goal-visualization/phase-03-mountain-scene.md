# Phase 3: Mountain Climb Theme

## Context Links
- Plan: ./plan.md
- Previous: phase-02-database-schema.md
- Next: phase-04-other-themes.md

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create the first 3D theme - Mountain Climb with terrain, climber character, and weather effects

## Visual Concept

### Scene Elements
- **Base (0-10%)**: Green foothills, forest, clouds/fog
- **Low (10-25%)**: Rocky slopes, fewer trees, some snow patches
- **Mid (25-50%)**: Steep cliffs, snow line begins, alpine zone
- **High (50-75%)**: Snow-covered peaks, glaciers, thin air effect
- **Summit (75-100%)**: Highest peak with flag, aurora/celebration effects

### Progress Visualization
- Climber character that moves up the mountain as progress increases
- Path/trail that lights up behind the climber
- Height indicator showing current elevation
- Milestone markers at each checkpoint

## Technical Implementation

### Components Structure
```
src/components/dream-goal/themes/
  mountain-climb-scene.tsx      # Main scene component
  mountain-terrain.tsx          # Procedural terrain generation
  mountain-climber.tsx          # Animated climber character
  mountain-weather.tsx          # Clouds, fog, snow effects
  mountain-milestones.tsx       # Checkpoint markers
  shared/
    camera-controller.tsx       # Camera that follows progress
    lighting-setup.tsx          # Dynamic lighting
    progress-indicator-3d.tsx   # 3D progress bar
```

### Terrain Generation
```typescript
// Use noise-based height map
const terrainGeometry = useMemo(() => {
  const geometry = new THREE.PlaneGeometry(100, 100, 128, 128);
  const positions = geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    // Simple noise for height
    const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10 +
                   Math.sin(x * 0.3) * Math.cos(y * 0.3) * 5;
    positions[i + 2] = Math.max(0, height);
  }

  geometry.computeVertexNormals();
  return geometry;
}, []);
```

### Climber Animation
```typescript
// Climber position based on progress
const climberPosition = useMemo(() => {
  const t = progress / 100;
  // Path up the mountain
  return [
    Math.sin(t * Math.PI) * 20,     // x: spiral path
    t * 40,                          // y: height
    Math.cos(t * Math.PI * 2) * 20  // z: spiral
  ];
}, [progress]);
```

## Implementation Steps

1. Create base scene component with canvas
2. Implement terrain generation with color zones
3. Create simple climber character (low-poly humanoid)
4. Add camera that follows climber progress
5. Implement weather effects (clouds at base, clear at top)
6. Add milestone markers with glow effects
7. Create summit celebration animation
8. Add particle effects for snow/wind

## Performance Considerations
- Use instanced mesh for trees/rocks
- Limit terrain resolution on mobile
- Use LOD for terrain
- Disable shadows on low-end devices

## Success Criteria
- [ ] Scene renders at 60fps on mid-range mobile
- [ ] Terrain colors change appropriately with progress
- [ ] Climber animates smoothly along path
- [ ] Milestone markers are clearly visible
- [ ] Summit celebration triggers at 100%

## Risk Assessment
- **Risk**: Terrain generation may be too heavy
- **Mitigation**: Pre-generate terrain or use simpler geometry
- **Risk**: Mobile performance issues
- **Mitigation**: Implement quality settings toggle
