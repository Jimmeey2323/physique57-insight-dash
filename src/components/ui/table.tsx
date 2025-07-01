
import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement> & {
  maxHeight?: string;
}>(({
  className,
  maxHeight = "600px",
  ...props
}, ref) => (
  <div className="relative w-full overflow-auto border border-border rounded-lg bg-card shadow-sm" style={{ maxHeight }}>
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <thead ref={ref} className={cn("sticky top-0 z-10 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 backdrop-blur-sm border-b", "[&_tr]:border-b-0", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", "[&_tr]:transition-colors", "[&_tr:hover]:bg-muted/50", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement> & {
  isClickable?: boolean;
}>(({
  className,
  isClickable = false,
  ...props
}, ref) => (
  <tfoot ref={ref} className={cn("sticky bottom-0 z-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 backdrop-blur-sm border-t-2 border-slate-300 font-medium shadow-lg", "[&>tr]:last:border-b-0", isClickable && "cursor-pointer hover:bg-gradient-to-r hover:from-slate-700 hover:via-slate-800 hover:to-slate-700 transition-colors", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & {
  isClickable?: boolean;
  isSubtotal?: boolean;
  isGroupHeader?: boolean;
}>(({
  className,
  isClickable = false,
  isSubtotal = false,
  isGroupHeader = false,
  ...props
}, ref) => (
  <tr ref={ref} className={cn("border-b transition-colors h-12", isClickable && "cursor-pointer hover:bg-muted/50", isSubtotal && "bg-muted/50 font-medium border-border", isGroupHeader && "bg-accent font-semibold border-l-4 border-l-primary", className)} {...props} />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | undefined;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({
  className,
  children,
  sortable = false,
  sortDirection,
  onSort,
  ...props
}, ref) => (
  <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-white", "[&:has([role=checkbox])]:pr-0", sortable && "cursor-pointer select-none", className)} onClick={sortable ? onSort : undefined} {...props}>
    <div className="flex items-center justify-between">
      {children}
      {sortable && (
        <div className="flex items-center ml-2">
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 animate-pulse" />
          ) : sortDirection === 'desc' ? (
            <ChevronDown className="h-4 w-4 animate-pulse" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-50 transition-opacity hover:opacity-100" />
          )}
        </div>
      )}
    </div>
  </th>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({
  className,
  ...props
}, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
