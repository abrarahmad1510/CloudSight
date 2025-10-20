import { Activity } from 'lucide-react';
import { Badge } from '../ui/badge';

interface RealtimeIndicatorProps {
  isActive: boolean;
  onClick?: () => void;
}

export function RealtimeIndicator({ isActive, onClick }: RealtimeIndicatorProps) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={`cursor-pointer gap-1.5 px-2.5 py-1 h-7 transition-all border ${
        isActive 
          ? 'bg-primary text-primary-foreground border-primary/20 shadow-sm' 
          : 'bg-secondary/50 border-border/30 hover:bg-secondary'
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Activity className="w-3.5 h-3.5" />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-green-400"></span>
          </span>
        )}
      </div>
      <span>{isActive ? 'Live' : 'Paused'}</span>
    </Badge>
  );
}
