import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // A simple logic for ellipsis
  let visiblePages = pages;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      visiblePages = [...pages.slice(0, 5), -1, totalPages];
    } else if (currentPage >= totalPages - 3) {
      visiblePages = [1, -1, ...pages.slice(totalPages - 5)];
    } else {
      visiblePages = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        {visiblePages.map((page, index) => {
          if (page === -1) {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More pages</span>
                </span>
              </li>
            );
          }

          return (
            <li key={page}>
              <Button
                variant={currentPage === page ? "default" : "ghost"}
                size="icon"
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={currentPage === page ? "" : "text-muted-foreground"}
              >
                {page}
              </Button>
            </li>
          );
        })}
        <li>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
