
import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Filter, AlertTriangle, Calendar, CalendarCheck, Clock, Users, UserCheck, UserPlus, UserX, ArrowUpDown, RefreshCcw } from 'lucide-react';
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

  // Summary counts - using useMemo for performance
  const counts = useMemo(() => {
    const newClientCount = processingResults.newClients?.length || 0;
    const convertedClientCount = processingResults.convertedClients?.length || 0;
    const retainedClientCount = processingResults.retainedClients?.length || 0;
    const excludedCount = processingResults.excluded?.length || 0;
    const includedCount = processingResults.included?.length || 0;
    
    // Fix: Total records should be the sum of included and excluded records
    return {
      newClientCount,
      excludedCount,
      includedCount,
      totalClientsCount: newClientCount, // Fixed to be newClientCount instead of includedCount + excludedCount
      conversionRate: newClientCount > 0 ? (convertedClientCount / newClientCount * 100).toFixed(1) : 0,
      retentionRate: newClientCount > 0 ? (retainedClientCount / newClientCount * 100).toFixed(1) : 0
    };
  }, [processingResults]);

  // Helper function to deduplicate records by email
  const deduplicateByEmail = (records: any[]) => {
    if (!records || !Array.isArray(records)) return [];
    const seen = new Set();
    return records.filter(item => {
      const email = item['Email'] || item.email || '';
      if (email && !seen.has(email)) {
        seen.add(email);
        return true;
      }
      return false;
    });
  };

  // Filter client records based on search term
  const filterClientRecords = (records: any[]) => {
    if (!records || !Array.isArray(records) || records.length === 0) return [];
    if (!clientSearchTerm) return records;
    return records.filter(record => {
      const clientName = formatClientName(record).toLowerCase();
      const clientEmail = (record['Email'] || record.email || '').toLowerCase();
      const searchTermLower = clientSearchTerm.toLowerCase();
      
      // Added search for studio/location and reason fields
      const location = (record['First visit location'] || record.location || record.studio || record.Studio || '').toLowerCase();
      const reason = (record.reason || '').toLowerCase();
      
      return clientName.includes(searchTermLower) || 
             clientEmail.includes(searchTermLower) ||
             location.includes(searchTermLower) ||
             reason.includes(searchTermLower);
    });
  };

  // Handle search input event
  useEffect(() => {
    // Reset search and filter values when changing tabs
    if (currentTab !== 'processing') {
      setClientSearchTerm('');
      setFilterField('');
      setFilterValue('');
    }
  }, [currentTab]);

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

    // Apply search term filtering
    let filtered = data;
    if (searchTerm) {
      filtered = filtered.filter(item => Object.values(item).some(val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())));
    }

    // Apply specific field filtering
    if (filterField && filterValue) {
      filtered = filtered.filter(item => {
        const itemValue = item[filterField];
        return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    // Apply sorting
    if (sortColumn) {
      filtered = sortDataByColumn(filtered, sortColumn, sortDirection);
    }
    return filtered;
  };

  // Helper to get email
  const getClientEmail = (client: any) => {
    if (!client) return '';
    return client['Email'] || client.email || '';
  };

  // Helper to get dates
  const getFirstVisitDate = (client: any) => {
    if (!client) return '';
    return client['First visit at'] || client.firstVisit || client.date || '';
  };

  // Helper to get first purchase date
  const getFirstPurchaseDate = (client: any) => {
    if (!client) return '';
    return client['First purchase date'] || client.purchaseDate || client.date || client.firstPurchaseDate || '';
  };

  // Helper to get location
  const getStudioLocation = (client: any) => {
    if (!client) return '';
    return client['First visit location'] || client.location || client.studio || client.Studio || 'N/A';
  };

  // Helper to get first visit post trial
  const getFirstVisitPostTrial = (client: any) => {
    if (!client) return '';

    // Find the client's visit post trial date
    if (client.firstVisitPostTrial) return client.firstVisitPostTrial;
    if (client.postTrialVisitDate) return client.postTrialVisitDate;
    if (client.visitsPostTrial && client.visitsPostTrial.length > 0) {
      return client.visitsPostTrial[0].date;
    }

    // If we have multiple visits and the client is retained, the second visit is likely post-trial
    const visits = bookingsData.filter(booking => booking.email === getClientEmail(client) || booking['Client email'] === getClientEmail(client) || booking['Customer Email'] === getClientEmail(client) || booking['Email'] === getClientEmail(client));
    if (visits.length > 1) {
      // Sort visits by date
      const sortedVisits = visits.sort((a, b) => {
        const dateA = new Date(a.date || a['Visit date'] || a['Class Date'] || a.Date || '');
        const dateB = new Date(b.date || b['Visit date'] || b['Class Date'] || b.Date || '');
        return dateA.getTime() - dateB.getTime();
      });

      // Return the second visit date as post-trial
      if (sortedVisits.length > 1) {
        return sortedVisits[1].date || sortedVisits[1]['Visit date'] || sortedVisits[1]['Class Date'] || sortedVisits[1].Date || '';
      }
    }
    return '';
  };

  // Deduplicate exclusion records by email
  const uniqueExcludedRecords = useMemo(() => deduplicateByEmail(processingResults.excluded || []), [processingResults.excluded]);
  const hasProcessingData = useMemo(() => processingResults && (processingResults.included && processingResults.included.length > 0 || processingResults.excluded && processingResults.excluded.length > 0 || processingResults.newClients && processingResults.newClients.length > 0 || processingResults.convertedClients && processingResults.convertedClients.length > 0 || processingResults.retainedClients && processingResults.retainedClients.length > 0), [processingResults]);

  // Filter client data based on current tab and search term
  const filteredClientRecords = useMemo(() => {
    switch (clientRecordTab) {
      case 'new':
        return filterClientRecords(processingResults.newClients || []);
      case 'converted':
        return filterClientRecords(processingResults.convertedClients || []);
      case 'retained':
        return filterClientRecords(processingResults.retainedClients || []);
      case 'excluded':
        return filterClientRecords(uniqueExcludedRecords || []);
      default:
        return [];
    }
  }, [clientRecordTab, clientSearchTerm, processingResults, uniqueExcludedRecords]);

  const renderDataTable = (data: any[], type: string) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No {type} Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No {type.toLowerCase()} data was found. Please ensure you've uploaded the correct CSV files.
          </p>
        </div>;
    }
    const filteredData = filterData(data);
    const columns = Object.keys(filteredData[0] || {});

    // Get available filter fields
    const filterFields = columns.filter(col => !['id', 'uuid'].includes(col.toLowerCase()));
    return <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {type} Data
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {filteredData.length} rows
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="search-data-input" placeholder="Search data..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoComplete="off" />
              </div>
              
              {/* Field filter */}
              <div className="flex items-center gap-2">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select field</SelectItem>
                    {filterFields.map(field => <SelectItem key={field} value={field}>{field}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                {filterField && <Input placeholder="Filter value..." className="w-[180px]" value={filterValue} onChange={e => setFilterValue(e.target.value)} autoComplete="off" />}
                
                {(filterField || searchTerm) && <Button variant="outline" size="sm" onClick={() => {
                setFilterField('');
                setFilterValue('');
                setSearchTerm('');
              }}>
                    Clear filters
                  </Button>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => <TableHead key={column} sortable sortDirection={sortColumn === column ? sortDirection : undefined} onSort={() => handleSort(column)}>
                      {column}
                    </TableHead>)}
                  {type === 'Processing Results' && <TableHead>Status/Reason</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => <TableRow key={rowIndex} className="animate-fade-in" style={{
                animationDelay: `${rowIndex * 30}ms`
              }}>
                    {columns.map(column => <TableCell key={`${rowIndex}-${column}`}>
                        {column.toLowerCase().includes('date') && row[column] ? safeFormatDate(row[column], 'medium') : column.toLowerCase().includes('value') || column.toLowerCase().includes('revenue') || column.toLowerCase().includes('price') ? safeFormatCurrency(row[column]) : row[column] !== undefined ? row[column].toString() : ''}
                      </TableCell>)}
                    
                    {type === 'Processing Results' && <TableCell>
                        {processingResults.excluded.some(item => item.id === row.id || item.email === row.email) ? <Badge variant="excluded">Excluded</Badge> : processingResults.newClients.some(item => item.id === row.id || item.email === row.email) ? <Badge variant="default">New Client</Badge> : processingResults.convertedClients.some(item => item.id === row.id || item.email === row.email) ? <Badge variant="conversion">Converted</Badge> : processingResults.retainedClients.some(item => item.id === row.id || item.email === row.email) ? <Badge variant="retention">Retained</Badge> : <Badge variant="secondary">Processed</Badge>}
                      </TableCell>}
                  </TableRow>)}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>;
  };

  const renderClientDetailsTables = () => {
    return <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Client Details</h3>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search clients, locations, reasons..." className="pl-8 w-64" value={clientSearchTerm} onChange={e => setClientSearchTerm(e.target.value)} autoComplete="off" />
            </div>
          </div>
        </div>
        
        <Tabs value={clientRecordTab} onValueChange={setClientRecordTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="new" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> 
              New Clients 
              <Badge variant="outline" className="ml-1">{processingResults.newClients?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="converted" className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" /> 
              Converted 
              <Badge variant="outline" className="ml-1">{processingResults.convertedClients?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="retained" className="flex items-center gap-1">
              <RefreshCcw className="h-4 w-4" /> 
              Retained 
              <Badge variant="outline" className="ml-1">{processingResults.retainedClients?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="excluded" className="flex items-center gap-1">
              <UserX className="h-4 w-4" /> 
              Excluded 
              <Badge variant="outline" className="ml-1">{uniqueExcludedRecords?.length || 0}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>First Visit</TableHead>
                        <TableHead>Studio/Location</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientRecords.length > 0 ? filteredClientRecords.map((client, index) => <TableRow key={index} className="animate-fade-in">
                            <TableCell className="font-medium">{formatClientName(client)}</TableCell>
                            <TableCell>{getClientEmail(client)}</TableCell>
                            <TableCell>{safeFormatDate(getFirstVisitDate(client), 'medium')}</TableCell>
                            <TableCell>{getStudioLocation(client)}</TableCell>
                            <TableCell>{client.teacherName || client.teacher || client.Teacher || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {client.reason || 'First time visitor'}
                              </Badge>
                            </TableCell>
                          </TableRow>) : <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            {clientSearchTerm ? 'No clients matching your search.' : 'No new client records available.'}
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="converted">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>First Visit</TableHead>
                        <TableHead>First Purchase</TableHead>
                        <TableHead>Item Purchased</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Conversion Span</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientRecords.length > 0 ? filteredClientRecords.map((client, index) => {
                      const firstVisit = getFirstVisitDate(client);
                      const firstPurchase = getFirstPurchaseDate(client);
                      const conversionSpan = calculateConversionSpan(firstVisit, firstPurchase);
                      return <TableRow key={index} className="animate-fade-in">
                              <TableCell className="font-medium">{formatClientName(client)}</TableCell>
                              <TableCell>{getClientEmail(client)}</TableCell>
                              <TableCell>{safeFormatDate(firstVisit, 'medium')}</TableCell>
                              <TableCell>{safeFormatDate(firstPurchase, 'medium')}</TableCell>
                              <TableCell>{client.item || client.purchaseItem || client.Product || 'N/A'}</TableCell>
                              <TableCell>{safeFormatCurrency(client.saleValue || client.value || client.Price)}</TableCell>
                              <TableCell>
                                <Badge variant="conversion" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {conversionSpan}
                                </Badge>
                              </TableCell>
                            </TableRow>;
                    }) : <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            {clientSearchTerm ? 'No clients matching your search.' : 'No converted client records available.'}
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="retained">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>First Visit</TableHead>
                        <TableHead>First Visit Post-Trial</TableHead>
                        <TableHead>Total Visits</TableHead>
                        <TableHead>Studio/Location</TableHead>
                        <TableHead>Retention Span</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientRecords.length > 0 ? filteredClientRecords.map((client, index) => {
                      const firstVisit = getFirstVisitDate(client);
                      const firstVisitPostTrial = getFirstVisitPostTrial(client);
                      const retentionSpan = calculateRetentionSpan(firstVisit, firstVisitPostTrial || client.lastVisitDate || '');
                      return <TableRow key={index} className="animate-fade-in">
                              <TableCell className="font-medium">{formatClientName(client)}</TableCell>
                              <TableCell>{getClientEmail(client)}</TableCell>
                              <TableCell>{safeFormatDate(firstVisit, 'medium')}</TableCell>
                              <TableCell>{safeFormatDate(firstVisitPostTrial, 'medium')}</TableCell>
                              <TableCell>{client.visitsCount || client.totalVisits || '1+'}</TableCell>
                              <TableCell>{getStudioLocation(client)}</TableCell>
                              <TableCell>
                                <Badge variant="retention" className="flex items-center gap-1">
                                  <RefreshCcw className="h-3 w-3" />
                                  {retentionSpan}
                                </Badge>
                              </TableCell>
                            </TableRow>;
                    }) : <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            {clientSearchTerm ? 'No clients matching your search.' : 'No retained client records available.'}
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="excluded">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>First Visit</TableHead>
                        <TableHead>Studio/Location</TableHead>
                        <TableHead>Reason for Exclusion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientRecords.length > 0 ? filteredClientRecords.map((client, index) => <TableRow key={index} className="animate-fade-in">
                            <TableCell className="font-medium">{formatClientName(client)}</TableCell>
                            <TableCell>{getClientEmail(client)}</TableCell>
                            <TableCell>{safeFormatDate(getFirstVisitDate(client), 'medium')}</TableCell>
                            <TableCell>{getStudioLocation(client)}</TableCell>
                            <TableCell>
                              <Badge variant="excluded" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {client.reason || 'Unknown reason'}
                              </Badge>
                            </TableCell>
                          </TableRow>) : <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            {clientSearchTerm ? 'No clients matching your search.' : 'No excluded client records available.'}
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>;
  };

  const renderProcessingTab = () => {
    if (!hasProcessingData) {
      return <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No Processing Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No processed data was found. Please ensure you've processed your CSV files correctly.
          </p>
        </div>;
    }
    return <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-sm bg-gradient-to-r from-slate-50 to-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Processing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '100ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    New Clients
                  </div>
                  <div className="text-2xl font-semibold text-blue-800">
                    {counts.newClientCount}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '200ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-indigo-600" />
                    Included
                  </div>
                  <div className="text-2xl font-semibold text-indigo-800">
                    {counts.includedCount}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '300ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserX className="h-4 w-4 mr-2 text-red-600" />
                    Excluded
                  </div>
                  <div className="text-2xl font-semibold text-red-800">
                    {counts.excludedCount}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '400ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserPlus className="h-4 w-4 mr-2 text-green-600" />
                    Converted
                  </div>
                  <div className="text-2xl font-semibold text-green-800">
                    {processingResults.convertedClients?.length || 0}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '500ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-purple-600" />
                    Conversion Rate
                  </div>
                  <div className="text-2xl font-semibold text-purple-800">
                    {counts.conversionRate}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 animate-scale-in shadow-sm" style={{
                animationDelay: '600ms'
              }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <RefreshCcw className="h-4 w-4 mr-2 text-teal-600" />
                    Retention Rate
                  </div>
                  <div className="text-2xl font-semibold text-teal-800">
                    {counts.retentionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {renderClientDetailsTables()}
        </div>
      </div>;
  };

  return <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Processing Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>New Clients</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="processing">
          {renderProcessingTab()}
        </TabsContent>
        
        <TabsContent value="new">
          {renderDataTable(newClientData || [], 'New Client')}
        </TabsContent>
        
        <TabsContent value="bookings">
          {renderDataTable(bookingsData || [], 'Bookings')}
        </TabsContent>
        
        <TabsContent value="payments">
          {renderDataTable(paymentsData || [], 'Payments')}
        </TabsContent>
      </Tabs>
    </div>;
};

export default RawDataView;
