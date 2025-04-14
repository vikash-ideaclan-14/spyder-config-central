
import { toast } from "sonner";

// Types
export type Config = {
  id: string;
  name: string;
  cookie: string;
  asbd_id:string,
  lsd:string,
  raw_data: string;
  doc_id:string;
  createdAt: string;
  updatedAt: string;
};

export type Ad = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'draft';
  impressions: number;
  clicks: number;
};

export type Batch = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  totalTasks: number;
  completedTasks: number;
};

// Delay helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockConfigs: Config[] = Array.from({ length: 10 }, (_, i) => ({
  id: `config-${i + 1}`,
  name: `Config name ${i + 1}`,
  cookie: `Config cookie ${i + 1}`,
  asbd_id: `Config absd_id ${i + 1}`,
  lsd: `Config lsd ${i + 1}`,
  raw_data: `Config raw_data ${i + 1}`,
  doc_id: `Configdoc_id ${i + 1}`,
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
}));

const mockAds: Ad[] = Array.from({ length: 8 }, (_, i) => ({
  id: `ad-${i + 1}`,
  title: `Advertisement ${i + 1}`,
  description: `This is a description for advertisement ${i + 1}`,
  imageUrl: `https://source.unsplash.com/random/300x200?ad=${i + 1}`,
  targetUrl: `https://example.com/ad/${i + 1}`,
  startDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  endDate: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
  status: ['active', 'inactive', 'draft'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'draft',
  impressions: Math.floor(Math.random() * 10000),
  clicks: Math.floor(Math.random() * 1000)
}));

const mockBatches: Batch[] = Array.from({ length: 6 }, (_, i) => ({
  id: `batch-${i + 1}`,
  name: `Batch ${i + 1}`,
  description: `This is a description for batch ${i + 1}`,
  startDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  endDate: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
  status: ['active', 'completed', 'upcoming'][Math.floor(Math.random() * 3)] as 'active' | 'completed' | 'upcoming',
  totalTasks: Math.floor(Math.random() * 100) + 20,
  completedTasks: Math.floor(Math.random() * 20)
}));

// API functions
export const configApi = {
  getConfigs: async (): Promise<Config[]> => {
    await delay(500);
    return [...mockConfigs];
  },
  
  getConfig: async (id: string): Promise<Config | null> => {
    await delay(300);
    const config = mockConfigs.find(c => c.id === id);
    return config || null;
  },
  
  createConfig: async (config: Omit<Config, 'id' | 'createdAt' | 'updatedAt'>): Promise<Config> => {
    await delay(700);
    const newConfig: Config = {
      id: `config-${mockConfigs.length + 1}`,
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockConfigs.push(newConfig);
    toast.success("Config created successfully");
    return newConfig;
  },
  
  updateConfig: async (id: string, updates: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Config> => {
    await delay(600);
    const configIndex = mockConfigs.findIndex(c => c.id === id);
    if (configIndex === -1) {
      throw new Error('Config not found');
    }
    
    const updatedConfig = {
      ...mockConfigs[configIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockConfigs[configIndex] = updatedConfig;
    toast.success("Config updated successfully");
    return updatedConfig;
  },
  
  deleteConfig: async (id: string): Promise<void> => {
    await delay(400);
    const configIndex = mockConfigs.findIndex(c => c.id === id);
    if (configIndex !== -1) {
      mockConfigs.splice(configIndex, 1);
      toast.success("Config deleted successfully");
    }
  }
};

export const adApi = {
  getAds: async (): Promise<Ad[]> => {
    await delay(600);
    return [...mockAds];
  },
  
  getAd: async (id: string): Promise<Ad | null> => {
    await delay(300);
    const ad = mockAds.find(a => a.id === id);
    return ad || null;
  },
  
  createAd: async (ad: Omit<Ad, 'id' | 'impressions' | 'clicks'>): Promise<Ad> => {
    await delay(800);
    const newAd: Ad = {
      id: `ad-${mockAds.length + 1}`,
      ...ad,
      impressions: 0,
      clicks: 0
    };
    mockAds.push(newAd);
    toast.success("Ad created successfully");
    return newAd;
  },
  
  updateAd: async (id: string, updates: Partial<Omit<Ad, 'id'>>): Promise<Ad> => {
    await delay(700);
    const adIndex = mockAds.findIndex(a => a.id === id);
    if (adIndex === -1) {
      throw new Error('Ad not found');
    }
    
    const updatedAd = {
      ...mockAds[adIndex],
      ...updates
    };
    
    mockAds[adIndex] = updatedAd;
    toast.success("Ad updated successfully");
    return updatedAd;
  },
  
  deleteAd: async (id: string): Promise<void> => {
    await delay(500);
    const adIndex = mockAds.findIndex(a => a.id === id);
    if (adIndex !== -1) {
      mockAds.splice(adIndex, 1);
      toast.success("Ad deleted successfully");
    }
  }
};

export const batchApi = {
  getBatches: async (): Promise<Batch[]> => {
    await delay(700);
    return [...mockBatches];
  },
  
  getBatch: async (id: string): Promise<Batch | null> => {
    await delay(400);
    const batch = mockBatches.find(b => b.id === id);
    return batch || null;
  },
  
  createBatch: async (batch: Omit<Batch, 'id' | 'completedTasks'>): Promise<Batch> => {
    await delay(900);
    const newBatch: Batch = {
      id: `batch-${mockBatches.length + 1}`,
      ...batch,
      completedTasks: 0
    };
    mockBatches.push(newBatch);
    toast.success("Batch created successfully");
    return newBatch;
  },
  
  updateBatch: async (id: string, updates: Partial<Omit<Batch, 'id'>>): Promise<Batch> => {
    await delay(800);
    const batchIndex = mockBatches.findIndex(b => b.id === id);
    if (batchIndex === -1) {
      throw new Error('Batch not found');
    }
    
    const updatedBatch = {
      ...mockBatches[batchIndex],
      ...updates
    };
    
    mockBatches[batchIndex] = updatedBatch;
    toast.success("Batch updated successfully");
    return updatedBatch;
  },
  
  deleteBatch: async (id: string): Promise<void> => {
    await delay(600);
    const batchIndex = mockBatches.findIndex(b => b.id === id);
    if (batchIndex !== -1) {
      mockBatches.splice(batchIndex, 1);
      toast.success("Batch deleted successfully");
    }
  }
};
