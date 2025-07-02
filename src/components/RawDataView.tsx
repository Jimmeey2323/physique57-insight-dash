
import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Filter, AlertTriangle, Calendar, CalendarCheck, Clock, Users, UserCheck, UserPlus, UserX, ArrowUpDown, RefreshCcw, Eye, Database, TrendingUp, Star, Award, Crown } from 'lucide-react';
import { safeFormatCurrency, safeFormatDate, daysBetweenDates, sortDataByColumn, calculateConversionSpan, calculateRetentionSpan, formatClientName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RawDataProps {
  newClientData: any[];
  bookingsData: any[];
  paymentsData: any[];
  processingResults: {
    included: any[];
    excluded: any[];
    newClients: any[];
    convertedClients: any[];
    retainedClients: any[];
  };
}

const RawDataView: React.FC<RawDataProps> = ({
  newClientData,
  bookingsData,
  paymentsData,
  processingResults
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('processing');
  const [clientRecordTab, setClientRecordTab] = useState('new');
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Summary counts
  const counts = useMemo(() => {
    const newClientCount = processingResults.newClients?.length || 0;
    const convertedClientCount = processingResults.convertedClients?.length || 0;
    const retainedClientCount = processingResults.retainedClients?.length || 0;
    const excludedCount = processingResults.excluded?.length || 0;
    const includedCount = processingResults.included?.length || 0;
    
    return {
      newClientCount,
      excludedCount,
      includedCount,
      totalClientsCount: newClientCount,
      conversionRate: newClientCount > 0 ? (convertedClientCount / newClientCount * 100).toFixed(1) : 0,
      retentionRate: newClientCount > 0 ? (retainedClientCount / newClientCount * 100).toFixed(1) : 0
    };
  }, [processingResults]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filterData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = data;
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterField && filterValue) {
      filtered = filtered.filter(item => {
        const itemValue = item[filterField];
        return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    if (sortColumn) {
      filtered = sortDataByColumn(filtered, sortColumn, sortDirection);
    }
    return filtered;
  };

  // Helper functions
  const getClientEmail = (client: any) => {
    if (!client) return '';
    return client['Email'] || client.email || client['Customer Email'] || '';
  };

  const getFirstVisitDate = (client: any) => {
    if (!client) return '';
    return client['First visit at'] || client.firstVisit || client.date || client['Visit Date'] || client['Class Date'] || '';
  };

  const getFirstPurchaseDate = (client: any) => {
    if (!client) return '';
    return client['First purchase date'] || client.purchaseDate || client.date || client.firstPurchaseDate || client['Purchase Date'] || '';
  };

  const getStudioLocation = (client: any) => {
    if (!client) return '';
    return client['First visit location'] || client.location || client.studio || client.Studio || client.Location || 'N/A';
  };

  const renderDataTable = (data: any[], type: string) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-slate-50/80 to-white/60 rounded-2xl border border-slate-200/50">
          <div className="p-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-6">
            <Database className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-800">No {type} Data Available</h3>
          <p className="text-slate-600 max-w-md leading-relaxed">
            No {type.toLowerCase()} data was found. Please ensure you've uploaded the correct CSV files and they contain valid data.
          </p>
        </div>
      );
    }

    const filteredData = filterData(data);
    const columns = Object.keys(filteredData[0] || {});
    const filterFields = columns.filter(col => !['id', 'uuid'].includes(col.toLowerCase()));

    return (
      <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/20">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {type} Data
                    <Star className="h-4 w-4 text-blue-400 animate-pulse" />
                  </div>
                  <div className="text-sm text-white/80 font-normal mt-1">Raw data from uploaded files</div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 font-bold">
                  <Users className="h-4 w-4 mr-2" />
                  {filteredData.length} records
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/60 pointer-events-none" />
                <Input 
                  placeholder="Search across all data..." 
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 transition-all duration-200" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  autoComplete="off" 
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Select field to filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="">All fields</SelectItem>
                    {filterFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filterField && (
                  <Input 
                    placeholder="Enter filter value..." 
                    className="w-[200px] bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30" 
                    value={filterValue} 
                    onChange={e => setFilterValue(e.target.value)} 
                    autoComplete="off" 
                  />
                )}
                
                {(filterField || searchTerm) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => {
                      setFilterField('');
                      setFilterValue('');
                      setSearchTerm('');
                    }}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead 
                      key={column} 
                      sortable 
                      sortDirection={sortColumn === column ? sortDirection : undefined} 
                      onSort={() => handleSort(column)}
                      className="text-white font-bold px-6 py-4"
                    >
                      <div className="flex items-center gap-2">
                        {column}
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-100/50">
                    {columns.map(column => (
                      <TableCell key={`${rowIndex}-${column}`} className="px-6 py-4">
                        <div className="font-medium text-slate-700">
                          {column.toLowerCase().includes('date') && row[column] 
                            ? safeFormatDate(row[column], 'medium')
                            : column.toLowerCase().includes('value') || 
                              column.toLowerCase().includes('revenue') || 
                              column.toLowerCase().includes('price')
                            ? safeFormatCurrency(row[column])
                            : row[column] !== undefined ? row[column].toString() : ''
                          }
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderProcessingAnalysis = () => {
    const hasProcessingData = processingResults && (
      processingResults.included?.length > 0 || 
      processingResults.excluded?.length > 0 || 
      processingResults.newClients?.length > 0 || 
      processingResults.convertedClients?.length > 0 || 
      processingResults.retainedClients?.length > 0
    );

    if (!hasProcessingData) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-200/50">
          <div className="p-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6">
            <AlertTriangle className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-800">No Processing Data Available</h3>
          <p className="text-slate-600 max-w-md leading-relaxed">
            No processed data was found. Please ensure you've processed your CSV files correctly and the analysis has been completed.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-semibold">New Clients</div>
                  <div className="text-2xl font-bold text-blue-800">{counts.newClientCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-emerald-600 font-semibold">Included</div>
                  <div className="text-2xl font-bold text-emerald-800">{counts.includedCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <UserX className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-red-600 font-semibold">Excluded</div>
                  <div className="text-2xl font-bold text-red-800">{counts.excludedCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-purple-600 font-semibold">Converted</div>
                  <div className="text-2xl font-bold text-purple-800">{processingResults.convertedClients?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-indigo-600 font-semibold">Conversion</div>
                  <div className="text-2xl font-bold text-indigo-800">{counts.conversionRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500/10 via-teal-600/5 to-transparent border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <RefreshCcw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-teal-600 font-semibold">Retention</div>
                  <div className="text-2xl font-bold text-teal-800">{counts.retentionRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Client Lists */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/20">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  Client Analysis & Processing Results
                  <Crown className="h-4 w-4 text-blue-400 animate-pulse" />
                </div>
                <div className="text-sm text-white/80 font-normal mt-1">Detailed breakdown by client status and metrics</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={clientRecordTab} onValueChange={setClientRecordTab}>
              <TabsList className="grid grid-cols-4 mb-6 h-auto p-2 bg-slate-100/80 backdrop-blur-sm rounded-xl">
                <TabsTrigger value="new" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> 
                    <span className="font-semibold">New Clients</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold px-2 py-1">
                    {processingResults.newClients?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="converted" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> 
                    <span className="font-semibold">Converted</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-bold px-2 py-1">
                    {processingResults.convertedClients?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="retained" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" /> 
                    <span className="font-semibold">Retained</span>
                  </div>
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs font-bold px-2 py-1">
                    {processingResults.retainedClients?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="excluded" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4" /> 
                    <span className="font-semibold">Excluded</span>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-bold px-2 py-1">
                    {processingResults.excluded?.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input 
                    placeholder="Search clients by name, email, or location..." 
                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200" 
                    value={clientSearchTerm} 
                    onChange={e => setClientSearchTerm(e.target.value)} 
                    autoComplete="off" 
                  />
                </div>
              </div>

              <TabsContent value="new">
                {renderClientTable(processingResults.newClients || [], 'new')}
              </TabsContent>
              
              <TabsContent value="converted">
                {renderClientTable(processingResults.convertedClients || [], 'converted')}
              </TabsContent>
              
              <TabsContent value="retained">
                {renderClientTable(processingResults.retainedClients || [], 'retained')}
              </TabsContent>
              
              <TabsContent value="excluded">
                {renderClientTable(processingResults.excluded || [], 'excluded')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderClientTable = (clients: any[], type: string) => {
    const filteredClients = clients.filter(client => {
      if (!clientSearchTerm) return true;
      const searchLower = clientSearchTerm.toLowerCase();
      const clientName = formatClientName(client).toLowerCase();
      const clientEmail = getClientEmail(client).toLowerCase();
      const location = getStudioLocation(client).toLowerCase();
      return clientName.includes(searchLower) || 
             clientEmail.includes(searchLower) || 
             location.includes(searchLower);
    });

    return (
      <Card className="bg-gradient-to-br from-white/90 to-slate-50/80 border border-slate-200/50 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                  <TableHead className="text-white font-bold">Client Information</TableHead>
                  <TableHead className="text-white font-bold">Contact</TableHead>
                  <TableHead className="text-white font-bold">First Visit</TableHead>
                  <TableHead className="text-white font-bold">Location</TableHead>
                  {type === 'converted' && <TableHead className="text-white font-bold">First Purchase</TableHead>}
                  {type === 'converted' && <TableHead className="text-white font-bold">Purchase Item</TableHead>}
                  {type === 'converted' && <TableHead className="text-white font-bold">Value</TableHead>}
                  {type === 'retained' && <TableHead className="text-white font-bold">Post-Trial Visit</TableHead>}
                  <TableHead className="text-white font-bold">Status/Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? filteredClients.map((client, index) => (
                  <TableRow key={index} className="hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-100/50">
                    <TableCell className="font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        {formatClientName(client)}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{getClientEmail(client)}</TableCell>
                    <TableCell className="text-slate-600">{safeFormatDate(getFirstVisitDate(client), 'medium')}</TableCell>
                    <TableCell className="text-slate-600">{getStudioLocation(client)}</TableCell>
                    {type === 'converted' && <TableCell className="text-slate-600">{safeFormatDate(getFirstPurchaseDate(client), 'medium')}</TableCell>}
                    {type === 'converted' && <TableCell className="text-slate-600">{client.item || client.Product || 'N/A'}</TableCell>}
                    {type === 'converted' && <TableCell className="font-semibold text-green-700">{safeFormatCurrency(client.saleValue || client.Price)}</TableCell>}
                    {type === 'retained' && <TableCell className="text-slate-600">{safeFormatDate(client.firstVisitPostTrial, 'medium')}</TableCell>}
                    <TableCell>
                      <Badge 
                        className={`${
                          type === 'excluded' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : type === 'converted'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : type === 'retained'
                            ? 'bg-teal-100 text-teal-700 border-teal-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        } font-semibold`}
                      >
                        {client.reason || (
                          type === 'excluded' ? 'Excluded' : 
                          type === 'converted' ? 'Converted' : 
                          type === 'retained' ? 'Retained' : 'Included'
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={type === 'converted' ? 8 : type === 'retained' ? 6 : 5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-8 w-8 text-slate-400" />
                        <p className="text-slate-600 font-medium">No {type} clients found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                Raw Data Analysis
                <Star className="h-5 w-5 text-blue-400 animate-pulse" />
              </div>
              <div className="text-sm text-white/80 font-normal mt-1">
                Comprehensive view of uploaded data and processing results
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 h-auto p-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40">
          <TabsTrigger value="processing" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">Processing Analysis</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">New Clients</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold">
              {newClientData?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">Bookings</span>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-bold">
              {bookingsData?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">Payments</span>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-bold">
              {paymentsData?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="processing" className="animate-fade-in">
          {renderProcessingAnalysis()}
        </TabsContent>
        
        <TabsContent value="new" className="animate-fade-in">
          {renderDataTable(newClientData || [], 'New Client')}
        </TabsContent>
        
        <TabsContent value="bookings" className="animate-fade-in">
          {renderDataTable(bookingsData || [], 'Bookings')}
        </TabsContent>
        
        <TabsContent value="payments" className="animate-fade-in">
          {renderDataTable(paymentsData || [], 'Payments')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawDataView;
