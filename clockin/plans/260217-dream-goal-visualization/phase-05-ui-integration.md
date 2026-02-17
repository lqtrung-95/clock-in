# Phase 5: UI Integration

## Context Links
- Plan: ./plan.md
- Previous: phase-04-other-themes.md
- Next: phase-06-progress-integration.md

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create UI pages and components for dream goal management

## Pages to Create

### 1. Dream Goal Page (`/dream`)
Full-page 3D visualization with:
- Large canvas taking most of the screen
- Floating UI controls (semi-transparent)
- Progress stats overlay
- Theme selector sidebar
- Goal settings modal

### 2. Dashboard Widget
Mini 3D preview showing:
- Small canvas with simplified scene
- Quick progress percentage
- "Continue Journey" CTA

### 3. Milestone Celebration Modal
Fullscreen overlay when reaching milestones:
- Particle explosion effects
- Congratulations message
- Reward preview (if applicable)
- Share button

## Components

### DreamGoalPage
```typescript
// src/app/(dashboard)/dream/page.tsx
export default function DreamGoalPage() {
  const { dreamGoal, isLoading } = useDreamGoal();

  return (
    <div className="relative h-screen w-full">
      {/* 3D Canvas */}
      <DreamGoalCanvas theme={dreamGoal?.theme} progress={dreamGoal?.progress} />

      {/* Floating UI */}
      <div className="absolute inset-0 pointer-events-none">
        <HeaderOverlay />
        <ProgressOverlay />
        <ThemeSelector className="pointer-events-auto" />
      </div>

      {/* Settings Modal */}
      <DreamGoalSettings />
    </div>
  );
}
```

### Dashboard Widget
```typescript
// src/components/dashboard/dream-goal-widget.tsx
export function DreamGoalWidget() {
  return (
    <Card className="col-span-full lg:col-span-2 h-64">
      <div className="flex h-full">
        <div className="w-1/3">
          <MiniDreamCanvas />
        </div>
        <div className="w-2/3 p-4 flex flex-col justify-center">
          <h3>Your Dream Goal</h3>
          <Progress value={progress} />
          <Button>Continue Journey</Button>
        </div>
      </div>
    </Card>
  );
}
```

### Theme Selector
```typescript
// src/components/dream-goal/theme-selector.tsx
const THEMES = [
  { id: 'mountain', name: 'Mountain Climb', icon: Mountain, color: 'emerald' },
  { id: 'castle', name: 'Castle Builder', icon: Castle, color: 'amber' },
  { id: 'tree', name: 'Magical Tree', icon: Tree, color: 'green' },
  { id: 'space', name: 'Space Journey', icon: Rocket, color: 'purple' },
];
```

### Milestone Modal
```typescript
// src/components/dream-goal/milestone-modal.tsx
export function MilestoneModal({ milestone, onClose }: Props) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
          <h2>Milestone Reached!</h2>
          <p>You've reached {milestone}% of your dream goal!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Implementation Steps

1. Create full-page dream goal route
2. Build floating UI overlay components
3. Create dashboard widget with mini canvas
4. Implement milestone celebration modal
5. Add theme selector with previews
6. Create settings modal for goal customization
7. Add navigation between related pages

## Responsive Design
- Desktop: Full 3D experience
- Tablet: Reduced canvas quality, same UI
- Mobile: Simplified 3D or fallback to 2D visualization

## Success Criteria
- [ ] Page layout is responsive
- [ ] UI overlays don't obstruct 3D view
- [ ] Theme selector works smoothly
- [ ] Milestone modal triggers correctly
- [ ] Dashboard widget renders properly

## Risk Assessment
- **Risk**: Mobile UI may be cramped
- **Mitigation**: Use bottom sheet for controls on mobile
- **Risk**: 3D canvas may conflict with modals
- **Mitigation**: Proper z-index management
