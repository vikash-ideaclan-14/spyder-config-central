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
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader,
  Pencil,
  Plus,
  SearchX,
  Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/utils';
import { SpyderGroup, companyApi, domainApi, groupApi, vendorApi } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { setError, setLoading } from '@/store/slices/configSlice';
import { createGroupData, setGroups, updateGroupData } from '@/store/slices/groupSlice';

type GroupFormValues = {
  name: string;
  status: string;
  companyIds: string[];
  vendorIds: string[];
  domainIds: string[];
};

const groupFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  companyIds: z.array(z.string()).min(1, "At least one company is required"),
  vendorIds: z.array(z.string()).min(1, "At least one vendor is required"),
  domainIds: z.array(z.string()).min(1, "At least one domain is required"),
});

const SpyderGroupPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { groupsData, loading, error } = useAppSelector((state) => state.group);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SpyderGroup | null>(null);
  const queryClient = useQueryClient();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, pageInput, handlePageInputChange, handlePageInputSubmit } = usePagination();


  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyApi.getCompanies(1, 100),
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorApi.getVendors(1, 100),
  });

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => domainApi.getDomains(1, 100),
  });

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
      companyIds: [],
      vendorIds: [],
      domainIds: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: GroupFormValues) => groupApi.createGroup(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreateDialogOpen(false);
      form.reset({
        name: "",
        status: "ACTIVE",
        companyIds: [],
        vendorIds: [],
        domainIds: []
      });
      toast.success('Group created successfully');
    },
    onError: (error) => {
      console.error('Create group error:', error);
      toast.error('Failed to create group');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete group');
    },
  });

  const editMutation = useMutation({
    mutationFn: (values: GroupFormValues) => groupApi.updateGroup(selectedGroup?.id || '', values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      form.reset({
        name: "",
        status: "ACTIVE",
        companyIds: [],
        vendorIds: [],
        domainIds: []
      });
      toast.success('Group updated successfully');
    },
    onError: () => {
      toast.error('Failed to update group');
    },
  });

  const onSubmit = async (values: GroupFormValues) => {
    if (selectedGroup) {
      dispatch(setLoading(true));
      dispatch(updateGroupData({
        name: values.name,
        status: values.status,
        companyIds: values.companyIds,
        vendorIds: values.vendorIds,
        domainIds: values.domainIds
      }));
      dispatch(setLoading(false));
      setIsEditDialogOpen(false);
    } else {
      dispatch(setLoading(true));
      dispatch(createGroupData(values));
      dispatch(setLoading(false));
      setIsCreateDialogOpen(false);
      toast.success('Group created successfully');
      form.reset({
        name: "",
        status: "ACTIVE",
        companyIds: [],
        vendorIds: [],
        domainIds: []
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (group: SpyderGroup) => {
    setSelectedGroup(group);
    form.reset({
      name: group.name,
      status: group.status,
      companyIds: [group.company?.id].filter(Boolean) as string[],
      vendorIds: [group.vendor?.id].filter(Boolean) as string[],
      domainIds: group.domains?.map(d => d.id) || [],
    });
    setIsEditDialogOpen(true);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const [groupsData] = await Promise.all([
          groupApi.getGroups(1, 100),
        ]);
        dispatch(setGroups(groupsData));
      } catch (error) {
        dispatch(setError('Failed to fetch data'));
        toast.error('Failed to fetch data');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [currentPage, pageSize, dispatch]);


  const filteredGroups = groupsData?.spyedGroups.items.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Spyder Groups</h1>
              <p className="text-muted-foreground">
                Manage and monitor spyder groups
              </p>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new spyder group.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter group name" {...field} />
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
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Companies</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange([...field.value, value])}
                            value={field.value[field.value.length - 1]}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select companies" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies?.companies.items.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
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
                      name="vendorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendors</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange([...field.value, value])}
                            value={field.value[field.value.length - 1]}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vendors" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendors?.vendors.items.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id}>
                                  {vendor.name}
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
                      name="domainIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domains</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              if (field.value.includes(value)) {
                                field.onChange(field.value.filter(id => id !== value));
                              } else {
                                field.onChange([...field.value, value]);
                              }
                            }}
                            value=""
                          >
                            <FormControl>
                              <SelectTrigger>
                                <div className="flex flex-wrap gap-1">
                                  {field.value.length === 0 ? (
                                    <SelectValue placeholder="Select domains" />
                                  ) : (
                                    <span className="text-sm">
                                      {field.value.map((id) => {
                                        const domain = domains?.domains.items.find((d) => d.id === id);
                                        return domain ? domain.domain : '';
                                      }).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {domains?.domains.items.map((domain) => (
                                <div
                                  key={domain.id}
                                  className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    if (field.value.includes(domain.id)) {
                                      field.onChange(field.value.filter(id => id !== domain.id));
                                    } else {
                                      field.onChange([...field.value, domain.id]);
                                    }
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={field.value.includes(domain.id)}
                                    readOnly
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <span>{domain.domain}</span>
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Group'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <SearchX className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin" />
              <p className="ml-2">Loading groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No groups found</h3>
                <p className="text-muted-foreground mb-6">
                  No groups match your current search
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Domains</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          <Badge variant={group.status === "ACTIVE" ? "default" : "secondary"}>
                            {group.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{group.company?.name || '-'}</TableCell>
                        <TableCell>{group.vendor?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.domains?.map(domain => (
                              <Badge key={domain.id} variant="outline" className="text-xs">
                                {domain.domain}
                              </Badge>
                            ))}
                            {(!group.domains || group.domains.length === 0) && '-'}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(parseInt(group.createdAt))}</TableCell>
                        <TableCell>{formatDate(parseInt(group.updatedAt))}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(group)}
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
                                    This action cannot be undone. This will permanently delete the group.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(group.id)}
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

              {groupsData?.spyedGroups?.pagination && (
                <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border rounded-md p-4 shadow-lg mt-6">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {groupsData.spyedGroups.pagination.totalPages}
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
                        disabled={currentPage >= groupsData.spyedGroups.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the details for this spyder group.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
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
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Companies</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select companies" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.companies.items.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
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
                name="vendorIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendors</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([...field.value, value])}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendors" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors?.vendors.items.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
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
                name="domainIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domains</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (field.value.includes(value)) {
                          field.onChange(field.value.filter(id => id !== value));
                        } else {
                          field.onChange([...field.value, value]);
                        }
                      }}
                      value=""
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex flex-wrap gap-1">
                            {field.value.length === 0 ? (
                              <SelectValue placeholder="Select domains" />
                            ) : (
                              <span className="text-sm">
                                {field.value.length} domains selected
                              </span>
                            )}
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {domains?.domains.items.map((domain) => (
                          <div
                            key={domain.id}
                            className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              if (field.value.includes(domain.id)) {
                                field.onChange(field.value.filter(id => id !== domain.id));
                              } else {
                                field.onChange([...field.value, domain.id]);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={field.value.includes(domain.id)}
                              readOnly
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span>{domain.domain}</span>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Updating...' : 'Update Group'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SpyderGroupPage; 