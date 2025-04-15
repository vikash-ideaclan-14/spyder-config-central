import { toast } from "sonner";
// Add these imports at the top
import { request, gql } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://localhost:4127/graphql';
// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Domain specific types
export interface Config extends BaseEntity {
  name: string;
  cookie: string;
  asbd_id: string;
  lsd: string;
  raw_data: string;
  doc_id: string;
}

export interface Language extends BaseEntity {
  code: string;
  name: string;
}

export interface Country extends BaseEntity {
  code: string;
  name: string;
}

export interface Domain extends BaseEntity {
  domain: string;
}

export interface Vendor extends BaseEntity {
  name: string;
  description: string;
}

export interface Company extends BaseEntity {
  name: string;
  description: string;
}

export interface AssociatedGroup extends BaseEntity {
  name: string;
  type: string;
}

export interface Batch extends BaseEntity {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  totalTasks: number;
  completedTasks: number;
}

export interface Ad extends BaseEntity {
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
  batches: Batch[];
  display_format: string;
  startDate: string;
  endDate: string;
}

export interface SpyderConfig extends BaseEntity {
  name: string;
  cookie: string;
  asbd_id: string;
  lsd: string;
  doc_id_1: string;
  doc_id_2: string;
  raw_data: string;
}

// Response types
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: string | null;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdsResponse {
  ads: {
    items: Ad[];
    pagination: PaginationInfo;
  };
}

export interface SpyderConfigResponse {
  spyderConfigs: {
    items: SpyderConfig[];
    pagination: PaginationInfo;
  };
}

// GraphQL response types
interface GraphQLResponse<T> {
  data: T;
}

interface CreateConfigResponse {
    createSpyderConfig: SpyderConfig;
}

interface UpdateConfigResponse {
  updateSpyderConfig: SpyderConfig;
}

interface DeleteConfigResponse {
  deleteSpyderConfig: boolean;
}

// API implementation
export interface AdFilters {
  batchId?: string | null;
  companyName?: string | null;
  countryName?: string | null;
  domainName?: string | null;
  languageName?: string | null;
  vendorName?: string | null;
}

export interface GetAdsParams {
  pagination: {
    page: number;
    pageSize: number;
  };
  filters?: AdFilters;
}

export const adApi = {
  getAds: async ({ pagination, filters = {} }: GetAdsParams): Promise<AdsResponse> => {
    try {
      const query = gql`
        query GetAds($pagination: PaginationInput!, $filters: adsFilterInput) {
          ads(pagination: $pagination, filters: $filters) {
            items {
              id
              title
              body
              original_image_url
              original_video_url
              link_url
              cta_text
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
              }
              company {
                id
                name
              }
              domain {
                id
                domain
              }
              language {
                id
                name
              }
              countries {
                id
                name
              }
              batches {
                id
                start_date
                end_date
                status
                createdAt
                updatedAt
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

      const variables = { 
        pagination,
        filters: {
          batchId: filters.batchId,
          companyName: filters.companyName,
          countryName: filters.countryName,
          domainName: filters.domainName,
          languageName: filters.languageName,
          vendorName: filters.vendorName
        }
      };
      const response = await request<AdsResponse>(GRAPHQL_ENDPOINT, query, variables);
      return response;
    } catch (error) {
      toast.error('Failed to fetch ads');
      throw error;
    }
  }
};

export const configApi = {
  getConfigs: async (page: number = 1, pageSize: number = 10): Promise<SpyderConfigResponse> => {
    try {
      const query = gql`
        query GetConfigs($pagination: PaginationInput!) {
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

      const variables = { 
        pagination: {
          page,
          pageSize
        }
      };
      const response = await request<SpyderConfigResponse>(GRAPHQL_ENDPOINT, query, variables);
      return response;
    } catch (error) {
      toast.error('Failed to fetch configurations');
      throw error;
    }
  },

  createConfig: async (input: Omit<SpyderConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpyderConfig> => {
    try {
      const mutation = gql`
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
      const response = await request<CreateConfigResponse>(GRAPHQL_ENDPOINT, mutation, { input });
      if (response.createSpyderConfig) {
        toast.success('Configuration created successfully');
        return response.createSpyderConfig;
      }
      throw new Error('Failed to create configuration');
    } catch (error) {
      toast.error('Failed to create configuration');
      throw error;
    }
  },

  updateConfig: async (id: string, input: Partial<SpyderConfig>): Promise<SpyderConfig> => {
    try {
      const mutation = gql`
        mutation UpdateSpyderConfig($id: ID!, $input: SpyderConfigInput!) {
          updateSpyderConfig(id: $id, input: $input) {
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
      const response = await request<UpdateConfigResponse>(GRAPHQL_ENDPOINT, mutation, { id, input });
      if (response?.updateSpyderConfig) {
        toast.success('Configuration updated successfully');
        return response.updateSpyderConfig;
      }
      throw new Error('Failed to update configuration');
    } catch (error) {
      toast.error('Failed to update configuration');
      throw error;
    }
  },

  deleteConfig: async (id: string): Promise<void> => {
    try {
      const mutation = gql`
        mutation DeleteSpyderConfig($id: ID!) {
          deleteSpyderConfig(id: $id)
        }
      `;
      const response = await request<DeleteConfigResponse>(GRAPHQL_ENDPOINT, mutation, { id });
      if (response?.deleteSpyderConfig) {
        toast.success('Configuration deleted successfully');
      } else {
        throw new Error('Failed to delete configuration');
      }
    } catch (error) {
      toast.error('Failed to delete configuration');
      throw error;
    }
  }
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
  completedTasks: Math.floor(Math.random() * 20),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

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