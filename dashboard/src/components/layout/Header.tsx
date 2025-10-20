import { Cloud, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { RealtimeIndicator } from '../common/RealtimeIndicator';
import { TimeRangeSelector } from '../common/TimeRangeSelector';
import { useDashboard } from '../../contexts/DashboardContext';

export function Header() {
  const { timeRange, setTimeRange, isRealtime, toggleRealtime } = useDashboard();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between px-8 py-3.5">
        {/* Logo Section - Left Aligned */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Icon with layered effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/40 blur-sm"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/70 p-2 border border-primary/30">
                <Cloud className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="tracking-tight" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  CLOUDSIGHT
                </span>
              </h1>
              <span className="text-muted-foreground" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 500 }}>
                SERVERLESS OBSERVABILITY
              </span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-10 w-px bg-border/50"></div>
          
          {/* Version badge */}
          <div className="px-2 py-0.5 bg-primary/5 border border-primary/20 text-primary" style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            v2.1.0
          </div>
        </div>

        {/* Controls - Right Aligned */}
        <div className="flex items-center gap-4">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <RealtimeIndicator isActive={isRealtime} onClick={toggleRealtime} />
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
