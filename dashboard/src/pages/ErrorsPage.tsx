import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

export function ErrorsPage() {
  // Mock error data
  const errors = [
    {
      id: '1',
      functionName: 'user-authentication',
      message: 'Timeout error: Request exceeded 30 seconds',
      timestamp: Date.now() - 120000,
      severity: 'high' as const,
      count: 5,
    },
    {
      id: '2',
      functionName: 'data-processor',
      message: 'Memory limit exceeded',
      timestamp: Date.now() - 300000,
      severity: 'critical' as const,
      count: 12,
    },
    {
      id: '3',
      functionName: 'image-upload',
      message: 'S3 bucket not accessible',
      timestamp: Date.now() - 600000,
      severity: 'medium' as const,
      count: 3,
    },
    {
      id: '4',
      functionName: 'notification-service',
      message: 'Invalid API credentials',
      timestamp: Date.now() - 900000,
      severity: 'high' as const,
      count: 8,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Error Tracking</h2>
        <p className="text-muted-foreground">Recent errors and issues across your functions</p>
      </div>

      <div className="space-y-3">
        {errors.map((error) => (
          <Card key={error.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span>{error.functionName}</span>
                  <Badge variant={getSeverityColor(error.severity)}>
                    {error.severity}
                  </Badge>
                  <Badge variant="outline">{error.count} occurrences</Badge>
                </div>
                
                <p className="text-muted-foreground mb-2">{error.message}</p>
                
                <p className="text-muted-foreground">
                  {formatTimestamp(error.timestamp)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
