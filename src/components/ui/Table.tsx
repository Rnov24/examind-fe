import React, { forwardRef, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { tokens } from '@/components/system/tokens'

export type TableAccent = 'none' | 'lime' | 'violet' | 'midnight'
export type TableDensity = 'compact' | 'normal' | 'relaxed'

interface TableContextValue {
  density: TableDensity
}

const TableContext = createContext<TableContextValue>({ density: 'normal' })

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: TableAccent
}

const tableAccentStyles: Record<TableAccent, string> = {
  none: '',
  lime: cn(tokens.accentBarBase, tokens.semantic.lime.accentBar),
  violet: cn(tokens.accentBarBase, tokens.semantic.violet.accentBar),
  midnight: cn(tokens.accentBarBase, tokens.semantic.midnight.accentBar),
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, accent = 'none', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        tokens.surface.card,
        tokens.radius.xl,
        tokens.border.default,
        tokens.shadow.subtle,
        'overflow-hidden relative',
        tableAccentStyles[accent],
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto touch-pan-x">{children}</div>
    </div>
  )
)
TableContainer.displayName = 'TableContainer'


export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  density?: TableDensity
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, density = 'normal', children, ...props }, ref) => (
    <TableContext.Provider value={{ density }}>
      <table
        ref={ref}
        className={cn('w-full text-left border-collapse text-xs sm:text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </TableContext.Provider>
  )
)
Table.displayName = 'Table'

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider font-mono text-[10px] sm:text-[11px] select-none',
      className
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-slate-100 font-medium text-slate-700', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-slate-200 bg-slate-50/60 font-medium text-slate-600',
      className
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'hover:bg-slate-50/80 data-[state=selected]:bg-[#6a5fc1]/[0.05] transition-colors duration-150',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const densityHeadPadding: Record<TableDensity, string> = {
  compact: 'px-3 py-2.5',
  normal: 'p-3.5 sm:p-4',
  relaxed: 'p-4 sm:p-5',
}

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { density } = useContext(TableContext)
  return (
    <th
      ref={ref}
      className={cn(
        'font-bold text-slate-600 font-mono tracking-wider align-middle',
        densityHeadPadding[density],
        className
      )}
      {...props}
    />
  )
})
TableHead.displayName = 'TableHead'

const densityCellPadding: Record<TableDensity, string> = {
  compact: 'px-3 py-2.5',
  normal: 'p-3.5 sm:p-4',
  relaxed: 'p-4 sm:p-5',
}

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { density } = useContext(TableContext)
  return (
    <td
      ref={ref}
      className={cn(
        'align-middle text-slate-700 font-sans',
        densityCellPadding[density],
        className
      )}
      {...props}
    />
  )
})
TableCell.displayName = 'TableCell'

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-xs text-slate-500 font-mono tracking-tight', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export default Table
