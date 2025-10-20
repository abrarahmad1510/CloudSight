import { LayoutDashboard, Activity, Server, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'traces', label: 'Traces', icon: Activity },
  { id: 'functions', label: 'Functions', icon: Server },
  { id: 'errors', label: 'Errors', icon: AlertCircle },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm">
      <nav className="p-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 transition-all ${
                isActive ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary shadow-sm' : ''
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
