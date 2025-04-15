import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Search, 
  X, 
  Plus, 
  Calendar, 
  Eye, 
  MousePointer, 
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adApi, Ad } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Draft
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function AdPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ads', currentPage, pageSize],
    queryFn: () => adApi.getAds(currentPage, pageSize),
  });

  const filteredAds = data?.items.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading ads</div>;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ads</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Media</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Display Format</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="w-20 h-20 relative rounded-md overflow-hidden">
                      {ad.original_image_url ? (
                        <img
                          src={ad.original_image_url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : ad.original_video_url ? (
                        <video
                          src={ad.original_video_url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Media</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{ad.title}</TableCell>
                  <TableCell>{ad.vendor.name}</TableCell>
                  <TableCell>{ad.company.name}</TableCell>
                  <TableCell>{ad.domain.domain}</TableCell>
                  <TableCell>{ad.language.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ad.countries.map((country) => (
                        <Badge key={country.id} variant="secondary">
                          {country.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{ad.display_format}</TableCell>
                  <TableCell>{formatDate(ad.startDate)}</TableCell>
                  <TableCell>{formatDate(ad.endDate)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAd(ad);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {data.pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
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
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= data.pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog for viewing ad details */}
      {selectedAd && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAd.title}</DialogTitle>
              <DialogDescription>
                {selectedAd.vendor.name} - {selectedAd.company.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Media Preview</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {selectedAd.original_image_url ? (
                      <img
                        src={selectedAd.original_image_url}
                        alt={selectedAd.title}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedAd.original_video_url ? (
                      <video
                        src={selectedAd.original_video_url}
                        className="w-full h-full object-contain"
                        controls
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Media Available</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Body</h3>
                    <p className="text-muted-foreground mt-1">{selectedAd.body}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Call to Action</h3>
                    <p className="text-muted-foreground mt-1">{selectedAd.ctaText}</p>
                  </div>
                  {selectedAd.link_url && (
                    <div>
                      <h3 className="font-medium">Link</h3>
                      <a
                        href={selectedAd.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block mt-1"
                      >
                        {selectedAd.link_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Display Format:</span>
                      <span>{selectedAd.display_format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span>{selectedAd.language.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span>{selectedAd.domain.domain}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{formatDate(selectedAd.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{formatDate(selectedAd.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Target Countries</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAd.countries.map((country) => (
                    <Badge key={country.id} variant="secondary">
                      {country.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
