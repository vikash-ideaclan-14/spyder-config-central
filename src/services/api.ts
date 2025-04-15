import { toast } from "sonner";
// Add these imports at the top
import { request, gql } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://localhost:4127/graphql';
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



export type Language = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Country = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Domain = {
  id: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export interface AssociatedGroup {
  id: string;
  name: string;
  type: string;
}

export interface Ad {
  id: string;
  title: string;
  body: string;
  original_image_url: string;
  original_video_url: string;
  link_url: string;
  ctaText: string;
  status: string;
  vendor: Vendor;
  company: Company;
  domain: Domain;
  language: Language;
  countries: Country[];
  batch: Batch;
  display_format: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

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

// const mockAds: Ad[] = Array.from({ length: 8 }, (_, i) => ({
//   id: `ad-${i + 1}`,
//   title: `Advertisement Title ${i + 1}`,
//   body: `This is the body content for advertisement ${i + 1}`,
//   imageUrl: `https://source.unsplash.com/random/300x200?ad=${i + 1}`,
//   videoUrl: `https://example.com/video/${i + 1}`,
//   domain: `example${i + 1}.com`,
//   language: ['English', 'Spanish', 'French'][Math.floor(Math.random() * 3)],
//   vendor: `Vendor ${i + 1}`,
//   country: ['US', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 4)],
//   company: `Company ${i + 1}`,
//   ctaText: `Click Here ${i + 1}`,
//   link_url: `https://example.com/ad/${i + 1}`,
//   caption: `Caption for ad ${i + 1}`,
//   display_format: ['banner', 'sidebar', 'popup'][Math.floor(Math.random() * 3)],
//   page_name: `Page ${i + 1}`,
//   page_id: `page-${i + 1}`,
//   startDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
//   endDate: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
//   createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
//   updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
// }));

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


interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: string | null;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AdsResponse {
  items: Ad[];
  pagination: PaginationInfo;
}

export const adApi = {
  getAds: async (page: number = 1, pageSize: number = 20, sortBy: string | null = null, sortOrder: string | null = null): Promise<AdsResponse> => {
    try {
      const data = await request<{ ads: AdsResponse }>(
        GRAPHQL_ENDPOINT,
        GET_ADS,
        {
          pagination: {
            page,
            pageSize,
            sortBy,
            sortOrder
          }
        }
      );
      return data.ads;
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw error;
    }
  },

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


// Define the types for the GraphQL response
export interface SpyderConfig {
  id: string;
  name: string;
  cookie: string;
  asbd_id: string;
  lsd: string;
  doc_id_1: string;
  doc_id_2: string;
  raw_data: string;
  createdAt: string;
  updatedAt: string;
}

interface SpyderConfigResponse {
  items: any;
  pagination: any;
  spyderConfigs: {
    items: SpyderConfig[];
    pagination: PaginationInfo;
  };
}

// Define the query
const GET_SPYDER_CONFIGS = gql`
  query SpyderConfigs($pagination: PaginationInput!) {
    spyderConfigs(pagination: $pagination) {
      items {
        id
        name
        cookie
        asbd_id
        lsd
        doc_id_1
        doc_id_2
        raw_data
        createdAt
        updatedAt
      }
      pagination {
        total
        page
        pageSize
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const CREATE_SPYDER_CONFIG = gql`
  mutation CreateSpyderConfig($input: SpyderConfigInput!) {
    createSpyderConfig(input: $input) {
      id
      name
      cookie
      asbd_id
      lsd
      doc_id_1
      doc_id_2
      raw_data
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SPYDER_CONFIG = gql`
  mutation DeleteSpyderConfig($deleteSpyderConfigId: ID!) {
    deleteSpyderConfig(id: $deleteSpyderConfigId)
  }
`;

const UPDATE_SPYDER_CONFIG = gql`
  mutation UpdateSpyderConfig($updateSpyderConfigId: ID!, $input: SpyderConfigInput!) {
    updateSpyderConfig(id: $updateSpyderConfigId, input: $input) {
      id
      name
      cookie
      asbd_id
      lsd
      doc_id_1
      doc_id_2
      raw_data
      createdAt
      updatedAt
    }
  }
`;

const GET_ADS = gql`
  query Items {
    ads {
      items {
        id
        title
        body
        original_image_url
        original_video_url
        cta_text
        link_url
        caption
        display_format
        page_name
        page_id
        startDate
        endDate
        createdAt
        updatedAt
        vendor {
          id
          name
          description
          createdAt
          updatedAt
        }
        company {
          id
          name
          description
          createdAt
          updatedAt
        }
        domain {
          id
          domain
          createdAt
          updatedAt
          domainVendor {
            id
            name
            description
            createdAt
            updatedAt
          }
          domainCompany {
            id
            name
            description
            createdAt
            updatedAt
          }
        }
        language {
          id
          code
          name
          createdAt
          updatedAt
        }
        countries {
          id
          code
          name
          createdAt
          updatedAt
        }
        batches {
          id
          start_date
          end_date
          status
          createdAt
          updatedAt
          batchCountry {
            id
            code
            name
            createdAt
            updatedAt
          }
          associatedGroup {
            id
            name
            status
            createdAt
            updatedAt
          }
          ads {
            id
            title
            body
            original_image_url
            original_video_url
            cta_text
            link_url
            caption
            display_format
            page_name
            page_id
            startDate
            endDate
            createdAt
            updatedAt
          }
        }
      }
      pagination {
        total
        page
        pageSize
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const configApi = {
  getConfigs: async (page: number = 1, pageSize: number = 10, sortBy: string | null = null, sortOrder: string | null = null): Promise<SpyderConfigResponse> => {
    try {
      const data = await request<{ spyderConfigs: SpyderConfigResponse }>(
        GRAPHQL_ENDPOINT,
        GET_SPYDER_CONFIGS,
        {
          pagination: {
            page,
            pageSize,
            sortBy,
            sortOrder
          }
        }
      );
      return data.spyderConfigs;
    } catch (error) {
      console.error('Error fetching configs:', error);
      throw error;
    }
  },

  createConfig: async (input: any): Promise<SpyderConfig> => {
    try {
      console.log(input);
      const data = await request<{ createSpyderConfig: SpyderConfig }>(
        GRAPHQL_ENDPOINT,
        CREATE_SPYDER_CONFIG,
        { input }
      );
      toast.success("Config created successfully");
      return data.createSpyderConfig;
    } catch (error) {
      console.error('Error creating config:', error);
      toast.error("Failed to create config");
      throw error;
    }
  },

  updateConfig: async (id: string, input: any): Promise<SpyderConfig> => {
    try {
      const data = await request<{ updateSpyderConfig: SpyderConfig }>(
        GRAPHQL_ENDPOINT,
        UPDATE_SPYDER_CONFIG,
        { updateSpyderConfigId: id, input }
      );
      toast.success("Config updated successfully");
      return data.updateSpyderConfig;
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error("Failed to update config");
      throw error;
    }
  },

  deleteConfig: async (id: string): Promise<void> => {
    try {
      await request(
        GRAPHQL_ENDPOINT,
        DELETE_SPYDER_CONFIG,
        { deleteSpyderConfigId: id }
      );
      toast.success("Config deleted successfully");
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error("Failed to delete config");
      throw error;
    }
  }
};