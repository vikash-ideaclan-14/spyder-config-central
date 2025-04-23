import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  Filter,
  Loader,
  Plus,
  SearchX
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { batchApi, SpyderBatch, CreateSpyderBatchInput } from '@/services/api';
import {
  setBatches,
  setLoading,
  setError,
  addBatch,
  deleteBatch,
} from '@/store/slices/batchSlice';
import { usePagination } from '@/hooks/usePagination';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const dispatch = useAppDispatch();
  const { batches, loading, pagination } = useAppSelector((state) => state.batch);
  const { configs } = useAppSelector((state) => state.config);
  const [selectedStatus, setSelectedStatus] = useState<SpyderBatch['status'] | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, pageInput, handlePageInputChange, handlePageInputSubmit } = usePagination();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const [batchesData] = await Promise.all([
          batchApi.getBatches({ pagination: { page: currentPage, pageSize } }),
        ]);
        dispatch(setBatches({
          items: batchesData.spyderBatches.items,
          pagination: {
            currentPage: batchesData.spyderBatches.pagination.page,
            pageSize: batchesData.spyderBatches.pagination.pageSize,
            totalPages: batchesData.spyderBatches.pagination.totalPages,
            totalItems: batchesData.spyderBatches.pagination.total || 0,
          },
        }));
      } catch (error) {
        dispatch(setError('Failed to fetch data'));
        toast.error('Failed to fetch data');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [currentPage, pageSize, dispatch]);

  const filteredBatches = batches.filter(batch =>
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
    onSuccess: (data) => {
      dispatch(addBatch(data));
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
      // Convert timestamp strings to ISO format for the server
      const startDate = new Date(parseInt(values.startDate)).toISOString();
      const endDate = new Date(parseInt(values.endDate)).toISOString();

      const input: CreateSpyderBatchInput = {
        countryId: values.countryId,
        endDate: endDate,
        spyderGroupId: values.spyderGroupId,
        startDate: startDate,
        status: values.status
      };

      await createMutation.mutateAsync(input);
    } catch (error) {
      toast.error("Failed to create batch");
      console.error("Create batch error:", error);
    }
  };

  const handleDeleteClick = (batchId: string) => {
    batchApi.deleteBatch(batchId);
    dispatch(deleteBatch(batchId));
    toast.success("Batch deleted successfully");
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
                                {filteredBatches?.map((batch) => (
                                  <SelectItem key={batch.batchCountry?.id} value={batch.batchCountry?.id}>
                                    {batch.batchCountry?.name}
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
                                {filteredBatches.map((batch) => (
                                  <SelectItem key={batch.associatedGroup?.id} value={batch.associatedGroup?.id}>
                                    {batch.associatedGroup?.name}
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
                                value={field.value ? new Date(parseInt(field.value)).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  field.onChange(date.getTime().toString());
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
                                value={field.value ? new Date(parseInt(field.value)).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  field.onChange(date.getTime().toString());
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
                                {/* <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem> */}
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

          {loading ? (
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
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-spyder-white text-red-500 hover:bg-spyder-white/80"
                          onClick={() => handleDeleteClick(batch.id)}
                        >
                          x
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && (
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <Input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputSubmit}
                    className="w-16 h-8 text-center"
                    placeholder="Page"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
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
              {configs.map((config) => (
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
