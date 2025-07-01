
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { ChevronDown, ChevronUp, Award, TrendingUp, TrendingDown, DollarSign, Users, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/currencyFormatter';
import { safeToFixed } from '@/lib/utils';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  onDrillDown?: (teacherName: string) => void;
}

type SortField = keyof ProcessedTeacherData;
type SortDirection = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onDrillDown }) => {
  const [sortField, setSortField] = useState<SortField>('teacherName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter out "All Trainers" rows and calculate totals
  const { filteredData, totals } = useMemo(() => {
    const filtered = data.filter(item => 
      item.teacherName &&
      item.teacherName.toLowerCase() !== 'all trainers' &&
      item.teacherName.toLowerCase() !== 'total' &&
      item.teacherName.toLowerCase() !== 'summary'
    );

    const totals = filtered.reduce((acc, item) => ({
      teacherName: 'TOTALS',
      location: 'All Locations',
      period: 'All Periods',
      newClients: acc.newClients + (item.newClients || 0),
      retainedClients: acc.retainedClients + (item.retainedClients || 0),
      retentionRate: 0, // Will calculate after
      convertedClients: acc.convertedClients + (item.convertedClients || 0),
      conversionRate: 0, // Will calculate after
      totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
      trials: acc.trials + (item.trials || 0),
      referrals: acc.referrals + (item.referrals || 0),
      hosted: acc.hosted + (item.hosted || 0),
      influencerSignups: acc.influencerSignups + (item.influencerSignups || 0),
      others: acc.others + (item.others || 0),
      averageRevenuePerClient: 0, // Will calculate after
      noShowRate: 0, // Will calculate after
      lateCancellationRate: 0, // Will calculate after
      totalVisits: acc.totalVisits + (item.totalVisits || 0),
      noShows: acc.noShows + (item.noShows || 0),
      cancellations: acc.cancellations + (item.cancellations || 0),
      totalClasses: acc.totalClasses + (item.totalClasses || 0),
      trialToMembershipConversion: 0,
      referralConversionRate: 0,
      influencerConversionRate: 0
    }), {
      teacherName: 'TOTALS',
      location: 'All Locations', 
      period: 'All Periods',
      newClients: 0,
      retainedClients: 0,
      retentionRate: 0,
      convertedClients: 0,
      conversionRate: 0,
      totalRevenue: 0,
      trials: 0,
      referrals: 0,
      hosted: 0,
      influencerSignups: 0,
      others: 0,
      averageRevenuePerClient: 0,
      noShowRate: 0,
      lateCancellationRate: 0,
      totalVisits: 0,
      noShows: 0,
      cancellations: 0,
      totalClasses: 0,
      trialToMembershipConversion: 0,
      referralConversionRate: 0,
      influencerConversionRate: 0
    });

    // Calculate derived totals
    totals.retentionRate = totals.newClients > 0 ? (totals.retainedClients / totals.newClients) * 100 : 0;
    totals.conversionRate = totals.newClients > 0 ? (totals.convertedClients / totals.newClients) * 100 : 0;
    totals.averageRevenuePerClient = totals.newClients > 0 ? totals.totalRevenue / totals.newClients : 0;
    totals.noShowRate = totals.totalVisits > 0 ? (totals.noShows / totals.totalVisits) * 100 : 0;
    totals.lateCancellationRate = totals.totalVisits > 0 ? (totals.cancellations / totals.totalVisits) * 100 : 0;

    return { filteredData: filtered, totals };
  }, [data]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;
      
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTotalsClick = () => {
    if (onDrillDown) {
      onDrillDown('TOTALS');
    }
  };

  const getPerformanceBadge = (conversionRate: number, retentionRate: number) => {
    const avgScore = (conversionRate + retentionRate) / 2;
    if (avgScore >= 70) return <Badge variant="success">Excellent</Badge>;
    if (avgScore >= 50) return <Badge variant="info">Good</Badge>;
    if (avgScore >= 30) return <Badge variant="warning">Average</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Performance Results</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No data available. Please upload and process files first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-blue-500" />
          Teacher Performance Results
          <Badge variant="info" className="ml-auto">{filteredData.length} teachers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table maxHeight="800px">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-800 to-slate-900">
              <TableHead 
                className="text-white font-medium cursor-pointer"
                onClick={() => handleSort('teacherName')}
                sortable
                sortDirection={sortField === 'teacherName' ? sortDirection : undefined}
              >
                Teacher
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer"
                onClick={() => handleSort('location')}
                sortable
                sortDirection={sortField === 'location' ? sortDirection : undefined}
              >
                Location
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('newClients')}
                sortable
                sortDirection={sortField === 'newClients' ? sortDirection : undefined}
              >
                New Clients
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('retentionRate')}
                sortable
                sortDirection={sortField === 'retentionRate' ? sortDirection : undefined}
              >
                Retention
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('conversionRate')}
                sortable
                sortDirection={sortField === 'conversionRate' ? sortDirection : undefined}
              >
                Conversion
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('totalRevenue')}
                sortable
                sortDirection={sortField === 'totalRevenue' ? sortDirection : undefined}
              >
                Revenue
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('averageRevenuePerClient')}
                sortable
                sortDirection={sortField === 'averageRevenuePerClient' ? sortDirection : undefined}
              >
                Avg/Client
              </TableHead>
              <TableHead 
                className="text-white font-medium cursor-pointer text-center"
                onClick={() => handleSort('noShowRate')}
                sortable
                sortDirection={sortField === 'noShowRate' ? sortDirection : undefined}
              >
                No Shows
              </TableHead>
              <TableHead className="text-white font-medium text-center">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((teacher, index) => (
              <TableRow 
                key={`${teacher.teacherName}-${index}`}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => onDrillDown?.(teacher.teacherName)}
              >
                <TableCell>
                  <div className="font-medium text-slate-900">{teacher.teacherName}</div>
                  <div className="text-xs text-slate-500">{teacher.period}</div>
                </TableCell>
                <TableCell className="text-slate-600">{teacher.location}</TableCell>
                <TableCell className="text-center">
                  <div className="font-medium text-slate-900">{teacher.newClients || 0}</div>
                  <div className="text-xs text-slate-500">
                    {teacher.retainedClients || 0} retained, {teacher.convertedClients || 0} converted
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="retention">
                    {formatPercentage(teacher.retentionRate || 0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="conversion">
                    {formatPercentage(teacher.conversionRate || 0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-bold text-slate-900">{formatCurrency(teacher.totalRevenue || 0)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-medium text-slate-700">{formatCurrency(teacher.averageRevenuePerClient || 0)}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={teacher.noShowRate && teacher.noShowRate > 15 ? "destructive" : "secondary"}>
                    {formatPercentage(teacher.noShowRate || 0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {getPerformanceBadge(teacher.conversionRate || 0, teacher.retentionRate || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow 
              className="bg-gradient-to-r from-slate-800 to-slate-900 cursor-pointer hover:from-slate-700 hover:to-slate-800 transition-colors"
              onClick={handleTotalsClick}
            >
              <TableCell className="font-bold text-white" colSpan={2}>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>TEAM TOTALS</span>
                  <span className="text-xs text-slate-300">(click for details)</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="font-bold text-white">{totals.newClients}</div>
                <div className="text-xs text-slate-300">{totals.retainedClients} retained, {totals.convertedClients} converted</div>
              </TableCell>
              <TableCell className="text-center font-bold text-white">
                {formatPercentage(totals.retentionRate)}
              </TableCell>
              <TableCell className="text-center font-bold text-white">
                {formatPercentage(totals.conversionRate)}
              </TableCell>
              <TableCell className="text-center font-bold text-white">
                {formatCurrency(totals.totalRevenue)}
              </TableCell>
              <TableCell className="text-center font-bold text-white">
                {formatCurrency(totals.averageRevenuePerClient)}
              </TableCell>
              <TableCell className="text-center font-bold text-white">
                {formatPercentage(totals.noShowRate)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="premium">Active Team</Badge>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
