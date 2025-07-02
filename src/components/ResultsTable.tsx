
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  UserCheck, 
  UserPlus, 
  ArrowUpDown,
  Eye,
  Calendar,
  Award,
  BarChart3,
  RefreshCcw,
  MapPin,
  Clock,
  AlertTriangle,
  Sparkles,
  Crown
} from 'lucide-react';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  onTeacherSelect?: (teacher: ProcessedTeacherData) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onTeacherSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [showDrillDown, setShowDrillDown] = useState(false);

  // Get unique locations and periods for filtering
  const { locations, periods } = useMemo(() => {
    const locationSet = new Set<string>();
    const periodSet = new Set<string>();
    
    data.forEach(item => {
      if (item.location) locationSet.add(item.location);
      if (item.period) periodSet.add(item.period);
    });
    
    return {
      locations: Array.from(locationSet).sort(),
      periods: Array.from(periodSet).sort()
    };
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.period?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !filterLocation || item.location === filterLocation;
      const matchesPeriod = !filterPeriod || item.period === filterPeriod;
      
      return matchesSearch && matchesLocation && matchesPeriod;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn as keyof ProcessedTeacherData] || 0;
        const bVal = b[sortColumn as keyof ProcessedTeacherData] || 0;
        
        const comparison = typeof aVal === 'string' 
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) - (bVal as number);
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, filterLocation, filterPeriod, sortColumn, sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => ({
      newClients: acc.newClients + (item.newClients || 0),
      retainedClients: acc.retainedClients + (item.retainedClients || 0),
      convertedClients: acc.convertedClients + (item.convertedClients || 0),
      totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
      trials: acc.trials + (item.trials || 0),
      referrals: acc.referrals + (item.referrals || 0),
      hosted: acc.hosted + (item.hosted || 0),
      influencerSignups: acc.influencerSignups + (item.influencerSignups || 0),
      others: acc.others + (item.others || 0),
      totalVisits: acc.totalVisits + (item.totalVisits || 0),
      noShows: acc.noShows + (item.noShows || 0),
      lateCancellations: acc.lateCancellations + (item.lateCancellations || 0),
    }), {
      newClients: 0,
      retainedClients: 0,
      convertedClients: 0,
      totalRevenue: 0,
      trials: 0,
      referrals: 0,
      hosted: 0,
      influencerSignups: 0,
      others: 0,
      totalVisits: 0,
      noShows: 0,
      lateCancellations: 0,
    });
  }, [filteredData]);

  // Calculate derived totals
  const derivedTotals = useMemo(() => ({
    retentionRate: totals.newClients > 0 ? (totals.retainedClients / totals.newClients * 100) : 0,
    conversionRate: totals.newClients > 0 ? (totals.convertedClients / totals.newClients * 100) : 0,
    averageRevenuePerClient: totals.newClients > 0 ? (totals.totalRevenue / totals.newClients) : 0,
    noShowRate: totals.totalVisits > 0 ? (totals.noShows / totals.totalVisits * 100) : 0,
    lateCancellationRate: totals.totalVisits > 0 ? (totals.lateCancellations / totals.totalVisits * 100) : 0,
  }), [totals]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterLocation('');
    setFilterPeriod('');
    setSortColumn(null);
  };

  const handleTotalsRowClick = () => {
    setShowDrillDown(!showDrillDown);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-slate-400" />
            <p className="text-xl font-semibold text-slate-800">No results data available</p>
            <p className="text-slate-600 max-w-md">
              Please upload and process your data files to view teacher performance results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Filters Card */}
      <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Global Filters & Search
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-sm text-white/80 font-normal mt-1">Apply filters across all data views</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search teachers, locations, periods..."
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Periods</SelectItem>
                {periods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || filterLocation || filterPeriod) && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="bg-slate-50 border-slate-200 hover:bg-white"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Teacher Performance Results
                <Crown className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-sm text-white/80 font-normal mt-1">Comprehensive performance metrics and analytics</div>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-white/30 px-4 py-2 font-bold">
              <Users className="h-4 w-4 mr-2" />
              {filteredData.length} teachers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'teacherName' ? sortDirection : undefined}
                    onSort={() => handleSort('teacherName')}
                    className="text-white font-bold min-w-[160px] px-4"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Teacher
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'location' ? sortDirection : undefined}
                    onSort={() => handleSort('location')}
                    className="text-white font-bold min-w-[120px] px-4"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'period' ? sortDirection : undefined}
                    onSort={() => handleSort('period')}
                    className="text-white font-bold min-w-[120px] px-4"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Period
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'newClients' ? sortDirection : undefined}
                    onSort={() => handleSort('newClients')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      New Clients
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'retainedClients' ? sortDirection : undefined}
                    onSort={() => handleSort('retainedClients')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Retained
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'retentionRate' ? sortDirection : undefined}
                    onSort={() => handleSort('retentionRate')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Retention %
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'convertedClients' ? sortDirection : undefined}
                    onSort={() => handleSort('convertedClients')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Target className="h-4 w-4" />
                      Converted
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'conversionRate' ? sortDirection : undefined}
                    onSort={() => handleSort('conversionRate')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4" />
                      Conversion %
                    </div>
                  </TableHead>
                  <TableHead 
                    sortable 
                    sortDirection={sortColumn === 'totalRevenue' ? sortDirection : undefined}
                    onSort={() => handleSort('totalRevenue')}
                    className="text-white font-bold text-center min-w-[120px] px-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Revenue
                    </div>
                  </TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[100px] px-4">Trials</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[100px] px-4">Referrals</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[100px] px-4">Hosted</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[120px] px-4">Influencer</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[100px] px-4">Others</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[140px] px-4">Avg Revenue</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[120px] px-4">No Show %</TableHead>
                  <TableHead className="text-white font-bold text-center min-w-[140px] px-4">Late Cancel %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((teacher, index) => (
                  <TableRow 
                    key={`${teacher.teacherName}-${teacher.location}-${teacher.period}`}
                    className="hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-100/50 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => onTeacherSelect?.(teacher)}
                  >
                    <TableCell className="font-semibold text-slate-800 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        {teacher.teacherName}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 px-4">{teacher.location || 'N/A'}</TableCell>
                    <TableCell className="text-slate-600 px-4">{teacher.period || 'N/A'}</TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold">
                        {teacher.newClients || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200 font-bold">
                        {teacher.retainedClients || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-teal-100 text-teal-800 border-teal-200 font-bold">
                        {safeToFixed(teacher.retentionRate || 0, 1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold">
                        {teacher.convertedClients || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-bold">
                        {safeToFixed(teacher.conversionRate || 0, 1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold">
                        {safeFormatCurrency(teacher.totalRevenue || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4 text-slate-600 font-medium">{teacher.trials || 0}</TableCell>
                    <TableCell className="text-center px-4 text-slate-600 font-medium">{teacher.referrals || 0}</TableCell>
                    <TableCell className="text-center px-4 text-slate-600 font-medium">{teacher.hosted || 0}</TableCell>
                    <TableCell className="text-center px-4 text-slate-600 font-medium">{teacher.influencerSignups || 0}</TableCell>
                    <TableCell className="text-center px-4 text-slate-600 font-medium">{teacher.others || 0}</TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-bold">
                        {safeFormatCurrency(teacher.averageRevenuePerClient || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-red-100 text-red-800 border-red-200 font-bold">
                        {safeToFixed(teacher.noShowRate || 0, 1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-bold">
                        {safeToFixed(teacher.lateCancellationRate || 0, 1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow 
                  className="border-t-2 border-slate-300/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 cursor-pointer hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300"
                  onClick={handleTotalsRowClick}
                >
                  <TableCell className="font-bold text-white px-4" colSpan={3}>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>TOTALS</span>
                      <Eye className="h-4 w-4 ml-2 opacity-60" />
                      <span className="text-xs opacity-80">(Click for drill-down)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.newClients}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.retainedClients}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeToFixed(derivedTotals.retentionRate, 1)}%</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.convertedClients}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeToFixed(derivedTotals.conversionRate, 1)}%</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeFormatCurrency(totals.totalRevenue)}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.trials}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.referrals}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.hosted}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.influencerSignups}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{totals.others}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeFormatCurrency(derivedTotals.averageRevenuePerClient)}</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeToFixed(derivedTotals.noShowRate, 1)}%</TableCell>
                  <TableCell className="text-center font-bold text-white px-4">{safeToFixed(derivedTotals.lateCancellationRate, 1)}%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Drill-down section */}
      {showDrillDown && (
        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/50 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white border-b border-blue-300/30">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  Detailed Performance Breakdown
                  <Sparkles className="h-4 w-4 text-blue-300 animate-pulse" />
                </div>
                <div className="text-sm text-blue-100 font-normal mt-1">Aggregated totals with performance insights</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
                <div className="text-sm text-blue-600 font-semibold mb-1">Total Teachers</div>
                <div className="text-2xl font-bold text-blue-800">{filteredData.length}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50">
                <div className="text-sm text-green-600 font-semibold mb-1">Avg New Clients</div>
                <div className="text-2xl font-bold text-green-800">
                  {filteredData.length > 0 ? safeToFixed(totals.newClients / filteredData.length, 1) : 0}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                <div className="text-sm text-purple-600 font-semibold mb-1">Avg Revenue</div>
                <div className="text-2xl font-bold text-purple-800">
                  {safeFormatCurrency(filteredData.length > 0 ? totals.totalRevenue / filteredData.length : 0)}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50">
                <div className="text-sm text-amber-600 font-semibold mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-amber-800">
                  {safeToFixed((derivedTotals.retentionRate + derivedTotals.conversionRate) / 2, 1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsTable;
