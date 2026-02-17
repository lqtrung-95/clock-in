# Phase 6: Progress Integration

## Context Links
- Plan: ./plan.md
- Previous: phase-05-ui-integration.md

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Integrate dream goal progress with focus session completion

## Integration Points

### 1. Focus Session Completion Hook
Modify `src/app/(dashboard)/focus/page.tsx`:
```typescript
// After session completion
const handleComplete = async () => {
  // Existing gamification tracking
  await trackFocusTime(user.id, Math.floor(workDuration / 60));

  // NEW: Update dream goal progress
  const hoursCompleted = workDuration / 3600;
  const result = await dreamGoalService.addProgress(user.id, hoursCompleted);

  // Show milestone celebration if reached
  if (result.milestone_just_reached) {
    setShowMilestoneModal(true);
    setMilestoneReached(result.new_milestone);
  }

  // Confetti for any progress
  confetti({ particleCount: 100, spread: 70 });
};
```

### 2. Real-time Progress Updates
```typescript
// Subscribe to dream goal changes
useEffect(() => {
  if (!userId) return;

  const subscription = supabase
    .channel('dream_goal_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'dream_goals',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        setDreamGoal(payload.new);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

### 3. Progress Animation in 3D Scene
```typescript
// Smooth progress transitions
const { progress } = useSpring({
  progress: currentProgress,
  config: { duration: 1000, easing: easings.easeOutCubic }
});

// Use animated value in scene
const climberPosition = useMemo(() => {
  const t = progress.get() / 100;
  return calculatePathPosition(t);
}, [progress]);
```

## Service Functions
```typescript
// src/services/dream-goal-service.ts
export async function addProgress(
  userId: string,
  hours: number
): Promise<{
  new_hours: number;
  new_milestone: number;
  milestone_just_reached: boolean;
}> {
  const { data, error } = await supabase
    .rpc('add_dream_goal_progress', {
      p_user_id: userId,
      p_hours: hours
    });

  if (error) throw error;
  return data;
}
```

## Guest Mode Support
```typescript
// For non-authenticated users
const addGuestProgress = (hours: number) => {
  const storage = JSON.parse(localStorage.getItem('dreamGoal') || '{}');
  const newHours = (storage.current_hours || 0) + hours;
  localStorage.setItem('dreamGoal', JSON.stringify({
    ...storage,
    current_hours: newHours,
    theme: storage.theme || 'mountain'
  }));
};
```

## Implementation Steps

1. Add progress tracking to focus session completion
2. Implement real-time subscription for progress updates
3. Add smooth animation for progress changes in 3D scene
4. Create milestone detection and celebration
5. Add guest mode support with localStorage
6. Test end-to-end flow
7. Add error handling and retry logic

## Testing Scenarios
- [ ] Complete focus session updates progress
- [ ] Milestone reached triggers celebration
- [ ] Multiple rapid sessions aggregate correctly
- [ ] Guest mode persists across page reloads
- [ ] Theme change preserves progress
- [ ] Real-time updates work across tabs

## Success Criteria
- [ ] Progress updates immediately after session
- [ ] Milestone celebrations display correctly
- [ ] 3D scene animates smoothly on progress change
- [ ] Guest mode works without authentication
- [ ] No race conditions with multiple sessions

## Risk Assessment
- **Risk**: Concurrent sessions may cause race conditions
- **Mitigation**: Use database function with proper locking
- **Risk**: Real-time updates may cause performance issues
- **Mitigation**: Debounce updates, throttle animations
