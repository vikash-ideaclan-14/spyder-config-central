import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Search, Loader, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { miscellaneousApi, Vendor, Company, Domain, companyApi, domainApi } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

const vendorFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
});

const companyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

const domainFormSchema = z.object({
  domain: z.string().min(1, "Domain is required").max(255, "Domain must be less than 255 characters"),
  companyId: z.string().min(1, "Company is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  type: z.string().min(1, "Type is required"),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;
type CompanyFormValues = z.infer<typeof companyFormSchema>;
type DomainFormValues = z.infer<typeof domainFormSchema>;

const MiscellaneousPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, pageInput, handlePageInputChange, handlePageInputSubmit } = usePagination();

  // Vendor Form
  const vendorCreateForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Active'
    }
  });

  const vendorEditForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Active'
    }
  });

  // Company Form
  const companyCreateForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const companyEditForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  // Domain Form
  const domainCreateForm = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain: '',
      companyId: '',
      vendorId: '',
      type: 'Active'
    }
  });

  const domainEditForm = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain: '',
      companyId: '',
      vendorId: '',
      type: 'Active'
    }
  });

  // Queries
  const { data: vendorsData, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors', currentPage, pageSize],
    queryFn: () => miscellaneousApi.getVendors(currentPage, pageSize),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', currentPage, pageSize],
    queryFn: () => companyApi.getCompanies(currentPage, pageSize),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: domainsData, isLoading: isLoadingDomains } = useQuery({
    queryKey: ['domains', currentPage, pageSize],
    queryFn: () => domainApi.getDomains(currentPage, pageSize),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Vendor mutations
  const createVendorMutation = useMutation({
    mutationFn: (values: VendorFormValues) => miscellaneousApi.createVendor({
      name: values.name,
      description: values.description || '',
      type: values.type,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsCreateDialogOpen(false);
      vendorCreateForm.reset();
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create vendor');
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: VendorFormValues }) => 
      miscellaneousApi.updateVendor(id, {
        name: input.name,
        description: input.description || '',
        type: input.type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsEditDialogOpen(false);
      setSelectedVendor(null);
      toast.success('Vendor updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update vendor');
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => miscellaneousApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete vendor');
    }
  });

  // Company mutations
  const createCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => miscellaneousApi.createCompany({
      name: values.name,
      description: values.description,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCreateDialogOpen(false);
      companyCreateForm.reset();
      toast.success('Company created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create company');
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyFormValues }) => 
      miscellaneousApi.updateCompany(id, {
        name: input.name,
        description: input.description,
      }),
    onSuccess: () => {
      console.log('Company updated successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      companyEditForm.reset();
      toast.success('Company updated successfully');
    },
    onError: (error) => {
      console.log('Failed to update company', error);
      toast.error('Failed to update company');
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => miscellaneousApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete company');
    }
  });

  // Domain mutations
  const createDomainMutation = useMutation({
    mutationFn: (values: DomainFormValues) => miscellaneousApi.createDomain({
      domain: values.domain,
      companyId: values.companyId,
      vendorId: values.vendorId,
      type: values.type,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setIsCreateDialogOpen(false);
      domainCreateForm.reset();
      toast.success('Domain created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create domain');
    }
  });

  const updateDomainMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: DomainFormValues }) => 
      miscellaneousApi.updateDomain(id, {
        domain: input.domain,
        companyId: input.companyId,
        vendorId: input.vendorId,
        type: input.type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setIsEditDialogOpen(false);
      setSelectedDomain(null);
      toast.success('Domain updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update domain');
    }
  });

  const deleteDomainMutation = useMutation({
    mutationFn: (id: string) => miscellaneousApi.deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete domain');
    }
  });

  // Handlers
  const handleCreateVendor = (values: VendorFormValues) => {
    createVendorMutation.mutate(values);
  };

  const handleEditVendor = (values: VendorFormValues) => {
    if (selectedVendor) {
      updateVendorMutation.mutate({ id: selectedVendor.id, input: values });
    }
  };

  const handleCreateCompany = (values: CompanyFormValues) => {
    createCompanyMutation.mutate(values);
  };

  const handleEditCompany = (values: CompanyFormValues) => {
    if (selectedCompany) {
      updateCompanyMutation.mutate({ id: selectedCompany.id, input: values });
    }
  };

  const handleCreateDomain = (values: DomainFormValues) => {
    createDomainMutation.mutate(values);
  };

  const handleEditDomain = (values: DomainFormValues) => {
    if (selectedDomain) {
      updateDomainMutation.mutate({ id: selectedDomain.id, input: values });
    }
  };

  const handleEditClick = (item: Vendor | Company | Domain) => {
    // Reset all selected items first
    setSelectedVendor(null);
    setSelectedCompany(null);
    setSelectedDomain(null);

    if ('type' in item && !('domain' in item)) {
      // Handle vendor edit
      const vendorItem = item as Vendor;
      setSelectedVendor(vendorItem);
      vendorEditForm.reset({
        name: vendorItem.name,
        description: vendorItem.description || '',
        type: vendorItem.type
      });
    } else if ('domain' in item) {
      // Handle domain edit
      const domainItem = item as Domain;
      setSelectedDomain(domainItem);
      domainEditForm.reset({
        domain: domainItem.domain,
        companyId: domainItem.domainCompany?.id || '',
        vendorId: domainItem.domainVendor?.id || '',
        type: domainItem.domainVendor?.type || 'Active'
      });
    } else {
      // Handle company edit
      const companyItem = item as Company;
      setSelectedCompany(companyItem);
      companyEditForm.reset({
        name: companyItem.name,
        description: companyItem.description || ''
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string, type: 'vendor' | 'company' | 'domain') => {
    switch (type) {
      case 'vendor':
        deleteVendorMutation.mutate(id);
        break;
      case 'company':
        deleteCompanyMutation.mutate(id);
        break;
      case 'domain':
        deleteDomainMutation.mutate(id);
        break;
    }
  };

  // Filtered data
  const filteredVendors = vendorsData?.vendors.items.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCompanies = companiesData?.companies.items.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredDomains = domainsData?.domains.items.filter(domain => 
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.domainCompany?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.domainVendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
        <div className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Miscellaneous</h1>
              <p className="text-muted-foreground">
                Manage vendors, companies, and domains
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="domains">Domains</TabsTrigger>
            </TabsList>

            <TabsContent value="vendors">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create Vendor</DialogTitle>
                        <DialogDescription>
                          Add a new vendor to your system
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...vendorCreateForm}>
                        <form onSubmit={vendorCreateForm.handleSubmit(handleCreateVendor)} className="space-y-4">
                          <FormField
                            control={vendorCreateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter vendor name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorCreateForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter vendor description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vendorCreateForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select vendor type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={createVendorMutation.isPending}>
                              {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Card>
                  <CardContent className="p-0">
                    {isLoadingVendors ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader className="h-8 w-8 animate-spin" />
                      </div>
                    ) : filteredVendors.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Updated At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredVendors.map((vendor) => (
                              <TableRow key={vendor.id}>
                                <TableCell className="font-medium">{vendor.name}</TableCell>
                                <TableCell>{vendor.description || '-'}</TableCell>
                                <TableCell>{vendor.type}</TableCell>
                                <TableCell>{formatDate(parseInt(vendor.createdAt))}</TableCell>
                                <TableCell>{formatDate(parseInt(vendor.updatedAt))}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditClick(vendor)}
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
                                            This action cannot be undone. This will permanently delete the vendor.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteClick(vendor.id, 'vendor')}
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
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground">No vendors found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="companies">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Company
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create Company</DialogTitle>
                        <DialogDescription>
                          Add a new company to your system
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...companyCreateForm}>
                        <form onSubmit={companyCreateForm.handleSubmit(handleCreateCompany)} className="space-y-4">
                          <FormField
                            control={companyCreateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={companyCreateForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter company description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={createCompanyMutation.isPending}>
                              {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Card>
                  <CardContent className="p-0">
                    {isLoadingCompanies ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader className="h-8 w-8 animate-spin" />
                      </div>
                    ) : filteredCompanies.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Updated At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCompanies.map((company) => (
                              <TableRow key={company.id}>
                                <TableCell className="font-medium">{company.name}</TableCell>
                                <TableCell>{company.description}</TableCell>
                                <TableCell>{formatDate(parseInt(company.createdAt))}</TableCell>
                                <TableCell>{formatDate(parseInt(company.updatedAt))}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditClick(company)}
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
                                            This action cannot be undone. This will permanently delete the company.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteClick(company.id, 'company')}
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
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <p className="text-muted-foreground">No companies found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="domains">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search domains..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Domain
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create Domain</DialogTitle>
                        <DialogDescription>
                          Add a new domain to the system.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...domainCreateForm}>
                        <form onSubmit={domainCreateForm.handleSubmit(handleCreateDomain)} className="space-y-4">
                          <FormField
                            control={domainCreateForm.control}
                            name="domain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Domain</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter domain" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={domainCreateForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {companiesData?.companies.items.map((company) => (
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
                            control={domainCreateForm.control}
                            name="vendorId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vendor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {vendorsData?.vendors.items.map((vendor) => (
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
                            control={domainCreateForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={createDomainMutation.isPending}>
                              {createDomainMutation.isPending ? 'Creating...' : 'Create Domain'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDomains.map((domain) => (
                        <TableRow key={domain.id}>
                          <TableCell className="font-medium">{domain.domain}</TableCell>
                          <TableCell>{domain.domainCompany?.name || '-'}</TableCell>
                          <TableCell>{domain.domainVendor?.name || '-'}</TableCell>
                          <TableCell>{domain.type || '-'}</TableCell>
                          <TableCell>{formatDate(parseInt(domain.createdAt))}</TableCell>
                          <TableCell>{formatDate(parseInt(domain.updatedAt))}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(domain)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the domain.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteClick(domain.id, 'domain')}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditDialogOpen && selectedVendor !== null} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the details for this vendor.
            </DialogDescription>
          </DialogHeader>
          <Form {...vendorEditForm}>
            <form onSubmit={vendorEditForm.handleSubmit(handleEditVendor)} className="space-y-4">
              <FormField
                control={vendorEditForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vendorEditForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter vendor description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vendorEditForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateVendorMutation.isPending}>
                  {updateVendorMutation.isPending ? 'Updating...' : 'Update Vendor'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen && selectedCompany !== null} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...companyEditForm}>
            <form onSubmit={companyEditForm.handleSubmit(handleEditCompany)} className="space-y-4">
              <FormField
                control={companyEditForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyEditForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter company description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? 'Updating...' : 'Update Company'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen && selectedDomain !== null} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Update the details for this domain.
            </DialogDescription>
          </DialogHeader>
          <Form {...domainEditForm}>
            <form onSubmit={domainEditForm.handleSubmit(handleEditDomain)} className="space-y-4">
              <FormField
                control={domainEditForm.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter domain" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={domainEditForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companiesData?.companies.items.map((company) => (
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
                control={domainEditForm.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendorsData?.vendors.items.map((vendor) => (
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
                control={domainEditForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateDomainMutation.isPending}>
                  {updateDomainMutation.isPending ? 'Updating...' : 'Update Domain'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MiscellaneousPage; 