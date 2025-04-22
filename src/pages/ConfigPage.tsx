import React, { useEffect, useState } from 'react';
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
import { setBatches, setError } from '@/store/slices/batchSlice';
import { setLoading } from '@/store/slices/batchSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { createConfig, deleteConfig, deleteConfigById, fetchConfigById, setConfigs, setSelectedConfig, updateConfigById } from '@/store/slices/configSlice';

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
  id?: string;
  name: string;
  cookie: string;
  asbd_id: string;
  lsd: string;
  doc_id_1: string;
  doc_id_2: string;
  raw_data: string;
};

type FormMode = 'create' | 'edit';

const ConfigPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { configs } = useAppSelector((state) => state.config);
  const { selectedConfig } = useAppSelector((state) => state.config);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pageInput, setPageInput] = useState('');
  const [formMode, setFormMode] = useState<FormMode>('create');

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      id: '',
      name: '',
      cookie: '',
      asbd_id: '',
      lsd: '',
      doc_id_1: '',
      doc_id_2: '',
      raw_data: ''
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
      setIsDialogOpen(false);
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
      setFormMode('create');
      dispatch(setSelectedConfig(null));
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const [configsData] = await Promise.all([
          configApi.getConfigs(1, 100),
        ]);
        dispatch(setConfigs(configsData.spyderConfigs.items));
      } catch (error) {
        dispatch(setError('Failed to fetch data'));
        toast.error('Failed to fetch data');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [currentPage, pageSize, dispatch]);

  useEffect(() => {
    if (selectedConfig && formMode === 'edit') {
      form.reset({
        id: selectedConfig.id,
        name: selectedConfig.name,
        cookie: selectedConfig.cookie,
        asbd_id: selectedConfig.asbd_id,
        lsd: selectedConfig.lsd,
        doc_id_1: selectedConfig.doc_id_1,
        doc_id_2: selectedConfig.doc_id_2,
        raw_data: selectedConfig.raw_data
      });
    }
  }, [selectedConfig, form, formMode]);

  const handleConfigSubmit = async (values: ConfigFormValues) => {
    try {
      dispatch(setLoading(true));
      if (formMode === 'create') {
        await dispatch(createConfig({
          name: values.name,
          cookie: values.cookie,
          asbd_id: values.asbd_id,
          lsd: values.lsd,
          doc_id_1: values.doc_id_1,
          doc_id_2: values.doc_id_2,
          raw_data: values.raw_data
        }));
      } else if (formMode === 'edit' && values.id) {
        await dispatch(updateConfigById(values.id, {
          name: values.name,
          cookie: values.cookie,
          asbd_id: values.asbd_id,
          lsd: values.lsd,
          doc_id_1: values.doc_id_1,
          doc_id_2: values.doc_id_2,
          raw_data: values.raw_data
        }));
      }
      dispatch(setLoading(false));
      setIsDialogOpen(false);
      form.reset();
      toast.success(`Config ${formMode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      dispatch(setLoading(false));
      toast.error(`Failed to ${formMode === 'create' ? 'create' : 'update'} config`);
    }
  };

  const handleEditConfig = (config: SpyderConfig) => {
    setFormMode('edit');
    dispatch(setSelectedConfig(config));
    form.reset({
      id: config.id,
      name: config.name,
      cookie: config.cookie,
      asbd_id: config.asbd_id,
      lsd: config.lsd,
      doc_id_1: config.doc_id_1,
      doc_id_2: config.doc_id_2,
      raw_data: config.raw_data
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfig = async (id: string) => {
    dispatch(setLoading(true));
    await dispatch(deleteConfigById(id));
    dispatch(setLoading(false));
  };

  const filteredConfigs = configs?.filter(config =>
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
                <Button 
                  className="bg-spyder-teal hover:bg-spyder-teal/90"
                  onClick={() => {
                    setFormMode('create');
                    form.reset({
                      id: '',
                      name: '',
                      cookie: '',
                      asbd_id: '',
                      lsd: '',
                      doc_id_1: '',
                      doc_id_2: '',
                      raw_data: ''
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Config
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{formMode === 'create' ? 'Create New Config' : 'Edit Config'}</DialogTitle>
                  <DialogDescription>
                    {formMode === 'create' 
                      ? 'Fill in the details for your new spyder configuration.'
                      : 'Update the details for your spyder configuration.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleConfigSubmit)} className="space-y-4">
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
                        disabled={isLoading}
                        className="bg-spyder-teal hover:bg-spyder-teal/90"
                      >
                        {isLoading 
                          ? (formMode === 'create' ? 'Creating...' : 'Updating...')
                          : (formMode === 'create' ? 'Create Config' : 'Update Config')}
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
                                  onClick={() => handleEditConfig(config)}
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
      </div>
    </DashboardLayout>
  );
};

export default ConfigPage;