import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, X, Calendar, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { configApi, SpyderConfig } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader } from '@/components/ui/loader';

const configFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  cookie: z.string().min(1, "Cookie is required"),
  asbd_id: z.string().min(1, "ASBD ID is required"),
  lsd: z.string().min(1, "LSD is required"),
  doc_id_1: z.string().min(1, "Doc ID 1 is required"),
  doc_id_2: z.string().min(1, "Doc ID 2 is required"),
  raw_data: z.string().min(1, "Raw data is required"),
});

type ConfigFormValues = {
  name: string;
  cookie: string;
  asbd_id: string;
  lsd: string;
  doc_id_1: string;
  doc_id_2: string;
  raw_data: string;
};

const ConfigPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<SpyderConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pageInput, setPageInput] = useState('');

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      name: "",
      cookie: "",
      asbd_id: "",
      lsd: "",
      doc_id_1: "",
      doc_id_2: "",
      raw_data: "",
    },
  });

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['configs', currentPage, pageSize],
    queryFn: () => configApi.getConfigs(currentPage, pageSize),
  });

  const createMutation = useMutation({
    mutationFn: (values: ConfigFormValues) => configApi.createConfig(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsDialogOpen(false);
      form.reset();
      toast.success('Config created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create config');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConfigFormValues }) => 
      configApi.updateConfig(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsEditDialogOpen(false);
      setSelectedConfig(null);
      toast.success('Config updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update config');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => configApi.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsDeleteDialogOpen(false);
      setSelectedConfig(null);
      toast.success('Config deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete config');
    }
  });

  // Clear validation warnings after 5 seconds
  const clearValidationWarnings = () => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    const timeout = setTimeout(() => {
      form.clearErrors();
    }, 3000);
    setValidationTimeout(timeout);
  };

  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.reset();
      form.clearErrors();
      if (validationTimeout) {
        clearTimeout(validationTimeout);
        setValidationTimeout(null);
      }
    }
  };

  // Handle edit dialog open/close
  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      form.reset();
      form.clearErrors();
      if (validationTimeout) {
        clearTimeout(validationTimeout);
        setValidationTimeout(null);
      }
    }
  };

  // Watch for form changes to trigger validation clearing
  React.useEffect(() => {
    const subscription = form.watch(() => {
      clearValidationWarnings();
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const handleCreateConfig = (values: ConfigFormValues) => {
    createMutation.mutate(values);
  };

  const handleUpdateConfig = (values: ConfigFormValues) => {
    if (selectedConfig) {
      updateMutation.mutate({ id: selectedConfig.id, input: values });
    }
  };

  const handleDeleteConfig = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditClick = (config: SpyderConfig) => {
    setSelectedConfig(config);
    form.reset({
      name: config.name,
      cookie: config.cookie,
      asbd_id: config.asbd_id,
      lsd: config.lsd,
      doc_id_1: config.doc_id_1,
      doc_id_2: config.doc_id_2,
      raw_data: config.raw_data,
    });
    setIsEditDialogOpen(true);
  };

  const filteredConfigs = data?.spyderConfigs.items.filter(config => 
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.cookie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.asbd_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.lsd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.doc_id_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.doc_id_2.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = Number(pageInput);
      if (!isNaN(page) && page > 0 && page <= data?.spyderConfigs.pagination.totalPages) {
        handlePageChange(page);
      }
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-10 text-red-500">
          Error loading configurations. Please check your connection and try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
        <div className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Spyder Configurations</h1>
              <p className="text-muted-foreground">
                Manage and track all spyder configurations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-spyder-teal hover:bg-spyder-teal/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Config
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Config</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your new spyder configuration.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateConfig)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter config name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cookie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cookie</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter cookie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="asbd_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ASBD ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ASBD ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lsd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LSD</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter LSD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="doc_id_1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doc ID 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Doc ID 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="doc_id_2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doc ID 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Doc ID 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="raw_data"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raw Data</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter raw data" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="bg-spyder-teal hover:bg-spyder-teal/90"
                      >
                        {createMutation.isPending ? 'Creating...' : 'Create Config'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="flex-grow flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>All Configurations</CardTitle>
              <CardDescription>
                View and manage your spyder configurations
              </CardDescription>
              <div className="relative mt-2 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search configurations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-0">
              {isLoading ? (
                <Loader className="min-h-[calc(100vh-4rem)]" size="lg" />
              ) : filteredConfigs?.length === 0 ? (
                <div className="text-center py-10">
                  No configurations found
                  {searchTerm && (
                    <div className="mt-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSearchTerm('')}
                        className="text-spyder-teal"
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border h-full overflow-auto">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="w-[250px]">Cookie</TableHead>
                          <TableHead className="w-[150px]">ASBD ID</TableHead>
                          <TableHead className="w-[150px]">LSD</TableHead>
                          <TableHead className="w-[150px]">Doc ID 1</TableHead>
                          <TableHead className="w-[150px]">Doc ID 2</TableHead>
                          <TableHead className="w-[180px]">Created At</TableHead>
                          <TableHead className="w-[180px]">Updated At</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConfigs?.map((config) => (
                          <TableRow key={config.id} className="h-16 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="font-medium whitespace-nowrap">{config.name}</TableCell>
                            <TableCell className="max-w-[250px] truncate" title={config.cookie}>
                              {config.cookie}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{config.asbd_id}</TableCell>
                            <TableCell className="whitespace-nowrap">{config.lsd}</TableCell>
                            <TableCell className="whitespace-nowrap">{config.doc_id_1}</TableCell>
                            <TableCell className="whitespace-nowrap">{config.doc_id_2}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {config.createdAt ? formatDate(parseInt(config.createdAt)) : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {config.updatedAt ? formatDate(parseInt(config.updatedAt)) : 'N/A'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(config)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the configuration.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteConfig(config.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {data?.spyderConfigs?.pagination && (
          <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {data.spyderConfigs.pagination.totalPages}
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
                  disabled={currentPage >= data.spyderConfigs.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Config</DialogTitle>
              <DialogDescription>
                Update the details for your spyder configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  placeholder="Name"
                  value={form.getValues('name')}
                  onChange={(e) => form.setValue('name', e.target.value)}
                />
                <Input
                  placeholder="Cookie"
                  value={form.getValues('cookie')}
                  onChange={(e) => form.setValue('cookie', e.target.value)}
                />
                <Input
                  placeholder="ASBD ID"
                  value={form.getValues('asbd_id')}
                  onChange={(e) => form.setValue('asbd_id', e.target.value)}
                />
                <Input
                  placeholder="LSD"
                  value={form.getValues('lsd')}
                  onChange={(e) => form.setValue('lsd', e.target.value)}
                />
                <Input
                  placeholder="Doc ID 1"
                  value={form.getValues('doc_id_1')}
                  onChange={(e) => form.setValue('doc_id_1', e.target.value)}
                />
                <Input
                  placeholder="Doc ID 2"
                  value={form.getValues('doc_id_2')}
                  onChange={(e) => form.setValue('doc_id_2', e.target.value)}
                />
                <Input
                  placeholder="Raw Data"
                  value={form.getValues('raw_data')}
                  onChange={(e) => form.setValue('raw_data', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateMutation.mutate({ id: selectedConfig.id, input: form.getValues() })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Config</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this config? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedConfig?.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ConfigPage;