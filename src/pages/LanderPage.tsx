import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Loader, ExternalLink, BarChart2, Clock, Globe, Calendar, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { landerApi } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface LanderFormValues {
  lander_url: string;
  lander_domain: string;
  countryIds: string[];
}

const LanderPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLander, setSelectedLander] = useState<any>(null);
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, pageInput, handlePageInputChange, handlePageInputSubmit } = usePagination();
  const queryClient = useQueryClient();

  const form = useForm<LanderFormValues>({
    defaultValues: {
      lander_url: '',
      lander_domain: '',
      countryIds: [],
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['landers', currentPage, pageSize],
    queryFn: () => landerApi.getLanders(currentPage, pageSize),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const filteredLanders = data?.landers.items.filter(lander => 
    lander.lander_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lander.lander_domain.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const createMutation = useMutation({
    mutationFn: (values: LanderFormValues) => landerApi.createLander(values),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['landers'] });
      await queryClient.refetchQueries({ queryKey: ['landers'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success('Lander created successfully');
    },
    onError: (error) => {
      console.error('Create lander error:', error);
      toast.error('Failed to create lander');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => landerApi.deleteLander(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['landers'] });
      await queryClient.refetchQueries({ queryKey: ['landers'] });
      toast.success('Lander deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete lander');
    },
  });

  const editMutation = useMutation({
    mutationFn: (values: LanderFormValues) => landerApi.updateLander(selectedLander?.id || '', values),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['landers'] });
      await queryClient.refetchQueries({ queryKey: ['landers'] });
      setIsEditDialogOpen(false);
      setSelectedLander(null);
      form.reset();
      toast.success('Lander updated successfully');
    },
    onError: () => {
      toast.error('Failed to update lander');
    },
  });

  const onSubmit = (values: LanderFormValues) => {
    if (selectedLander) {
      editMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (lander: any) => {
    setSelectedLander(lander);
    form.reset({
      lander_url: lander.lander_url,
      lander_domain: lander.lander_domain,
      countryIds: lander.countries.map((c: any) => c.id),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
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
              <h1 className="text-2xl font-bold">Landers</h1>
              <p className="text-muted-foreground">
                Manage and monitor lander URLs
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search landers by URL or domain..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLanders.map((lander) => (
              <Card key={lander.id} className="hover:shadow-md transition-shadow border-l-4 border-spyder-teal">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      <a 
                        href={lander.lander_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2 group"
                      >
                        {lander.lander_url}
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </CardTitle>
                    <Badge variant={lander.processed ? "default" : "secondary"} className="font-medium">
                      {lander.processed ? "Processed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Domain
                      </p>
                      <p className="text-sm font-medium">{lander.lander_domain}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Ads Count
                      </p>
                      <p className="text-sm font-medium">{lander.adsCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Processed
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(lander.last_processed)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Created
                      </p>
                      <p className="text-sm font-medium">{formatDate(lander.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Countries
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lander.countries.map(country => (
                          <Badge key={country.id} variant="outline" className="text-xs">
                            {country.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data?.landers?.pagination && (
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {data.landers.pagination.totalPages}
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
                    disabled={currentPage >= data.landers.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LanderPage; 