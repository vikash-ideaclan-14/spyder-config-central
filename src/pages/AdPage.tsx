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
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adApi, Ad } from '@/services/api';

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

const AdPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ads, isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: adApi.getAds,
  });

  const filteredAds = ads?.items?.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold">Advertisements</h1>
            <p className="text-muted-foreground">
              Manage and track all advertisement campaigns
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Advertisements</CardTitle>
            <CardDescription>
              Track and manage your advertising campaigns
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search advertisements..."
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
            {isLoading ? (
              <div className="text-center py-10">Loading advertisements...</div>
            ) : filteredAds?.length === 0 ? (
              <div className="text-center py-10">
                No advertisements found
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAds?.map((ad) => (
                  <Card key={ad.id} className="overflow-hidden card-hover">
                    <div className="relative h-40 bg-muted">
                      {
                        ad.original_image_url && (
                          <img
                            src={ad?.original_image_url}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        )
                      }
                      {
                        ad.original_video_url && (
                          <video
                            src={ad?.original_video_url}
                            className="w-full h-full object-cover"
                          />
                        )
                      }
                        <div className="absolute top-2 right-2">
                        <span className="bg-white px-2 py-1 rounded-md text-sm">
                          {ad.language?.name}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {ad.body}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Domain:</span>
                            <span>{ad?.domain?.domain}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Company:</span>
                          <span>{ad.company.name}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span>{formatDate(ad.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Updated:</span>
                          <span>{formatDate(ad.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Vendor:</span>
                              <span>{ad.vendor.name}</span>
                          </div>
                        </div>
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-spyder-teal hover:text-spyder-teal/90 text-sm"
                        >
                          {ad.ctaText}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdPage;
