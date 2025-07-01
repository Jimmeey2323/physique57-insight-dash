
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import FileUploader from '@/components/FileUploader';
import FileList from '@/components/FileList';
import ProcessingLoader from '@/components/ProcessingLoader';
import FilterBar from '@/components/FilterBar';
import ResultsTable from '@/components/ResultsTable';
import RawDataView from '@/components/RawDataView';
import MonthlyMetricsView from '@/components/MonthlyMetricsView';
import SalesMetricsView from '@/components/SalesMetricsView';
import PerformanceInsightsView from '@/components/PerformanceInsightsView';
import KanbanView from '@/components/KanbanView';
import { parseCSV, categorizeFiles, getFileTypes } from '@/utils/csvParser';
import { processData, ProcessedTeacherData, ProcessingProgress } from '@/utils/dataProcessor';
import { deduplicateClientsByEmail } from '@/utils/deduplication';
import Logo from '@/components/Logo';
import AIInsights from '@/components/AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, FileText, Table, BarChart, TrendingUp, Target, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Local storage keys
const STORAGE_KEYS = {
  PROCESSED_DATA: 'studio-stats-processed-data',
  FILTERED_DATA: 'studio-stats-filtered-data',
  LOCATIONS: 'studio-stats-locations',
  TEACHERS: 'studio-stats-teachers',
  PERIODS: 'studio-stats-periods',
  HAS_RAW_DATA: 'studio-stats-has-raw-data'
};

// Storage utilities
const storageUtils = {
  saveToStorage: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving to storage for key ${key}:`, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Some data might not be saved between sessions.');
      }
      return false;
    }
  },
  loadFromStorage: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading from storage for key ${key}:`, error);
      return null;
    }
  },
  clearStorage: (keys: string[]) => {
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing storage for key ${key}:`, error);
      }
    });
  }
};

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [processedData, setProcessedData] = useState<ProcessedTeacherData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessedTeacherData[]>([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('table');
  const [dataMode, setDataMode] = useState<'teacher' | 'studio'>('teacher');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [rawData, setRawData] = useState({
    newClientData: [],
    bookingsData: [],
    paymentsData: [],
    processingResults: {
      included: [],
      excluded: [],
      newClients: [],
      convertedClients: [],
      retainedClients: []
    }
  });

  // Global filter state
  const [selectedFilters, setSelectedFilters] = useState({
    period: [] as string[],
    teacher: [] as string[],
    location: [] as string[]
  });
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Legacy filter state for backward compatibility
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    teacher: '',
    period: '',
    search: ''
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedProcessedData = storageUtils.loadFromStorage(STORAGE_KEYS.PROCESSED_DATA);
    const savedFilteredData = storageUtils.loadFromStorage(STORAGE_KEYS.FILTERED_DATA);
    const savedLocations = storageUtils.loadFromStorage(STORAGE_KEYS.LOCATIONS);
    const savedTeachers = storageUtils.loadFromStorage(STORAGE_KEYS.TEACHERS);
    const savedPeriods = storageUtils.loadFromStorage(STORAGE_KEYS.PERIODS);
    const hasRawData = localStorage.getItem(STORAGE_KEYS.HAS_RAW_DATA) === 'true';

    if (savedProcessedData) {
      setProcessedData(savedProcessedData);
      setResultsVisible(true);
    }
    if (savedFilteredData) {
      setFilteredData(savedFilteredData);
    }
    if (savedLocations) {
      setLocations(savedLocations);
    }
    if (savedTeachers) {
      setTeachers(savedTeachers);
    }
    if (savedPeriods) {
      setPeriods(savedPeriods);
    }

    if (savedProcessedData && savedProcessedData.length > 0 && hasRawData) {
      setResultsVisible(true);
    }
  }, []);

  // Save processed data and metadata to localStorage when they change
  useEffect(() => {
    if (processedData.length > 0) {
      storageUtils.saveToStorage(STORAGE_KEYS.PROCESSED_DATA, processedData);
    }
    if (filteredData.length > 0) {
      storageUtils.saveToStorage(STORAGE_KEYS.FILTERED_DATA, filteredData);
    }
    if (locations.length > 0) {
      storageUtils.saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
    }
    if (teachers.length > 0) {
      storageUtils.saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
    }
    if (periods.length > 0) {
      storageUtils.saveToStorage(STORAGE_KEYS.PERIODS, periods);
    }

    if (rawData.newClientData.length > 0 || rawData.bookingsData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.HAS_RAW_DATA, 'true');
    }
  }, [processedData, filteredData, locations, teachers, periods, rawData]);

  const updateProgress = useCallback((progressData: ProcessingProgress) => {
    setProgress(progressData.progress);
    setCurrentStep(progressData.currentStep);
  }, []);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleProcessFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    const categorized = categorizeFiles(files);
    if (!categorized.new) {
      toast.error('Missing New client file. Please upload a file with "new" in the name');
      return;
    }
    if (!categorized.bookings) {
      toast.error('Missing Bookings file. Please upload a file with "bookings" in the name');
      return;
    }

    // Clear previous data
    setProcessedData([]);
    setFilteredData([]);
    setLocations([]);
    setTeachers([]);
    setPeriods([]);
    setRawData({
      newClientData: [],
      bookingsData: [],
      paymentsData: [],
      processingResults: {
        included: [],
        excluded: [],
        newClients: [],
        convertedClients: [],
        retainedClients: []
      }
    });

    storageUtils.clearStorage(Object.values(STORAGE_KEYS));
    setIsProcessing(true);
    updateProgress({
      progress: 0,
      currentStep: 'Starting processing...'
    });
    
    try {
      updateProgress({
        progress: 10,
        currentStep: 'Parsing CSV files...'
      });
      const newFileResult = await parseCSV(categorized.new);
      const bookingsFileResult = await parseCSV(categorized.bookings);

      let salesFileResult = { data: [] };
      if (categorized.payments) {
        salesFileResult = await parseCSV(categorized.payments);
      }

      const initialRawData = {
        newClientData: newFileResult.data || [],
        bookingsData: bookingsFileResult.data || [],
        paymentsData: salesFileResult.data || [],
        processingResults: {
          included: [],
          excluded: [],
          newClients: [],
          convertedClients: [],
          retainedClients: []
        }
      };
      setRawData(initialRawData);

      updateProgress({
        progress: 30,
        currentStep: 'Processing data...'
      });
      const result = await processData(
        newFileResult.data || [], 
        bookingsFileResult.data || [], 
        salesFileResult.data || [], 
        updateProgress
      );

      setProcessedData(result.processedData || []);
      setFilteredData(result.processedData || []);
      setLocations(result.locations || []);
      setTeachers(result.teachers || []);
      setPeriods(result.periods || []);

      setRawData(prev => ({
        ...prev,
        processingResults: {
          included: result.includedRecords || [],
          excluded: result.excludedRecords || [],
          newClients: result.newClientRecords || [],
          convertedClients: result.convertedClientRecords || [],
          retainedClients: result.retainedClientRecords || []
        }
      }));

      updateProgress({
        progress: 100,
        currentStep: 'Finalizing...'
      });
      
      setTimeout(() => {
        setIsProcessing(false);
        setResultsVisible(true);
        toast.success('Files processed successfully');
      }, 500);
      
    } catch (error) {
      console.error('Error processing files:', error);
      setIsProcessing(false);
      toast.error('Error processing files. Please check your file format and try again');
    }
  }, [files, updateProgress]);

  const handleFilteredDataChange = useCallback((newFilteredData: ProcessedTeacherData[]) => {
    setFilteredData(newFilteredData);
  }, []);

  const handleFilterUpdate = useCallback((filters: {
    period: string[];
    teacher: string[];
    location: string[];
  }) => {
    setSelectedFilters(filters);
  }, []);

  const handleFilterChange = useCallback((filters: {
    location?: string;
    teacher?: string;
    period?: string;
    search?: string;
  }) => {
    const newFilters = {
      location: filters.location || '',
      teacher: filters.teacher || '',
      period: filters.period || '',
      search: filters.search || ''
    };
    setActiveFilters(newFilters);
    let filtered = [...processedData];

    if (newFilters.location && newFilters.location !== 'all-locations') {
      filtered = filtered.filter(item => item.location === newFilters.location);
    }

    if (newFilters.teacher && newFilters.teacher !== 'all-teachers') {
      filtered = filtered.filter(item => item.teacherName === newFilters.teacher);
    }

    if (newFilters.period && newFilters.period !== 'all-periods') {
      filtered = filtered.filter(item => item.period === newFilters.period);
    }

    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.teacherName && item.teacherName.toLowerCase().includes(searchLower) || 
        item.location && item.location.toLowerCase().includes(searchLower)
      );
    }
    setFilteredData(filtered);
  }, [processedData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('container')?.classList.remove('opacity-0');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const hasActiveFilters = Object.values(activeFilters).some(Boolean) || 
    selectedFilters.period.length > 0 || 
    selectedFilters.teacher.length > 0 || 
    selectedFilters.location.length > 0;

  const handleResetApp = useCallback(() => {
    storageUtils.clearStorage(Object.values(STORAGE_KEYS));
    setResultsVisible(false);
    setProcessedData([]);
    setFilteredData([]);
    setLocations([]);
    setTeachers([]);
    setPeriods([]);
    setFiles([]);
    setSelectedFilters({
      period: [],
      teacher: [],
      location: []
    });
    setRawData({
      newClientData: [],
      bookingsData: [],
      paymentsData: [],
      processingResults: {
        included: [],
        excluded: [],
        newClients: [],
        convertedClients: [],
        retainedClients: []
      }
    });
    toast.success('Application reset. You can upload new files');
  }, []);

  return (
    <div className="min-h-screen">
      {!resultsVisible ? (
        <div className="min-h-screen">
          <FileUploader onFilesAdded={handleFilesAdded} accept=".csv" maxFiles={10} />
          
          {files.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 p-6 z-50">
              <div className="max-w-4xl mx-auto">
                <FileList 
                  files={files} 
                  onRemove={handleRemoveFile} 
                  onProcessFiles={handleProcessFiles} 
                  fileTypes={getFileTypes()} 
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container flex justify-between items-center py-3 bg-neutral-50">
              <Logo size="md" />
            </div>
          </header>
          
          <main id="container" className="container py-8 transition-opacity duration-500 opacity-0">
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                  <button onClick={handleResetApp} className="text-sm text-destructive hover:underline">
                    Reset data
                  </button>
                  <button onClick={() => setResultsVisible(false)} className="text-sm text-primary hover:underline">
                    Process new files
                  </button>
                </div>
              </div>

              {/* Global Filter Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Global Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isFiltersCollapsed ? 'Show Filters' : 'Hide Filters'}
                    {isFiltersCollapsed ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronUp className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
                
                {!isFiltersCollapsed && (
                  <FilterBar 
                    data={processedData} 
                    onFilterChange={handleFilteredDataChange} 
                    selectedFilters={selectedFilters} 
                    onFilterUpdate={handleFilterUpdate} 
                  />
                )}
              </div>
              
              <Collapsible open={isInsightsOpen} onOpenChange={setIsInsightsOpen} className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Insights & Recommendations</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isInsightsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">Toggle insights</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2">
                  <AIInsights data={filteredData} isFiltered={hasActiveFilters} />
                </CollapsibleContent>
              </Collapsible>
              
              <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span>Analytics Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="monthly-metrics" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Monthly Metrics</span>
                  </TabsTrigger>
                  <TabsTrigger value="sales-metrics" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Sales Metrics</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance-insights" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Performance Insights</span>
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <div className="h-4 w-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                    <span>Kanban View</span>
                  </TabsTrigger>
                  <TabsTrigger value="raw-data" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Raw Data & Processing</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analytics" className="mt-0">
                  <ResultsTable 
                    data={filteredData} 
                    locations={locations} 
                    isLoading={false} 
                    viewMode={viewMode} 
                    dataMode={dataMode} 
                    onFilterChange={handleFilterChange} 
                  />
                </TabsContent>

                <TabsContent value="monthly-metrics" className="mt-0">
                  <MonthlyMetricsView data={filteredData} />
                </TabsContent>

                <TabsContent value="sales-metrics" className="mt-0">
                  <SalesMetricsView data={filteredData} paymentsData={rawData.paymentsData || []} />
                </TabsContent>

                <TabsContent value="performance-insights" className="mt-0">
                  <PerformanceInsightsView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="kanban" className="mt-0">
                  <KanbanView data={filteredData} />
                </TabsContent>
                
                <TabsContent value="raw-data" className="mt-0">
                  <RawDataView 
                    newClientData={rawData.newClientData || []} 
                    bookingsData={rawData.bookingsData || []} 
                    paymentsData={rawData.paymentsData || []} 
                    processingResults={rawData.processingResults || {
                      included: [],
                      excluded: [],
                      newClients: [],
                      convertedClients: [],
                      retainedClients: []
                    }} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>

          <footer className="border-t bg-white/80 backdrop-blur-sm py-4 mt-8">
            <div className="container text-center text-xs text-muted-foreground">
              Studio Stats Analytics Dashboard • {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      )}

      <ProcessingLoader isProcessing={isProcessing} progress={progress} currentStep={currentStep} />
    </div>
  );
};

export default Index;
