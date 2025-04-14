import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Config, configApi } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

const configFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  cookie: z.string().min(1, { message: 'Cookie is required' }),
  asbd_id: z.string().min(1, { message: 'asbdId is required' }),
  lsd: z.string().min(1, { message: 'Lsd is required' }),
  raw_data: z.string().min(1, { message: 'Raw Data is required' }),
  doc_id: z.string().min(1, { message: 'DocId is required' }),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

const ConfigPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: configs, isLoading } = useQuery({
    queryKey: ['configs'],
    queryFn: configApi.getConfigs,
  });

  const filteredConfigs = configs?.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.cookie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.asbd_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.lsd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.raw_data.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.doc_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      name: '',
      cookie: '',
      asbd_id: '',
      lsd: '',
      raw_data: '',
      doc_id: ''
    },
  });

  const resetForm = () => {
    form.reset({
      name: '',
      cookie: '',
      asbd_id: '',
      lsd: '',
      raw_data: '',
      doc_id: ''
    });
  };

  const createConfigMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => {
      return configApi.createConfig({
        name: data.name,
        cookie: data.cookie,
        asbd_id: data.asbd_id,
        lsd: data.lsd,
        raw_data: data.raw_data,
        doc_id: data.doc_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Configuration added successfully');
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfigFormValues }) =>
      configApi.updateConfig(id, {
        name: data.name,
        cookie: data.cookie,
        asbd_id: data.asbd_id,
        lsd: data.lsd,
        raw_data: data.raw_data,
        doc_id: data.doc_id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsEditDialogOpen(false);
      setSelectedConfig(null);
      toast.success('Configuration updated successfully');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: configApi.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      setIsDeleteDialogOpen(false);
      setSelectedConfig(null);
      toast.success('Configuration deleted successfully');
    },
  });

  const onAddSubmit = (data: ConfigFormValues) => {
    createConfigMutation.mutate(data);
  };

  const onEditSubmit = (data: ConfigFormValues) => {
    if (selectedConfig) {
      updateConfigMutation.mutate({
        id: selectedConfig.id,
        data,
      });
    }
  };

  const handleEditClick = (config: Config) => {
    setSelectedConfig(config);
    form.reset({
      name: config.name,
      cookie: config.cookie,
      asbd_id: config.asbd_id,
      lsd: config.lsd,
      raw_data: config.raw_data,
      doc_id: config.doc_id
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (config: Config) => {
    setSelectedConfig(config);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedConfig) {
      deleteConfigMutation.mutate(selectedConfig.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Configurations</h1>
            <p className="text-muted-foreground">
              Manage all system configurations from one place
            </p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }} className="bg-spyder-teal hover:bg-spyder-teal/90">
            <Plus className="mr-2 h-4 w-4" /> Add Configuration
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Configurations</CardTitle>
            <CardDescription>
              List of all system configurations and their values
            </CardDescription>
            <div className="relative mt-2">
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cookie</TableHead>
                  <TableHead className="hidden md:table-cell">AbsdId</TableHead>
                  <TableHead className="hidden md:table-cell">Lsd</TableHead>
                  <TableHead className="hidden md:table-cell">Raw Data</TableHead>
                  <TableHead className="hidden md:table-cell">Doc Id</TableHead>
                  <TableHead className="hidden md:table-cell">Created At</TableHead>
                  <TableHead className="hidden md:table-cell">Updated At</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      Loading configurations...
                    </TableCell>
                  </TableRow>
                ) : filteredConfigs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
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
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConfigs?.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell className="font-mono text-sm">{config.cookie}</TableCell>
                      <TableCell className="font-mono text-sm">{config.asbd_id}</TableCell>
                      <TableCell className="font-mono text-sm">{config.lsd}</TableCell>
                      <TableCell className="font-mono text-sm">{config.raw_data}</TableCell>
                      <TableCell className="font-mono text-sm">{config.doc_id}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(config.createdAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(config.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(config)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(config)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Configuration</DialogTitle>
            <DialogDescription>
              Add a new configuration to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-6 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
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
                    <FormLabel>Absd Id</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter asbdId" {...field} />
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
                    <FormLabel>lsd</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lsd" {...field} />
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
                      <Input placeholder="Enter Raw data" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doc_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doc Id</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter DocId" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-spyder-teal hover:bg-spyder-teal/90">
                  {createConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription>
              Update the configuration details. Make your changes and save.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Config name" {...field} />
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
                      <Input placeholder="Config value" {...field} />
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
                    <FormLabel>Absd Id</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description for this configuration"
                        {...field}
                      />
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
                    <FormLabel>Lsd</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description for this configuration"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="Optional description for this configuration"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doc_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doc Id</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional description for this configuration"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-spyder-teal hover:bg-spyder-teal/90">
                  {updateConfigMutation.isPending ? 'Updating...' : 'Update Configuration'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Configuration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">Configuration: {selectedConfig?.name}</p>
            {/* <p className="text-sm text-muted-foreground mt-1">{selectedConfig?.description || 'No description'}</p> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteConfigMutation.isPending}
            >
              {deleteConfigMutation.isPending ? 'Deleting...' : 'Delete Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ConfigPage;
