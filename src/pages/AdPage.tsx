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
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Maximize2,
  Play,
  Pause,
  Search,
  Volume2,
  VolumeX,
  X,
  XCircle,
  ZoomIn,
  Globe,
  Building2,
  Flag,
  Layers,
  Languages
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { setAds } from '@/store/slices/adSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/store';

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
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const { adsData } = useAppSelector((state) => state.ad);
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

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange, pageInput, handlePageInputChange, handlePageInputSubmit } = usePagination();

  useEffect(() => {
    const fetchAds = async () => {
      const response = await adApi.getAds({ 
        pagination: { page: currentPage, pageSize }, 
        filters 
      });
      dispatch(setAds(response));
    };
    fetchAds();
  }, [currentPage, pageSize, filters, dispatch]);

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

  const filteredAds = adsData?.ads?.items?.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.batches.some(batch => batch.id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-gray-100">
                  {ad.original_image_url ? (
                    <div className="relative aspect-video group">
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
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between cursor-pointer"
                        onClick={() => {
                          setFullscreenImage(ad.original_image_url);
                          setIsImageFullscreen(true);
                        }}
                      >
                        <div className="absolute top-2 left-2 right-2 text-white text-xs">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                              <Globe className="h-3 w-3 text-blue-300" />
                              <span className="font-medium">{ad.domain.domain}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                              <Building2 className="h-3 w-3 text-purple-300" />
                              <span className="font-medium">{ad.company.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                              <Languages className="h-3 w-3 text-green-300" />
                              <span className="font-medium">{ad.language.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                              <Flag className="h-3 w-3 text-yellow-300" />
                              <div className="flex flex-wrap gap-1">
                                {ad.countries.map((country) => (
                                  <Badge key={country.id} variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                                    {country.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                              <Layers className="h-3 w-3 text-red-300" />
                              <div className="flex flex-wrap gap-1">
                                {ad.batches.map((batch) => (
                                  <Badge key={batch.id} variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                                    {batch.id}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
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
                      <div className="absolute top-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                            <Globe className="h-3 w-3 text-blue-300" />
                            <span className="font-medium">{ad.domain.domain}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                            <Building2 className="h-3 w-3 text-purple-300" />
                            <span className="font-medium">{ad.company.name}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                            <Languages className="h-3 w-3 text-green-300" />
                            <span className="font-medium">{ad.language.name}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                            <Flag className="h-3 w-3 text-yellow-300" />
                            <div className="flex flex-wrap gap-1">
                              {ad.countries.map((country) => (
                                <Badge key={country.id} variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                                  {country.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded">
                            <Layers className="h-3 w-3 text-red-300" />
                            <div className="flex flex-wrap gap-1">
                              {ad.batches.map((batch) => (
                                <Badge key={batch.id} variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
                                  {batch.id}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
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
                <CardContent className="p-3 space-y-2">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-2">{ad.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ad.body}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Link:</span>
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[200px]"
                      title={ad.link_url}
                    >
                      {ad.link_url}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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

        {adsData?.ads?.pagination && (
          <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {adsData.ads.pagination.totalPages}
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
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
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
                  disabled={currentPage === adsData.ads.pagination.totalPages}
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
}
