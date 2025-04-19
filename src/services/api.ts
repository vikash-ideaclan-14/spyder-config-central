import { toast } from "sonner";
// Add these imports at the top
import { gql, DocumentNode } from '@apollo/client';
import { client } from '@/lib/apollo';

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
  type: string;
}

export interface Company extends BaseEntity {
  name: string;
  description: string;
}

export interface AssociatedGroup extends BaseEntity {
  status: string;
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
      const response = await client.query<AdsResponse>({
        query,
        variables
      });
      return response.data;
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
      const response = await client.query<SpyderConfigResponse>({
        query,
        variables
      });
      return response.data;
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
      const response = await client.mutate<CreateConfigResponse>({
        mutation,
        variables: { input }
      });
      if (response.data?.createSpyderConfig) {
        toast.success('Configuration created successfully');
        return response.data.createSpyderConfig;
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
      const response = await client.mutate<UpdateConfigResponse>({
        mutation,
        variables: { id, input }
      });
      if (response.data?.updateSpyderConfig) {
        toast.success('Configuration updated successfully');
        return response.data.updateSpyderConfig;
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
      const response = await client.mutate<DeleteConfigResponse>({
        mutation,
        variables: { id }
      });
      if (response.data?.deleteSpyderConfig) {
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

export interface CreateSpyderBatchInput {
  countryId: string | null;
  endDate: string | null;
  spyderGroupId: string | null;
  startDate: string | null;
  status: string | null;
}

export interface CreateSpyderBatchResponse {
  createSpyderBatch: SpyderBatch;
}

export const batchApi = {
  getBatches: async ({ pagination }: { pagination: { page: number; pageSize: number } }): Promise<SpyderBatchesResponse> => {
    try {
      const query = gql`
        query SpyderBatches($pagination: PaginationInput) {
          spyderBatches(pagination: $pagination) {
            items {
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
          page: pagination.page,
          pageSize: pagination.pageSize
        }
      };

      const response = await client.query<SpyderBatchesResponse>({
        query,
        variables
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch batches');
      throw error;
    }
  },

  createBatch: async (input: CreateSpyderBatchInput): Promise<SpyderBatch> => {
    try {
      const mutation = gql`
        mutation CreateSpyderBatch($input: SpyderBatchInput!) {
          createSpyderBatch(input: $input) {
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
          }
        }
      `;

      const response = await client.mutate<CreateSpyderBatchResponse>({
        mutation,
        variables: { input }
      });
      return response.data.createSpyderBatch;
    } catch (error) {
      toast.error('Failed to create batch');
      throw error;
    }
  },

  deleteBatch: async (spyderBatchId: string): Promise<{ message: string; success: boolean }> => {
    try {
      const mutation = gql`
        mutation DeleteSpyderBatch($deleteSpyderBatchId: ID!) {
          deleteSpyderBatch(id: $deleteSpyderBatchId)
        }
      `;
      const response = await client.mutate<{ deleteSpyderBatch: { message: string; success: boolean } }>({
        mutation,
        variables: { deleteSpyderBatchId: spyderBatchId },
      });
      return response.data.deleteSpyderBatch;
    } catch (error) {
      toast.error('Failed to delete batch');
      throw error;
    }
  },

  scrapeAdsByBatch: async (spyderBatchId: string, spyderConfigId: string): Promise<{ message: string; success: boolean }> => {
    try {
      const { data, errors } = await client.mutate<{ scrapeAdsByBatch: { message: string; success: boolean } }>({
        mutation: SCRAPE_ADS_BY_BATCH_MUTATION,
        variables: { spyderBatchId, spyderConfigId },
      });

      if (errors || !data?.scrapeAdsByBatch) {
        throw new Error('Failed to scrape ads for batch');
      }

      return data.scrapeAdsByBatch;
    } catch (error) {
      console.error('Scrape ads error:', error);
      toast.error('Failed to scrape ads for batch');
      throw error;
    }
  },
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

export interface SpyderBatch {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  batchCountry: Country;
  associatedGroup: AssociatedGroup;
  ads: Ad[];
}

export interface SpyderBatchesResponse {
  spyderBatches: {
    items: SpyderBatch[];
    pagination: PaginationInfo;
  };
}

export interface CountriesResponse {
  countries: {
    items: Country[];
    pagination: PaginationInfo;
  };
}

export const countryApi = {
  getCountries: async (page: number = 1, pageSize: number = 10): Promise<CountriesResponse> => {
    try {
      const query = gql`
        query Countries($pagination: PaginationInput) {
          countries(pagination: $pagination) {
            items {
              id
              code
              name
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

      const response = await client.query<CountriesResponse>({
        query,
        variables
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch countries');
      throw error;
    }
  }
};

export interface SpyderGroup {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  company: Company;
  domains: Domain[];
}

export interface SpyderGroupsResponse {
  spyedGroups: {
    items: SpyderGroup[];
    pagination: PaginationInfo;
  };
}

export interface CompanyInput {
  name: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  type: string;
}

export interface VendorsResponse {
  vendors: {
    items: Vendor[];
    pagination: PaginationInfo;
  };
}

export interface CreateSpyedGroupInput {
  name: string;
  status: string;
  companyIds: string[];
  vendorIds: string[];
  domainIds: string[];
}

export interface CreateSpyedGroupResponse {
  createSpyedGroup: SpyderGroup;
}

export const companyApi = {
  getCompanies: async (page: number = 1, pageSize: number = 10): Promise<CompaniesResponse> => {
    try {
      const query = gql`
        query Companies($pagination: PaginationInput) {
          companies(pagination: $pagination) {
            items {
              id
              name
              description
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

      const response = await client.query<CompaniesResponse>({
        query,
        variables
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch companies');
      throw error;
    }
  },

  getCompany: async (id: string): Promise<Company> => {
    try {
      const response = await client.query<{ company: Company }>({
        query: gql(GET_COMPANY_QUERY),
        variables: { companyId: id }
      });
      return response.data.company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },
};

export const vendorApi = {
  getVendors: async (page: number = 1, pageSize: number = 10): Promise<VendorsResponse> => {
    try {
      const query = gql`
        query Vendors($pagination: PaginationInput) {
          vendors(pagination: $pagination) {
            items {
              id
              name
              description
              type
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

      const response = await client.query<VendorsResponse>({
        query,
        variables
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch vendors');
      throw error;
    }
  },

  getVendor: async (id: string): Promise<Vendor> => {
    try {
      const response = await client.query<{ vendor: Vendor }>({
        query: gql(GET_VENDOR_QUERY),
        variables: { vendorId: id }
      });
      return response.data.vendor;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  },

  updateVendor: async (id: string, input: VendorInput): Promise<Vendor> => {
    try {
      const { data } = await client.mutate<{ updateVendor: Vendor }>({
        mutation: UPDATE_VENDOR_MUTATION,
        variables: {
          updateVendorId: id,
          input,
        },
      });
      return data.updateVendor;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  deleteVendor: async (id: string): Promise<boolean> => {
    try {
      const { data } = await client.mutate<{ deleteVendor: boolean }>({
        mutation: DELETE_VENDOR_MUTATION,
        variables: {
          deleteVendorId: id,
        },
      });
      return data.deleteVendor;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },
};

const GET_GROUPS_QUERY: DocumentNode = gql`
  query GetGroups($pagination: PaginationInput!, $filters: groupFilterInput) {
    spyedGroups(pagination: $pagination, filters: $filters) {
      items {
        id
        name
        status
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
        domains {
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

const CREATE_GROUP_MUTATION: DocumentNode = gql`
  mutation CreateSpyedGroup($input: SpyedGroupInput!) {
    createSpyedGroup(input: $input) {
      id
      name
      status
      createdAt
      updatedAt
      company {
        id
        name
      }
      vendor {
        id
        name
      }
    }
  }
`;

const DELETE_GROUP_MUTATION: DocumentNode = gql`
  mutation DeleteSpyedGroup($id: ID!) {
    deleteSpyedGroup(id: $id)
  }
`;

const UPDATE_GROUP_MUTATION: DocumentNode = gql`
  mutation UpdateSpyedGroup($id: ID!, $input: SpyedGroupInput!) {
    updateSpyedGroup(id: $id, input: $input) {
      id
      name
      status
      createdAt
      updatedAt
      company {
        id
        name
      }
      vendor {
        id
        name
      }
    }
  }
`;

export const groupApi = {
  getGroups: async (page = 1, pageSize = 10): Promise<SpyderGroupsResponse> => {
    try {
      const { data } = await client.query<SpyderGroupsResponse>({
        query: GET_GROUPS_QUERY,
        variables: { pagination: { page, pageSize } },
      });
      return data;
    } catch (error) {
      toast.error('Failed to fetch groups');
      throw error;
    }
  },

  createGroup: async (input: CreateSpyedGroupInput): Promise<CreateSpyedGroupResponse> => {
    try {
      const { data } = await client.mutate<CreateSpyedGroupResponse>({
        mutation: CREATE_GROUP_MUTATION,
        variables: { input },
      });
      return data;
    } catch (error) {
      toast.error('Failed to create group');
      throw error;
    }
  },

  updateGroup: async (id: string, input: CreateSpyedGroupInput): Promise<CreateSpyedGroupResponse> => {
    try {
      const { data } = await client.mutate<CreateSpyedGroupResponse>({
        mutation: UPDATE_GROUP_MUTATION,
        variables: { id, input },
      });
      return data;
    } catch (error) {
      toast.error('Failed to update group');
      throw error;
    }
  },

  deleteGroup: async (id: string): Promise<{ success: boolean }> => {
    try {
      const { data } = await client.mutate<{ deleteSpyedGroup: { success: boolean } }>({
        mutation: DELETE_GROUP_MUTATION,
        variables: { id },
      });
      return data.deleteSpyedGroup;
    } catch (error) {
      toast.error('Failed to delete group');
      throw error;
    }
  },
};

export interface Lander {
  id: string;
  lander_url: string;
  lander_domain: string;
  processed: boolean;
  last_processed: string | null;
  adsCount: number;
  createdAt: string;
  updatedAt: string;
  countries: {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface LandersResponse {
  landers: {
    items: Lander[];
    pagination: PaginationInfo;
  };
}

const GET_LANDERS_QUERY: DocumentNode = gql`
  query Landers($pagination: PaginationInput) {
    landers(pagination: $pagination) {
      items {
        id
        lander_url
        lander_domain
        processed
        last_processed
        adsCount
        createdAt
        updatedAt
        countries {
          id
          code
          name
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

const CREATE_LANDER_MUTATION = gql`
  mutation CreateLander($input: LanderInput!) {
    createLander(input: $input) {
      id
      lander_url
      lander_domain
      processed
      last_processed
      adsCount
      createdAt
      updatedAt
      countries {
        id
        code
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_LANDER_MUTATION = gql`
  mutation UpdateLander($id: ID!, $input: LanderInput!) {
    updateLander(id: $id, input: $input) {
      id
      lander_url
      lander_domain
      processed
      last_processed
      adsCount
      createdAt
      updatedAt
      countries {
        id
        code
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_LANDER_MUTATION = gql`
  mutation DeleteLander($id: ID!) {
    deleteLander(id: $id)
  }
`;

interface LanderInput {
  lander_url: string;
  lander_domain: string;
  countryIds: string[];
}

export const landerApi = {
  getLanders: async (page = 1, pageSize = 10): Promise<LandersResponse> => {
    try {
      const { data } = await client.query<LandersResponse>({
        query: GET_LANDERS_QUERY,
        variables: { pagination: { page, pageSize } },
      });
      return data;
    } catch (error) {
      toast.error('Failed to fetch landers');
      throw error;
    }
  },

  createLander: async (input: LanderInput): Promise<Lander> => {
    try {
      const { data } = await client.mutate<{ createLander: Lander }>({
        mutation: CREATE_LANDER_MUTATION,
        variables: { input },
      });
      return data.createLander;
    } catch (error) {
      toast.error('Failed to create lander');
      throw error;
    }
  },

  updateLander: async (id: string, input: LanderInput): Promise<Lander> => {
    try {
      const { data } = await client.mutate<{ updateLander: Lander }>({
        mutation: UPDATE_LANDER_MUTATION,
        variables: { id, input },
      });
      return data.updateLander;
    } catch (error) {
      toast.error('Failed to update lander');
      throw error;
    }
  },

  deleteLander: async (id: string): Promise<boolean> => {
    try {
      const { data } = await client.mutate<{ deleteLander: boolean }>({
        mutation: DELETE_LANDER_MUTATION,
        variables: { id },
      });
      return data.deleteLander;
    } catch (error) {
      toast.error('Failed to delete lander');
      throw error;
    }
  },
};

const SCRAPE_ADS_BY_BATCH_MUTATION = gql`
  mutation ScrapeAdsByBatch($spyderBatchId: ID!, $spyderConfigId: ID!) {
    scrapeAdsByBatch(spyderBatchId: $spyderBatchId, spyderConfigId: $spyderConfigId) {
      message
      success
    }
  }
`;

export interface Domain {
  id: string;
  domain: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  domainVendor: Vendor;
  domainCompany: Company;
}

export interface DomainsResponse {
  domains: {
    items: Domain[];
    pagination: PaginationInfo;
  };
}

const GET_DOMAINS_QUERY = gql`
  query Domains($pagination: PaginationInput) {
    domains(pagination: $pagination) {
      items {
        id
        domain
        type
        createdAt
        updatedAt
        domainVendor {
          id
          name
          type
          createdAt
          updatedAt
        }
        domainCompany {
          id
          name
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

const GET_DOMAIN_QUERY = gql`
  query Domain($domainId: ID!) {
    domain(id: $domainId) {
      id
      domain
      createdAt
      updatedAt
      domainVendor {
        id
        name
        type
        createdAt
        updatedAt
      }
      domainCompany {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_DOMAIN_MUTATION = gql`
  mutation UpdateDomain($updateDomainId: ID!, $input: DomainInput!) {
    updateDomain(id: $updateDomainId, input: $input) {
      id
      domain
      createdAt
      updatedAt
      domainVendor {
        id
        name
        type
        createdAt
        updatedAt
      }
      domainCompany {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_DOMAIN_MUTATION = gql`
  mutation DeleteDomain($deleteDomainId: ID!) {
    deleteDomain(id: $deleteDomainId)
  }
`;

export const domainApi = {
  getDomains: async (page?: number, pageSize?: number): Promise<DomainsResponse> => {
    try {
      const { data } = await client.query<DomainsResponse>({
        query: GET_DOMAINS_QUERY,
        variables: {
          pagination: {
            page: page || 1,
            pageSize: pageSize || 10,
          },
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
  },
  getDomain: async (id: string): Promise<Domain> => {
    const response = await client.query<{ domain: Domain }>({
      query: GET_DOMAIN_QUERY,
      variables: { domainId: id },
    });
    return response.data.domain;
  },
  updateDomain: async (id: string, input: DomainInput): Promise<Domain> => {
    const response = await client.mutate<{ updateDomain: Domain }>({
      mutation: UPDATE_DOMAIN_MUTATION,
      variables: { updateDomainId: id, input },
    });
    return response.data.updateDomain;
  },
};

const CREATE_VENDOR_MUTATION = gql`
  mutation CreateVendor($input: VendorInput!) {
    createVendor(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($input: CompanyInput!) {
    createCompany(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

const CREATE_DOMAIN_MUTATION = gql`
  mutation CreateDomain($input: DomainInput!) {
    createDomain(input: $input) {
      id
      domain
      createdAt
      updatedAt
      domainVendor {
        id
        name
        createdAt
        updatedAt
      }
      domainCompany {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

export interface VendorInput {
  name: string;
  description: string;
  type: string;
}

export interface CompanyInput {
  name: string;
  description: string;
}

export interface DomainInput {
  domain: string;
  companyId: string;
  vendorId: string;
  type: string;
}

const UPDATE_VENDOR_MUTATION = gql`
  mutation UpdateVendor($input: VendorInput!, $updateVendorId: ID!) {
    updateVendor(input: $input, id: $updateVendorId) {
      id
      name
      description
      type
      createdAt
      updatedAt
    }
  }
`;

const DELETE_VENDOR_MUTATION = gql`
  mutation DeleteVendor($deleteVendorId: ID!) {
    deleteVendor(id: $deleteVendorId)
  }
`;

const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($updateCompanyId: ID!, $input: CompanyUpdateInput!) {
    updateCompany(id: $updateCompanyId, input: $input) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompany($deleteCompanyId: ID!) {
    deleteCompany(id: $deleteCompanyId)
  }
`;

export interface UpdateDomainResponse {
  updateDomain: Domain;
}

const GET_COMPANIES_QUERY = gql`
  query Companies($pagination: PaginationInput) {
    companies(pagination: $pagination) {
      items {
        id
        name
        description
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

const GET_COMPANY_QUERY = `
  query Company($companyId: ID!) {
    company(id: $companyId) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

const GET_VENDOR_QUERY = `
  query Vendor($vendorId: ID!) {
    vendor(id: $vendorId) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

// First define all GraphQL queries and mutations
const GET_VENDORS_QUERY = gql`
  query GetVendors($pagination: PaginationInput!) {
    vendors(pagination: $pagination) {
      items {
        id
        name
        description
        type
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

// Then export the miscellaneousApi object
export const miscellaneousApi = {
  getVendors: async (page: number = 1, pageSize: number = 10): Promise<VendorsResponse> => {
    try {
      const { data } = await client.query<VendorsResponse>({
        query: GET_VENDORS_QUERY,
        variables: {
          pagination: {
            page,
            pageSize
          }
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  createVendor: async (input: VendorInput) => {
    try {
      const { data } = await client.mutate<{ createVendor: Vendor }>({
        mutation: CREATE_VENDOR_MUTATION,
        variables: { input },
      });
      return data.createVendor;
    } catch (error) {
      toast.error('Failed to create vendor');
      throw error;
    }
  },

  createCompany: async (input: CompanyInput) => {
    try {
      const { data } = await client.mutate<{ createCompany: Company }>({
        mutation: CREATE_COMPANY_MUTATION,
        variables: { input },
      });
      return data.createCompany;
    } catch (error) {
      toast.error('Failed to create company');
      throw error;
    }
  },

  createDomain: async (input: DomainInput) => {
    try {
      const { data } = await client.mutate<{ createDomain: Domain }>({
        mutation: CREATE_DOMAIN_MUTATION,
        variables: { input },
      });
      return data.createDomain;
    } catch (error) {
      toast.error('Failed to create domain');
      throw error;
    }
  },

  updateVendor: async (id: string, input: VendorInput): Promise<Vendor> => {
    try {
      const { data } = await client.mutate<{ updateVendor: Vendor }>({
        mutation: UPDATE_VENDOR_MUTATION,
        variables: {
          updateVendorId: id,
          input,
        },
      });
      return data.updateVendor;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  deleteVendor: async (id: string): Promise<boolean> => {
    try {
      const { data } = await client.mutate<{ deleteVendor: boolean }>({
        mutation: DELETE_VENDOR_MUTATION,
        variables: {
          deleteVendorId: id,
        },
      });
      return data.deleteVendor;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  },

  updateCompany: async (id: string, input: CompanyInput): Promise<Company> => {
    try {
      const { data } = await client.mutate<{ updateCompany: Company }>({
        mutation: UPDATE_COMPANY_MUTATION,
        variables: {
          updateCompanyId: id,
          input,
        },
      });
      console.log('Company updated successfully', data);
      return data.updateCompany;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  deleteCompany: async (id: string): Promise<boolean> => {
    try {
      const { data } = await client.mutate<GraphQLResponse<{ deleteCompany: boolean }>>({
        mutation: DELETE_COMPANY_MUTATION,
        variables: {
          deleteCompanyId: id,
        },
      });
      return data.data.deleteCompany;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  updateDomain: async (id: string, input: DomainInput): Promise<Domain> => {
    try {
      const { data } = await client.mutate<{ updateDomain: Domain }>({
        mutation: UPDATE_DOMAIN_MUTATION,
        variables: {
          updateDomainId: id,
          input,
        },
      });
      return data.updateDomain;
    } catch (error) {
      console.error('Error updating domain:', error);
      throw error;
    }
  },

  deleteDomain: async (id: string): Promise<boolean> => {
    try {
      const { data } = await client.mutate<GraphQLResponse<{ deleteDomain: boolean }>>({
        mutation: DELETE_DOMAIN_MUTATION,
        variables: {
          deleteDomainId: id,
        },
      });
      return data.data.deleteDomain;
    } catch (error) {
      console.error('Error deleting domain:', error);
      throw error;
    }
  },
};

export interface CompaniesResponse {
  companies: {
    items: Company[];
    pagination: PaginationInfo;
  };
}