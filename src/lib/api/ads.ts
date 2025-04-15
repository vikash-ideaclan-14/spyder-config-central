// import { request, gql } from 'graphql-request';
// import { GRAPHQL_ENDPOINT } from '../config';

// const GET_ADS = gql`
//   query Ads($pagination: PaginationInput!) {
//     ads(pagination: $pagination) {
//       items {
//         id
//         title
//         body
//         imageUrl
//         videoUrl
//         url
//         display_format
//         startDate
//         endDate
//         vendor {
//           id
//           name
//         }
//         company {
//           id
//           name
//         }
//         domain {
//           id
//           domain
//         }
//         language {
//           id
//           name
//         }
//         countries {
//           id
//           name
//         }
//       }
//       pagination {
//         total
//         page
//         pageSize
//         totalPages
//         hasNextPage
//         hasPreviousPage
//       }
//     }
//   }
// `;

// export const adApi = {
//   getAds: async (page: number = 1, pageSize: number = 20, sortBy: string | null = null, sortOrder: string | null = null) => {
//     try {
//       const data = await request<{ ads: any }>(GRAPHQL_ENDPOINT, GET_ADS, {
//         pagination: {
//           page,
//           pageSize,
//           sortBy,
//           sortOrder
//         }
//       });
//       return data.ads;
//     } catch (error) {
//       console.error('Error fetching ads:', error);
//       throw error;
//     }
//   }
// }; 