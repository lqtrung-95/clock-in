# Phase 1: Setup & Dependencies

## Context Links
- Plan: ./plan.md
- Next: phase-02-database-schema.md

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Install Three.js packages and create base infrastructure for Dream Goal Visualization

## Requirements

### Dependencies
```bash
npm install three @react-three/fiber @react-three/drei @react-spring/three
npm install -D @types/three
```

### Files to Create
1. `src/types/dream-goal.ts` - TypeScript types
2. `src/services/dream-goal-service.ts` - Database operations
3. `src/stores/dream-goal-store.ts` - Zustand store
4. `src/components/dream-goal/dream-goal-canvas.tsx` - Main canvas wrapper

### Types Definition
```typescript
// src/types/dream-goal.ts
export type DreamGoalTheme = 'mountain' | 'castle' | 'tree' | 'space';

export interface DreamGoal {
  id: string;
  user_id: string;
  theme: DreamGoalTheme;
  title: string;
  description: string | null;
  target_hours: number;
  current_hours: number;
  milestone_reached: number; // 0-5
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DreamGoalProgress {
  percentage: number;
  currentMilestone: number;
  hoursToNextMilestone: number;
  nextMilestonePercentage: number;
}

export const MILESTONE_THRESHOLDS = [0, 10, 25, 50, 75, 100];
```

## Implementation Steps

1. Install Three.js dependencies
2. Create TypeScript types
3. Create database service functions
4. Create Zustand store
5. Create base canvas component with React Suspense
6. Add loading fallback component

## Success Criteria
- [ ] All dependencies installed without conflicts
- [ ] TypeScript types compile correctly
- [ ] Service functions have proper error handling
- [ ] Store integrates with auth state
- [ ] Canvas wrapper renders without errors

## Risk Assessment
- **Risk**: Bundle size increase from Three.js
- **Mitigation**: Use dynamic imports with `next/dynamic`
