import React, { useState, useCallback, useMemo } from 'react';
import { Upload, BarChart3, Users, TrendingUp, FileText, Database, Eye, Calendar, PieChart } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import FileList from '@/components/FileList';
import ProcessingLoader from '@/components/ProcessingLoader';
import ResultsTable from '@/components/ResultsTable';
import RawDataView from '@/components/RawDataView';
import MonthlyMetricsView from '@/components/MonthlyMetricsView';
import DrillDownAnalytics from '@/components/DrillDownAnalytics';
import PerformanceInsightsView from '@/components/PerformanceInsightsView';
import AIInsights from '@/components/AIInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { processCSVData, ProcessedTeacherData } from '@/utils/dataProcessor';
import { toast } from 'sonner';

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedData, setUploadedData] = useState<{
    newClientData: any[];
    bookingsData: any[];
    paymentsData: any[];
  }>({
    newClientData: [],
    bookingsData: [],
    paymentsData: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedTeacherData[]>([]);
  const [processingResults, setProcessingResults] = useState<{
    included: any[];
    excluded: any[];
    newClients: any[];
    convertedClients: any[];
    retainedClients: any[];
  }>({
    included: [],
    excluded: [],
    newClients: [],
    convertedClients: [],
    retainedClients: []
  });
  const [selectedTeacher, setSelectedTeacher] = useState<ProcessedTeacherData | null>(null);
  const [currentView, setCurrentView] = useState('results');

  const handleFileUpload = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) uploaded successfully`);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  }, []);

  const processData = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one CSV file');
      return;
    }

    setIsProcessing(true);
    try {
      const { processedData: processed, rawData, processingResults: results } = await processCSVData(files);
      setProcessedData(processed);
      setUploadedData(rawData);
      setProcessingResults(results);
      setCurrentView('results');
      toast.success('Data processed successfully!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Error processing data. Please check your files and try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleTeacherSelect = useCallback((teacher: ProcessedTeacherData) => {
    setSelectedTeacher(teacher);
    setCurrentView('drillDown');
  }, []);

  const hasData = processedData.length > 0;
  const totalMetrics = useMemo(() => {
    if (!hasData) return null;
    return processedData.reduce((acc, teacher) => ({
      totalTeachers: acc.totalTeachers + 1,
      totalNewClients: acc.totalNewClients + (teacher.newClients || 0),
      totalRetained: acc.totalRetained + (teacher.retainedClients || 0),
      totalConverted: acc.totalConverted + (teacher.convertedClients || 0),
      totalRevenue: acc.totalRevenue + (teacher.totalRevenue || 0)
    }), {
      totalTeachers: 0,
      totalNewClients: 0,
      totalRetained: 0,
      totalConverted: 0,
      totalRevenue: 0
    });
  }, [processedData, hasData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
            Studio Analytics Dashboard
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Upload your CSV files to analyze teacher performance, client metrics, and business insights with advanced data processing and beautiful visualizations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FileUploader onFileUpload={handleFileUpload} />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploaded Files
                {files.length > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 ml-2">
                    {files.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FileList files={files} onFileRemove={handleFileRemove} />
              {files.length > 0 && (
                <Button 
                  onClick={processData} 
                  disabled={isProcessing}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isProcessing ? 'Processing...' : 'Process Data'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processing Loader */}
        {isProcessing && <ProcessingLoader />}

        {/* Summary Cards */}
        {hasData && totalMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-transparent border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-semibold">Teachers</div>
                    <div className="text-2xl font-bold text-blue-800">{totalMetrics.totalTeachers}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/15 via-green-600/10 to-transparent border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 font-semibold">New Clients</div>
                    <div className="text-2xl font-bold text-green-800">{totalMetrics.totalNewClients}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-500/15 via-teal-600/10 to-transparent border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-teal-600 font-semibold">Retained</div>
                    <div className="text-2xl font-bold text-teal-800">{totalMetrics.totalRetained}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-transparent border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-purple-600 font-semibold">Converted</div>
                    <div className="text-2xl font-bold text-purple-800">{totalMetrics.totalConverted}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-transparent border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-amber-600 font-semibold">Revenue</div>
                    <div className="text-2xl font-bold text-amber-800">
                      ${(totalMetrics.totalRevenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        {hasData && (
          <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
            <TabsList className="grid grid-cols-6 mb-6 h-auto p-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40">
              <TabsTrigger value="results" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <BarChart3 className="h-4 w-4" />
                <span className="font-semibold">Results</span>
              </TabsTrigger>
              <TabsTrigger value="rawData" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <Database className="h-4 w-4" />
                <span className="font-semibold">Raw Data</span>
              </TabsTrigger>
              <TabsTrigger value="monthlyMetrics" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="drillDown" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <Eye className="h-4 w-4" />
                <span className="font-semibold">Drill Down</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <PieChart className="h-4 w-4" />
                <span className="font-semibold">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200 rounded-xl">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">AI Insights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="animate-fade-in">
              <ResultsTable data={processedData} onTeacherSelect={handleTeacherSelect} />
            </TabsContent>

            <TabsContent value="rawData" className="animate-fade-in">
              <RawDataView 
                newClientData={uploadedData.newClientData}
                bookingsData={uploadedData.bookingsData}
                paymentsData={uploadedData.paymentsData}
                processingResults={processingResults}
              />
            </TabsContent>

            <TabsContent value="monthlyMetrics" className="animate-fade-in">
              <MonthlyMetricsView data={processedData} />
            </TabsContent>

            <TabsContent value="drillDown" className="animate-fade-in">
              <DrillDownAnalytics 
                data={processedData} 
                selectedTeacher={selectedTeacher}
              />
            </TabsContent>

            <TabsContent value="performance" className="animate-fade-in">
              <PerformanceInsightsView data={processedData} />
            </TabsContent>

            <TabsContent value="insights" className="animate-fade-in">
              <AIInsights data={processedData} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!hasData && !isProcessing && (
          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                  <BarChart3 className="h-12 w-12 text-slate-400" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-slate-800">Ready to Analyze Your Data</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Upload your CSV files to get started with comprehensive analytics, performance insights, and detailed reporting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
