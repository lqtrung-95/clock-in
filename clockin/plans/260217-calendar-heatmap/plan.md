# Calendar Heatmap Implementation

## Overview
GitHub-style contribution graph showing daily focus time on stats page.

## Components
1. `calendar-heatmap.tsx` - Main heatmap component
2. `heatmap-cell.tsx` - Individual day cell with tooltip
3. `heatmap-legend.tsx` - Color scale legend
4. Service function - Query daily aggregated data

## Features
- Last 365 days view
- Color scale: empty → light → medium → dark (based on hours)
- Tooltip showing date and hours
- Month labels
- Click to see day details

## Files
- `src/components/stats/calendar-heatmap.tsx`
- `src/services/stats-service.ts` (add function)
- Update `src/app/(dashboard)/stats/page.tsx`
