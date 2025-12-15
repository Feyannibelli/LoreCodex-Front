import React from 'react';
import Button from './Button'; // Fixed import
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaginationControlsProps {
    hasNext?: boolean;
    hasPrevious?: boolean;
    currentPage: number;
    totalPages?: number;
    onNext: () => void;
    onPrev: () => void;
    onPageChange?: (page: number) => void;
    className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    hasNext,
    hasPrevious,
    currentPage,
    totalPages = 0,
    onNext,
    onPrev,
    onPageChange,
    className
}) => {
    // Generate page numbers to display (e.g., 1 2 3 ... 10)
    // Simple version: just show prev/next and current

    return (
        <div className={cn("flex items-center justify-center gap-4 py-8", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={onPrev}
                disabled={!hasPrevious}
                className="h-10 w-10 border-white/10 bg-secondary/50 hover:bg-secondary text-primary"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm font-medium text-muted-foreground min-w-[100px] text-center">
                Page <span className="text-foreground">{currentPage + 1}</span> of <span className="text-foreground">{totalPages}</span>
            </span>

            <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                className="h-10 w-10 border-white/10 bg-secondary/50 hover:bg-secondary text-primary"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default PaginationControls;
