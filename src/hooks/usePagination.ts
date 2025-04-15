import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface PaginationState {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: string | null;
}

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

export const usePagination = ({ initialPage = 1, initialPageSize = 10 }: UsePaginationProps = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
}; 