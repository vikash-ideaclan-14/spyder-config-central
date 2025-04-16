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
  const [pageInput, setPageInput] = useState(initialPage.toString());

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setPageInput('1');
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pageInput) {
      const page = parseInt(pageInput);
      if (!isNaN(page) && page > 0) {
        handlePageChange(page);
      }
    }
  };

  return {
    currentPage,
    pageSize,
    pageInput,
    handlePageChange,
    handlePageSizeChange,
    handlePageInputChange,
    handlePageInputSubmit,
  };
}; 