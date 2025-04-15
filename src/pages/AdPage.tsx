import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/utils';
import { Ad, adApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Maximize2,
  Pause,
  Play,
  Search,
  Volume2,
  VolumeX,
  X,
  XCircle,
  ZoomIn
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
}

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
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  // Add filter states
  const [filters, setFilters] = useState({
    batchId: null,
    companyName: null,
    countryName: null,
    domainName: null,
    languageName: null,
    vendorName: null
  });

  const [filterKey, setFilterKey] = useState<string>('batchId');
  const [filterValue, setFilterValue] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string | null>>({});

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } = usePagination();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ads', currentPage, pageSize, filters],
    queryFn: () => adApi.getAds({
      pagination: { page: currentPage, pageSize },
      filters
    }),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });

  // Cleanup video refs on unmount
  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause();
          video.src = '';
        }
      });
    };
  }, []);

  const handleVideoPlay = (adId: string) => {
    const video = videoRefs.current[adId];
    if (video) {
      if (video.paused) {
        video.play();
        setVideoStates(prev => ({
          ...prev,
          [adId]: { ...prev[adId], isPlaying: true }
        }));
      } else {
        video.pause();
        setVideoStates(prev => ({
          ...prev,
          [adId]: { ...prev[adId], isPlaying: false }
        }));
      }
    }
  };

  const handleVideoMute = (adId: string) => {
    const video = videoRefs.current[adId];
    if (video) {
      video.muted = !video.muted;
      setVideoStates(prev => ({
        ...prev,
        [adId]: { ...prev[adId], isMuted: video.muted }
      }));
    }
  };

  const handleVideoTimeUpdate = (adId: string, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoStates(prev => ({
      ...prev,
      [adId]: {
        ...prev[adId],
        currentTime: video.currentTime,
        duration: video.duration
      }
    }));
  };

  const handleVideoSeek = (adId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRefs.current[adId];
    if (video) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    }
  };

  const handleApplyFilter = () => {
    if (filterValue.trim()) {
      setAppliedFilters(prev => ({
        ...prev,
        [filterKey]: filterValue
      }));
      setFilters(prev => ({
        ...prev,
        [filterKey]: filterValue
      }));
      setFilterValue('');
    }
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setFilters(prev => ({
      ...prev,
      [key]: null
    }));
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setFilters({
      batchId: null,
      companyName: null,
      countryName: null,
      domainName: null,
      languageName: null,
      vendorName: null
    });
  };

  const filterOptions = [
    { value: 'batchId', label: 'Batch ID' },
    { value: 'companyName', label: 'Company Name' },
    { value: 'countryName', label: 'Country Name' },
    { value: 'domainName', label: 'Domain Name' },
    { value: 'languageName', label: 'Language Name' },
    { value: 'vendorName', label: 'Vendor Name' }
  ];

  const filteredAds = data?.ads.items.filter(ad => 
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.batches.some(batch => batch.id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) return (
    <DashboardLayout>
      <Loader className="min-h-[calc(100vh-4rem)]" size="lg" />
    </DashboardLayout>
  );
  if (error) return <div>Error loading ads</div>;
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ads</h1>
          <div className="flex items-center gap-4">
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
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Select
              value={filterKey}
              onValueChange={setFilterKey}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder={`Enter ${filterOptions.find(opt => opt.value === filterKey)?.label.toLowerCase()}`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-[300px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilter();
                }
              }}
            />

            <Button onClick={handleApplyFilter}>
              Apply Filter
            </Button>

            <Button
              variant="outline"
              onClick={handleClearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>

          {/* Applied Filters */}
          {Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(appliedFilters).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">
                    {filterOptions.find(opt => opt.value === key)?.label}: {value}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveFilter(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          {isLoading && <Loader className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10" size="md" />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-gray-100">
                  {ad.original_image_url ? (
                    <div className="relative aspect-video">
                      <img
                        src={ad.original_image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setFullscreenImage(ad.original_image_url);
                          setIsImageFullscreen(true);
                        }}
                      />
                      <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setFullscreenImage(ad.original_image_url);
                          setIsImageFullscreen(true);
                        }}
                      >
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : ad.original_video_url ? (
                    <div className="relative aspect-video group">
                      <video
                        ref={el => videoRefs.current[ad.id] = el}
                        src={ad.original_video_url}
                        className="w-full h-full object-cover"
                        playsInline
                        poster={ad.original_image_url}
                        onTimeUpdate={(e) => handleVideoTimeUpdate(ad.id, e)}
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget;
                          setVideoStates(prev => ({
                            ...prev,
                            [ad.id]: {
                              isPlaying: false,
                              isMuted: video.muted,
                              currentTime: 0,
                              duration: video.duration
                            }
                          }));
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => handleVideoPlay(ad.id)}
                          >
                            {videoStates[ad.id]?.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => handleVideoMute(ad.id)}
                          >
                            {videoStates[ad.id]?.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </button>
                          <div 
                            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                            onClick={(e) => handleVideoSeek(ad.id, e)}
                          >
                            <div 
                              className="progress-bar h-full bg-white transition-all duration-100"
                              style={{ 
                                width: `${(videoStates[ad.id]?.currentTime || 0) / (videoStates[ad.id]?.duration || 1) * 100}%` 
                              }}
                            />
                          </div>
                          <button
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => videoRefs.current[ad.id]?.requestFullscreen()}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No Media Available</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium line-clamp-2">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ad.body}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span>{ad.vendor.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Company:</span>
                    <span>{ad.company.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span>{ad.display_format}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-muted-foreground">Countries:</span>
                    {ad.countries.map((country) => (
                      <Badge key={country.id} variant="secondary">
                        {country.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-muted-foreground">Batch:</span>
                    {ad.batches.map((batch) => (
                      <Badge key={batch.id} variant="secondary">
                        {batch.id}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{ad.language.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Domain:</span>
                    <span className="truncate">{ad.domain.domain}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="text-right">
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (ad.link_url) {
                          const newWindow = window.open(ad.link_url, '_blank');
                          if (newWindow) {
                            newWindow.opener = null;
                          }
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View ad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {data?.ads.pagination && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {data.ads.pagination.totalPages}
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
                disabled={currentPage >= data.ads.pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Fullscreen Image View */}
        {isImageFullscreen && fullscreenImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsImageFullscreen(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageFullscreen(false);
              }}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
