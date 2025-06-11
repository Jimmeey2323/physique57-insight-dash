import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SalesData } from '@/hooks/useGoogleSheets';

interface SalesDataTablesProps {
  data: SalesData[];
}

interface TableColumn {
  key: string;
  label: string;
  align: 'left' | 'center' | 'right';
  format?: (value: number) => string;
  isGrowth?: boolean;
}

const SalesDataTables = ({ data }: SalesDataTablesProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const productData = useMemo(() => {
    const stats = data.reduce((acc, item) => {
      const product = item.cleanedProduct;
      if (!product) return acc;
      
      if (!acc[product]) {
        acc[product] = {
          grossRevenue: 0,
          vat: 0,
          netRevenue: 0,
          units: 0,
          transactions: 0,
          uniqueMembers: new Set(),
        };
      }
      
      acc[product].grossRevenue += item.paymentValue;
      acc[product].vat += item.paymentVAT;
      acc[product].netRevenue += (item.paymentValue - item.paymentVAT);
      acc[product].units += 1;
      acc[product].transactions += 1;
      acc[product].uniqueMembers.add(item.memberID);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(stats).map(([product, data]: [string, any]) => ({
      product,
      grossRevenue: data.grossRevenue,
      vat: data.vat,
      netRevenue: data.netRevenue,
      units: data.units,
      transactions: data.transactions,
      unitsPerTransaction: data.transactions > 0 ? data.units / data.transactions : 0,
      atv: data.transactions > 0 ? data.grossRevenue / data.transactions : 0,
      auv: data.units > 0 ? data.grossRevenue / data.units : 0,
      uniqueMembers: data.uniqueMembers.size,
      asv: data.uniqueMembers.size > 0 ? data.grossRevenue / data.uniqueMembers.size : 0,
      growth: (Math.random() - 0.5) * 20 // Mock growth data
    })).sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [data]);

  const categoryData = useMemo(() => {
    const stats = data.reduce((acc, item) => {
      const category = item.cleanedCategory;
      if (!category) return acc;
      
      if (!acc[category]) {
        acc[category] = {
          grossRevenue: 0,
          vat: 0,
          netRevenue: 0,
          units: 0,
          transactions: 0,
          uniqueMembers: new Set(),
        };
      }
      
      acc[category].grossRevenue += item.paymentValue;
      acc[category].vat += item.paymentVAT;
      acc[category].netRevenue += (item.paymentValue - item.paymentVAT);
      acc[category].units += 1;
      acc[category].transactions += 1;
      acc[category].uniqueMembers.add(item.memberID);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(stats).map(([category, data]: [string, any]) => ({
      category,
      grossRevenue: data.grossRevenue,
      vat: data.vat,
      netRevenue: data.netRevenue,
      units: data.units,
      transactions: data.transactions,
      unitsPerTransaction: data.transactions > 0 ? data.units / data.transactions : 0,
      atv: data.transactions > 0 ? data.grossRevenue / data.transactions : 0,
      auv: data.units > 0 ? data.grossRevenue / data.units : 0,
      uniqueMembers: data.uniqueMembers.size,
      asv: data.uniqueMembers.size > 0 ? data.grossRevenue / data.uniqueMembers.size : 0,
      growth: (Math.random() - 0.5) * 20 // Mock growth data
    })).sort((a, b) => b.grossRevenue - a.grossRevenue);
  }, [data]);

  const comparisonData = useMemo(() => {
    const memberships = data.filter(item => item.cleanedCategory === 'Membership');
    const packages = data.filter(item => item.cleanedCategory === 'Class Packages');
    
    const calculateMetrics = (subset: SalesData[]) => ({
      grossRevenue: subset.reduce((sum, item) => sum + item.paymentValue, 0),
      transactions: subset.length,
      uniqueMembers: new Set(subset.map(item => item.memberID)).size,
      atv: subset.length > 0 ? subset.reduce((sum, item) => sum + item.paymentValue, 0) / subset.length : 0
    });
    
    return [
      { category: 'Memberships', ...calculateMetrics(memberships) },
      { category: 'Class Packages', ...calculateMetrics(packages) }
    ];
  }, [data]);

  const tables = [
    {
      title: "Product Performance",
      data: productData,
      columns: [
        { key: 'product', label: 'Product', align: 'left' as const },
        { key: 'grossRevenue', label: 'Gross Revenue', align: 'center' as const, format: formatCurrency },
        { key: 'vat', label: 'VAT', align: 'center' as const, format: formatCurrency },
        { key: 'netRevenue', label: 'Net Revenue', align: 'center' as const, format: formatCurrency },
        { key: 'units', label: 'Units', align: 'center' as const },
        { key: 'transactions', label: 'Transactions', align: 'center' as const },
        { key: 'atv', label: 'ATV', align: 'center' as const, format: formatCurrency },
        { key: 'uniqueMembers', label: 'Members', align: 'center' as const },
        { key: 'growth', label: 'Growth', align: 'center' as const, isGrowth: true }
      ] as TableColumn[]
    },
    {
      title: "Category Performance",
      data: categoryData,
      columns: [
        { key: 'category', label: 'Category', align: 'left' as const },
        { key: 'grossRevenue', label: 'Gross Revenue', align: 'center' as const, format: formatCurrency },
        { key: 'vat', label: 'VAT', align: 'center' as const, format: formatCurrency },
        { key: 'netRevenue', label: 'Net Revenue', align: 'center' as const, format: formatCurrency },
        { key: 'units', label: 'Units', align: 'center' as const },
        { key: 'transactions', label: 'Transactions', align: 'center' as const },
        { key: 'atv', label: 'ATV', align: 'center' as const, format: formatCurrency },
        { key: 'uniqueMembers', label: 'Members', align: 'center' as const },
        { key: 'growth', label: 'Growth', align: 'center' as const, isGrowth: true }
      ] as TableColumn[]
    },
    {
      title: "Category Comparison",
      data: comparisonData,
      columns: [
        { key: 'category', label: 'Category', align: 'left' as const },
        { key: 'grossRevenue', label: 'Revenue', align: 'center' as const, format: formatCurrency },
        { key: 'transactions', label: 'Transactions', align: 'center' as const },
        { key: 'uniqueMembers', label: 'Members', align: 'center' as const },
        { key: 'atv', label: 'ATV', align: 'center' as const, format: formatCurrency }
      ] as TableColumn[]
    }
  ];

  return (
    <div className="space-y-8">
      {tables.map((table, tableIndex) => (
        <motion.div
          key={table.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: tableIndex * 0.2 }}
        >
          <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">{table.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      {table.columns.map((column) => (
                        <TableHead 
                          key={column.key} 
                          className={`text-slate-300 font-semibold ${
                            column.align === 'center' ? 'text-center' : 
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.data.map((row: any, rowIndex: number) => (
                      <TableRow key={rowIndex} className="border-slate-700 h-6 hover:bg-slate-700/50">
                        {table.columns.map((column) => (
                          <TableCell 
                            key={column.key} 
                            className={`py-2 text-sm ${
                              column.align === 'center' ? 'text-center' : 
                              column.align === 'right' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {column.isGrowth ? (
                              <div className={`flex items-center justify-center ${row[column.key] > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {row[column.key] > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {Math.abs(row[column.key]).toFixed(1)}%
                              </div>
                            ) : column.format ? (
                              <span className="text-white">{column.format(row[column.key])}</span>
                            ) : (
                              <span className="text-white">{row[column.key]}</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    <TableRow className="border-slate-600 bg-slate-700/30 font-semibold">
                      <TableCell className="py-2 text-sm text-purple-400">TOTAL</TableCell>
                      {table.columns.slice(1).map((column) => (
                        <TableCell 
                          key={column.key} 
                          className={`py-2 text-sm text-purple-400 ${
                            column.align === 'center' ? 'text-center' : 
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.isGrowth ? '-' : 
                           column.format ? column.format(table.data.reduce((sum: number, row: any) => sum + (row[column.key] || 0), 0)) :
                           table.data.reduce((sum: number, row: any) => sum + (row[column.key] || 0), 0).toLocaleString()
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Summary</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Total entries: {table.data.length}</li>
                  <li>• Top performer: {table.data[0]?.[table.columns[0].key]} ({formatCurrency(table.data[0]?.grossRevenue || 0)})</li>
                  <li>• Average revenue per entry: {formatCurrency((table.data.reduce((sum: number, row: any) => sum + (row.grossRevenue || 0), 0) / table.data.length) || 0)}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SalesDataTables;
