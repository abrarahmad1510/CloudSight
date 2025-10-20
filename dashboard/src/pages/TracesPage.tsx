import { useState } from 'react';
import { useTraces } from '../services/hooks';
import { TraceList } from '../components/traces/TraceList';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

interface TracesPageProps {
  onTraceClick: (traceId: string) => void;
}

export function TracesPage({ onTraceClick }: TracesPageProps) {
  const { traces, loading } = useTraces();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTraces = traces.filter(trace =>
    trace.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trace.traceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Distributed Traces</h2>
        <p className="text-muted-foreground">View and analyze distributed trace data</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search traces by service name or trace ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <TraceList traces={filteredTraces} onTraceClick={onTraceClick} />
      )}
    </div>
  );
}
