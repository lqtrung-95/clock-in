# Dream Goal Visualization Implementation Plan

## Overview
Implement a Three.js-powered 3D visualization where users see their long-term focus goals as beautiful, evolving scenes. Each focus session contributes progress toward completing their "dream goal" - visualized as climbing a mountain, building a castle, growing a magical tree, or exploring space.

## Key Insights
- Users need visual motivation for long-term goals beyond daily streaks
- Three.js React Fiber (R3F) integrates well with Next.js
- Progress should be persistent and sync across devices
- Mobile performance is critical - use LOD and simple geometries

## Architecture

### Dream Goal Types
1. **Mountain Climb** ⛰️ - Ascend from base camp to summit
2. **Castle Builder** 🏰 - Construct a kingdom piece by piece
3. **Magical Tree** 🌳 - Grow from seed to cosmic tree
4. **Space Journey** 🚀 - Travel through solar system to distant galaxy

### Progress System
- Total dream goal: 100 hours of focus time (configurable)
- Milestones at 10%, 25%, 50%, 75%, 100%
- Visual changes at each milestone
- Celebration effects on milestone reach

### Tech Stack
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helper components
- **three** - Core 3D library
- **@react-spring/three** - Smooth animations
- **zustand** - State management for dream goal progress

## Implementation Phases

### Phase 1: Setup & Dependencies
- Install Three.js packages
- Create DreamGoalCanvas component wrapper
- Set up database schema
- Create types and services

### Phase 2: Core 3D Components
- Create scene components for each dream type
- Implement camera controls and lighting
- Create progress-to-visual mapping system
- Add particle effects

### Phase 3: Mountain Climb Theme (First Theme)
- Terrain generation with noise
- Climber character that moves up
- Weather effects (clouds at base, clear at top)
- Summit celebration at 100%

### Phase 4: Other Themes
- Castle Builder with modular construction
- Magical Tree with growth animation
- Space Journey with planet progression

### Phase 5: UI Integration
- Dream Goal page
- Mini-widget on dashboard
- Milestone celebration modal
- Theme selection UI

### Phase 6: Progress Integration
- Hook into focus session completion
- Update progress in real-time
- Sync with gamification XP system

## Database Schema

```sql
-- Dream goals table
CREATE TABLE dream_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'mountain',
  title TEXT NOT NULL,
  description TEXT,
  target_hours INTEGER NOT NULL DEFAULT 100,
  current_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  milestone_reached INTEGER NOT NULL DEFAULT 0, -- 0,1,2,3,4,5
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dream goal history for tracking
CREATE TABLE dream_goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_goal_id UUID REFERENCES dream_goals(id) ON DELETE CASCADE,
  hours_added DECIMAL(10,2) NOT NULL,
  previous_hours DECIMAL(10,2) NOT NULL,
  new_hours DECIMAL(10,2) NOT NULL,
  milestone_reached INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## File Structure
```
src/
  components/
    dream-goal/
      dream-goal-canvas.tsx        # Main 3D canvas wrapper
      dream-goal-scene.tsx         # Scene selector based on theme
      themes/
        mountain-climb-scene.tsx   # Mountain theme
        castle-builder-scene.tsx   # Castle theme
        magical-tree-scene.tsx     # Tree theme
        space-journey-scene.tsx    # Space theme
      shared/
        progress-indicator.tsx     # 3D progress bar
        milestone-particles.tsx    # Celebration effects
        camera-controller.tsx      # Camera animation
        lighting-setup.tsx         # Scene lighting
  hooks/
    use-dream-goal.ts              # Dream goal state hook
  services/
    dream-goal-service.ts          # Database operations
  stores/
    dream-goal-store.ts            # Zustand store
  types/
    dream-goal.ts                  # TypeScript types
```

## Success Criteria
- [ ] Smooth 60fps on mobile devices
- [ ] Progress persists across sessions
- [ ] Visual feedback within 100ms of progress update
- [ ] Milestone celebrations feel rewarding
- [ ] All 4 themes implemented
- [ ] Users can switch themes (progress carries over)

## Risks & Mitigation
- **Performance**: Use simple geometries, limit particle count
- **Bundle size**: Lazy load Three.js components
- **Accessibility**: Provide 2D fallback visualization

## Next Steps
1. Install dependencies
2. Create database migration
3. Build Mountain Climb scene first
4. Integrate with focus session completion
