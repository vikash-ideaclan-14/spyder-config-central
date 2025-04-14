import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, Calendar, Plus, Pencil, Trash2 } from 'lucide-react';
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
import DashboardLayout from '@/components/layout/DashboardLayout';
import { configApi, SpyderConfig } from '@/services/api';

const ConfigPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SpyderConfig | null>(null);
  const [newConfig, setNewConfig] = useState({
    name: '',
    cookie: '',
    asbd_id: '',
    lsd: '',
    doc_id_1: '',
    doc_id_2: '',
    raw_data: '',
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['spyderConfigs'],
    queryFn: configApi.getConfigs,
  });

  const createMutation = useMutation({
    mutationFn: configApi.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spyderConfigs'] });
      setIsCreateDialogOpen(false);
      setNewConfig({
        name: '',
        cookie: '',
        asbd_id: '',
        lsd: '',
        doc_id_1: '',
        doc_id_2: '',
        raw_data: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => configApi.updateConfig(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spyderConfigs'] });
      setIsEditDialogOpen(false);
      setSelectedConfig(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: configApi.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spyderConfigs'] });
    },
  });

  const handleCreateConfig = () => {
    createMutation.mutate(newConfig);
  };

  const handleUpdateConfig = () => {
    if (selectedConfig) {
      updateMutation.mutate({ id: selectedConfig.id, input: newConfig });
    }
  };

  const handleDeleteConfig = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditClick = (config: SpyderConfig) => {
    setSelectedConfig(config);
    setNewConfig({
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

  const filteredConfigs = data?.items.filter(config => 
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.cookie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.asbd_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: string | number) => {
    const timeInMs = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return new Date(timeInMs).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Spyder Configurations</h1>
              <p className="text-muted-foreground">
                Manage and track all spyder configurations
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Input
                      placeholder="Name"
                      value={newConfig.name}
                      onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                    />
                    <Input
                      placeholder="Cookie"
                      value={newConfig.cookie}
                      onChange={(e) => setNewConfig({ ...newConfig, cookie: e.target.value })}
                    />
                    <Input
                      placeholder="ASBD ID"
                      value={newConfig.asbd_id}
                      onChange={(e) => setNewConfig({ ...newConfig, asbd_id: e.target.value })}
                    />
                    <Input
                      placeholder="LSD"
                      value={newConfig.lsd}
                      onChange={(e) => setNewConfig({ ...newConfig, lsd: e.target.value })}
                    />
                    <Input
                      placeholder="Doc ID 1"
                      value={newConfig.doc_id_1}
                      onChange={(e) => setNewConfig({ ...newConfig, doc_id_1: e.target.value })}
                    />
                    <Input
                      placeholder="Doc ID 2"
                      value={newConfig.doc_id_2}
                      onChange={(e) => setNewConfig({ ...newConfig, doc_id_2: e.target.value })}
                    />
                    <Input
                      placeholder="Raw Data"
                      value={newConfig.raw_data}
                      onChange={(e) => setNewConfig({ ...newConfig, raw_data: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCreateConfig}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Config'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="flex-grow flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>All Configurations</CardTitle>
              <CardDescription>
                View and manage your spyder configurations
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
            <CardContent className="flex-grow p-0">
              {isLoading ? (
                <div className="text-center py-10">Loading configurations...</div>
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
                        <TableRow key={config.id} className="h-16">
                          <TableCell className="font-medium whitespace-nowrap">{config.name}</TableCell>
                          <TableCell className="max-w-[250px] truncate" title={config.cookie}>
                            {config.cookie}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{config.asbd_id}</TableCell>
                          <TableCell className="whitespace-nowrap">{config.lsd}</TableCell>
                          <TableCell className="whitespace-nowrap">{config.doc_id_1}</TableCell>
                          <TableCell className="whitespace-nowrap">{config.doc_id_2}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(config.createdAt)}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatDate(config.updatedAt)}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </div>

        {data?.pagination && (
          <div className="mt-4 py-4 border-t bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center max-w-full px-4">
              <div className="text-sm text-muted-foreground">
                Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total items)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasPreviousPage}
                  onClick={() => {/* Add pagination handling */}}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => {/* Add pagination handling */}}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                value={newConfig.name}
                onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
              />
              <Input
                placeholder="Cookie"
                value={newConfig.cookie}
                onChange={(e) => setNewConfig({ ...newConfig, cookie: e.target.value })}
              />
              <Input
                placeholder="ASBD ID"
                value={newConfig.asbd_id}
                onChange={(e) => setNewConfig({ ...newConfig, asbd_id: e.target.value })}
              />
              <Input
                placeholder="LSD"
                value={newConfig.lsd}
                onChange={(e) => setNewConfig({ ...newConfig, lsd: e.target.value })}
              />
              <Input
                placeholder="Doc ID 1"
                value={newConfig.doc_id_1}
                onChange={(e) => setNewConfig({ ...newConfig, doc_id_1: e.target.value })}
              />
              <Input
                placeholder="Doc ID 2"
                value={newConfig.doc_id_2}
                onChange={(e) => setNewConfig({ ...newConfig, doc_id_2: e.target.value })}
              />
              <Input
                placeholder="Raw Data"
                value={newConfig.raw_data}
                onChange={(e) => setNewConfig({ ...newConfig, raw_data: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdateConfig}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Config'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ConfigPage;