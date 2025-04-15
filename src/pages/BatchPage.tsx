import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Filter, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Clock,
  SearchX
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Batch, batchApi } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Helper component for status badge
const StatusBadge = ({ status }: { status: Batch['status'] }) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case 'upcoming':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Upcoming
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const BatchPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<Batch['status'] | 'all'>('all');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: batchApi.getBatches,
  });

  const filteredBatches = batches?.filter(batch => 
    selectedStatus === 'all' || batch.status === selectedStatus
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateBatch = () => {
    toast.info("Create Batch functionality will be implemented soon");
  };

  const getBatchProgress = (batch: Batch) => {
    return Math.round((batch.completedTasks / batch.totalTasks) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Spyder Batches</h1>
            <p className="text-muted-foreground">
              Manage and monitor batch processing tasks
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {selectedStatus === 'all' ? 'All Statuses' : 
                    `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                  <Checkbox 
                    id="all" 
                    checked={selectedStatus === 'all'}
                    className="mr-2 h-4 w-4"
                  />
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('active')}>
                  <Checkbox 
                    id="active" 
                    checked={selectedStatus === 'active'}
                    className="mr-2 h-4 w-4"
                  />
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('completed')}>
                  <Checkbox 
                    id="completed" 
                    checked={selectedStatus === 'completed'}
                    className="mr-2 h-4 w-4"
                  />
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('upcoming')}>
                  <Checkbox 
                    id="upcoming" 
                    checked={selectedStatus === 'upcoming'}
                    className="mr-2 h-4 w-4"
                  />
                  Upcoming
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleCreateBatch} className="bg-spyder-teal hover:bg-spyder-teal/90">
              <Plus className="mr-2 h-4 w-4" /> Create Batch
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-spyder-teal mb-4"></div>
            <p>Loading batches...</p>
          </div>
        ) : filteredBatches?.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No batches found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedStatus !== 'all'
                  ? `There are no ${selectedStatus} batches`
                  : 'No batches match your current filter'}
              </p>
              {selectedStatus !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedStatus('all')}
                >
                  Show All Batches
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBatches?.map((batch) => (
              <Card key={batch.id} className="card-hover">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    <StatusBadge status={batch.status} />
                  </div>
                  <CardDescription>{batch.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{formatDate(batch.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{formatDate(batch.endDate)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">
                          {batch.completedTasks} / {batch.totalTasks} Tasks
                        </span>
                      </div>
                      <Progress value={getBatchProgress(batch)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={expandedBatchId === batch.id ? batch.id : undefined}
                    onValueChange={(value) => setExpandedBatchId(value || null)}
                  >
                    <AccordionItem value={batch.id} className="border-none">
                      <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground">
                        {expandedBatchId === batch.id ? 'Hide Details' : 'Show Details'}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Task Distribution</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Completed:</span>
                                  <span className="font-medium">{batch.completedTasks}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pending:</span>
                                  <span className="font-medium">{batch.totalTasks - batch.completedTasks}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total:</span>
                                  <span className="font-medium">{batch.totalTasks}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Batch Operations</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toast.info(`Viewing details for batch: ${batch.name}`)}
                                >
                                  View Details
                                </Button>
                                {batch.status === 'active' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toast.info(`Paused batch: ${batch.name}`)}
                                  >
                                    Pause Batch
                                  </Button>
                                )}
                                {batch.status === 'upcoming' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toast.info(`Started batch: ${batch.name}`)}
                                  >
                                    Start Now
                                  </Button>
                                )}
                                {batch.status !== 'completed' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => toast.info(`Canceled batch: ${batch.name}`)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          {batch.status === 'active' && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-amber-800 dark:text-amber-300">Batch is currently processing</p>
                                <p className="text-amber-700 dark:text-amber-400">
                                  This batch is actively processing tasks. You can monitor its progress in real-time.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BatchPage;
