import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Filter, AlertTriangle, Calendar, CalendarCheck, Clock, Users, UserCheck, UserPlus, UserX, ArrowUpDown, RefreshCcw, Eye } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No {type} Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No {type.toLowerCase()} data was found. Please ensure you've uploaded the correct CSV files.
          </p>
        </div>
      );
    }

    const filteredData = filterData(data);
    const columns = Object.keys(filteredData[0] || {});
    const filterFields = columns.filter(col => !['id', 'uuid'].includes(col.toLowerCase()));

    return (
      <Card className="shadow-sm">
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
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input 
                  placeholder="Search data..." 
                  className="pl-8" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  autoComplete="off" 
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select field</SelectItem>
                    {filterFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filterField && (
                  <Input 
                    placeholder="Filter value..." 
                    className="w-[180px]" 
                    value={filterValue} 
                    onChange={e => setFilterValue(e.target.value)} 
                    autoComplete="off" 
                  />
                )}
                
                {(filterField || searchTerm) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setFilterField('');
                      setFilterValue('');
                      setSearchTerm('');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table maxHeight="400px">
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead 
                    key={column} 
                    sortable 
                    sortDirection={sortColumn === column ? sortDirection : undefined} 
                    onSort={() => handleSort(column)}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(column => (
                    <TableCell key={`${rowIndex}-${column}`}>
                      {column.toLowerCase().includes('date') && row[column] 
                        ? safeFormatDate(row[column], 'medium')
                        : column.toLowerCase().includes('value') || 
                          column.toLowerCase().includes('revenue') || 
                          column.toLowerCase().includes('price')
                        ? safeFormatCurrency(row[column])
                        : row[column] !== undefined ? row[column].toString() : ''
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No Processing Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No processed data was found. Please ensure you've processed your CSV files correctly.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                New Clients
              </div>
              <div className="text-2xl font-semibold text-blue-800">
                {counts.newClientCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-indigo-600" />
                Included
              </div>
              <div className="text-2xl font-semibold text-indigo-800">
                {counts.includedCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <UserX className="h-4 w-4 mr-2 text-red-600" />
                Excluded
              </div>
              <div className="text-2xl font-semibold text-red-800">
                {counts.excludedCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <UserPlus className="h-4 w-4 mr-2 text-green-600" />
                Converted
              </div>
              <div className="text-2xl font-semibold text-green-800">
                {processingResults.convertedClients?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2 text-purple-600" />
                Conversion Rate
              </div>
              <div className="text-2xl font-semibold text-purple-800">
                {counts.conversionRate}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <RefreshCcw className="h-4 w-4 mr-2 text-teal-600" />
                Retention Rate
              </div>
              <div className="text-2xl font-semibold text-teal-800">
                {counts.retentionRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Client Lists */}
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
              <Badge variant="outline" className="ml-1">{processingResults.excluded?.length || 0}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input 
                placeholder="Search clients..." 
                className="pl-8" 
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
      <Card>
        <CardContent className="p-0">
          <Table maxHeight="400px">
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Location</TableHead>
                {type === 'converted' && <TableHead>First Purchase</TableHead>}
                {type === 'converted' && <TableHead>Purchase Item</TableHead>}
                {type === 'converted' && <TableHead>Value</TableHead>}
                {type === 'retained' && <TableHead>Post-Trial Visit</TableHead>}
                <TableHead>Reason/Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? filteredClients.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{formatClientName(client)}</TableCell>
                  <TableCell>{getClientEmail(client)}</TableCell>
                  <TableCell>{safeFormatDate(getFirstVisitDate(client), 'medium')}</TableCell>
                  <TableCell>{getStudioLocation(client)}</TableCell>
                  {type === 'converted' && <TableCell>{safeFormatDate(getFirstPurchaseDate(client), 'medium')}</TableCell>}
                  {type === 'converted' && <TableCell>{client.item || client.Product || 'N/A'}</TableCell>}
                  {type === 'converted' && <TableCell>{safeFormatCurrency(client.saleValue || client.Price)}</TableCell>}
                  {type === 'retained' && <TableCell>{safeFormatDate(client.firstVisitPostTrial, 'medium')}</TableCell>}
                  <TableCell>
                    <Badge variant={type === 'excluded' ? 'destructive' : 'default'}>
                      {client.reason || (type === 'excluded' ? 'Excluded' : 'Included')}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={type === 'converted' ? 8 : type === 'retained' ? 6 : 5} className="text-center py-4">
                    No {type} clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Processing Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>New Clients ({newClientData?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Bookings ({bookingsData?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Payments ({paymentsData?.length || 0})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="processing">
          {renderProcessingAnalysis()}
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
    </div>
  );
};

export default RawDataView;
