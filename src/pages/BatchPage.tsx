import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  SearchX,
  Loader,
  ChevronLeft
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { z as zod } from 'zod';

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
import { SpyderBatch, batchApi, CreateSpyderBatchInput, countryApi, groupApi, configApi } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper component for status badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>;
    case 'completed':
      return <Badge variant="default">Completed</Badge>;
    case 'upcoming':
      return <Badge variant="outline">Upcoming</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

type BatchFormValues = {
  countryId: string;
  endDate: string;
  spyderGroupId: string;
  startDate: string;
  status: string;
};

const formatTimestamp = (timestamp: string | number) => {
  try {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 16);
  } catch (error) {
    return '';
  }
};

const parseDateInput = (value: string) => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.getTime().toString();
  } catch (error) {
    return null;
  }
};

const batchFormSchema = z.object({
  countryId: z.string().min(1, "Country is required"),
  endDate: z.string().min(1, "End date is required"),
  spyderGroupId: z.string().min(1, "Group is required"),
  startDate: z.string().min(1, "Start date is required"),
  status: z.string().min(1, "Status is required")
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(Number(data.startDate));
    const end = new Date(Number(data.endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    return end > start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

const formatDisplayDate = (timestamp: string | number) => {
  try {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const BatchPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<SpyderBatch['status'] | 'all'>('all');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches', currentPage, pageSize],
    queryFn: () => batchApi.getBatches({
      pagination: { page: currentPage, pageSize },
    }),   
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countryApi.getCountries(1, 20), // Fetch all countries
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.getGroups(1, 20), // Fetch groups
  });

  const { data: configs } = useQuery({
    queryKey: ['configs'],
    queryFn: () => configApi.getConfigs(1, 100),
  });

  const filteredBatches = batches?.spyderBatches.items.filter(batch => 
    selectedStatus === 'all' || batch.status === selectedStatus
  );

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      countryId: "",
      endDate: "",
      spyderGroupId: "",
      startDate: "",
      status: ""
    },
  });

  const createMutation = useMutation({
      mutationFn: (values: BatchFormValues) => {
        return batchApi.createBatch(values)
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success('Batch created successfully');
    },
    onError: () => {
      toast.error('Failed to create batch');
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: ({ batchId, configId }: { batchId: string; configId: string }) => 
      batchApi.scrapeAdsByBatch(batchId, configId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to scrape ads for batch');
      }
    },
    onError: (error) => {
      console.error('Scrape error:', error);
      toast.error('Failed to scrape ads for batch');
    },
  });

  const onSubmit = async (values: BatchFormValues) => {
    try {
      const input: CreateSpyderBatchInput = {
        countryId: values.countryId,
        endDate: values.endDate,
        spyderGroupId: values.spyderGroupId,
        startDate: values.startDate,
        status: values.status
      };

      await batchApi.createBatch(input);
      toast.success("Batch created successfully");
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    } catch (error) {
      toast.error("Failed to create batch");
    }
  };

  const handleCreateBatch = () => {
    toast.info("Create Batch functionality will be implemented soon");
  };

  const getBatchProgress = (batch: SpyderBatch) => {
    return 0; // TODO: Implement actual progress calculation
  };

  const handleScrapeClick = (batchId: string) => {
    setSelectedBatchId(batchId);
    setIsConfigDialogOpen(true);
  };

  const handleConfigSelect = (configId: string) => {
    if (selectedBatchId) {
      scrapeMutation.mutate({ batchId: selectedBatchId, configId });
      setIsConfigDialogOpen(false);
      setSelectedBatchId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
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
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Batch</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new batch.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="countryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries?.countries.items.map((country) => (
                                  <SelectItem key={country.id} value={country.id}>
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="spyderGroupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {groups?.spyedGroups.items.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value}
                                onChange={(e) => {
                                  const timestamp = parseDateInput(e.target.value);
                                  if (timestamp) {
                                    field.onChange(timestamp);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value}
                                onChange={(e) => {
                                  const timestamp = parseDateInput(e.target.value);
                                  if (timestamp) {
                                    field.onChange(timestamp);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={createMutation.isPending}>
                          {createMutation.isPending ? 'Creating...' : 'Create Batch'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading batches...</p>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches?.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">Batch {batch.id}</TableCell>
                      <TableCell>
                        <StatusBadge status={batch.status} />
                      </TableCell>
                      <TableCell>{batch.batchCountry?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{batch.associatedGroup?.name}</span>
                          {batch.associatedGroup?.status === "ACTIVE" ? (
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDisplayDate(batch.start_date)}</TableCell>
                      <TableCell>{formatDisplayDate(batch.end_date)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-spyder-teal text-white hover:bg-spyder-teal/80"
                          onClick={() => handleScrapeClick(batch.id)}
                          disabled={scrapeMutation.isPending}
                        >
                          {scrapeMutation.isPending ? 'Scraping...' : 'Scrape Ads'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {batches?.spyderBatches?.pagination && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={batches.spyderBatches.pagination.totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>

        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Configuration</DialogTitle>
              <DialogDescription>
                Choose a configuration to use for scraping ads
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {configs?.spyderConfigs.items.map((config) => (
                <Button
                  key={config.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleConfigSelect(config.id)}
                >
                  {config.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BatchPage;
