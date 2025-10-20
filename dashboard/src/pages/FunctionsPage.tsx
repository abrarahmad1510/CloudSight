import { useFunctions } from '../services/hooks';
import { FunctionTable } from '../components/functions/FunctionTable';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface FunctionsPageProps {
  onFunctionClick: (id: string) => void;
}

export function FunctionsPage({ onFunctionClick }: FunctionsPageProps) {
  const { functions, loading } = useFunctions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunctions = functions.filter(func =>
    func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    func.runtime.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Lambda Functions</h2>
        <p className="text-muted-foreground">Monitor and analyze your serverless functions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search functions by name or runtime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <FunctionTable functions={filteredFunctions} onFunctionClick={onFunctionClick} />
      )}
    </div>
  );
}
