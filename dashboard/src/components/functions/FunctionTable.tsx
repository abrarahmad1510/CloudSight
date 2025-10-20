import { FunctionSummary } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { formatNumber, formatDuration, formatPercentage, formatTimestamp } from '../../utils/formatters';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface FunctionTableProps {
  functions: FunctionSummary[];
  onFunctionClick: (id: string) => void;
}

type SortField = 'name' | 'invocations' | 'errors' | 'duration' | 'errorRate' | 'coldStartRate';
type SortDirection = 'asc' | 'desc';

export function FunctionTable({ functions, onFunctionClick }: FunctionTableProps) {
  const [sortField, setSortField] = useState<SortField>('invocations');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedFunctions = [...functions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction * aValue.localeCompare(bValue);
    }
    
    return direction * ((aValue as number) - (bValue as number));
  });

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-4 h-4 inline ml-1 ${
        sortField === field ? 'text-primary' : 'text-muted-foreground'
      }`}
    />
  );

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Function Name <SortIcon field="name" />
            </TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('invocations')}
            >
              Invocations <SortIcon field="invocations" />
            </TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('errors')}
            >
              Errors <SortIcon field="errors" />
            </TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('errorRate')}
            >
              Error Rate <SortIcon field="errorRate" />
            </TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('duration')}
            >
              Avg Duration <SortIcon field="duration" />
            </TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('coldStartRate')}
            >
              Cold Start % <SortIcon field="coldStartRate" />
            </TableHead>
            <TableHead className="text-right">Last Invocation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFunctions.map((func) => (
            <TableRow
              key={func.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => onFunctionClick(func.id)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{func.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{func.runtime}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(func.invocations)}
              </TableCell>
              <TableCell className="text-right">
                {func.errors > 0 && (
                  <span className="text-destructive">{formatNumber(func.errors)}</span>
                )}
                {func.errors === 0 && <span className="text-muted-foreground">0</span>}
              </TableCell>
              <TableCell className="text-right">
                {func.errorRate > 2 ? (
                  <span className="text-destructive">{formatPercentage(func.errorRate)}</span>
                ) : (
                  <span>{formatPercentage(func.errorRate)}</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatDuration(func.avgDuration)}
              </TableCell>
              <TableCell className="text-right">
                {func.coldStartRate > 10 ? (
                  <span className="text-orange-600">{formatPercentage(func.coldStartRate)}</span>
                ) : (
                  <span>{formatPercentage(func.coldStartRate)}</span>
                )}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatTimestamp(func.lastInvocation)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
