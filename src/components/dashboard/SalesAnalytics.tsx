
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Calendar } from "lucide-react";
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import MetricsCards from './MetricsCards';
import TopBottomSellers from './TopBottomSellers';
import SalesDataTables from './SalesDataTables';
import SalesCharts from './SalesCharts';
import FilterSection from './FilterSection';

export type TimePeriod = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom';

const SalesAnalytics = () => {
  const { data, loading, error } = useGoogleSheets();
  const [selectedLocation, setSelectedLocation] = useState('Kwality House, Kemps Corner');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this-month');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    product: 'all',
    soldBy: 'all'
  });

  const locations = [
    { id: 'Kwality House, Kemps Corner', name: 'Kemps Corner', shortName: 'KC' },
    { id: 'Supreme HQ, Bandra', name: 'Bandra', shortName: 'BND' },
    { id: 'Kenkere House', name: 'Kenkere House', shortName: 'KH' }
  ];

  const timePeriods = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'this-quarter', label: 'This Quarter' },
    { id: 'this-year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const filteredData = useMemo(() => {
    return data.filter(item => item.calculatedLocation === selectedLocation);
  }, [data, selectedLocation]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h2 
          className="text-5xl font-bold theme-gradient bg-clip-text text-transparent mb-4"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          Sales Analytics
        </motion.h2>
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-1 theme-gradient mx-auto rounded-full"
        />
      </motion.div>

      {/* Location Tabs */}
      <Tabs value={selectedLocation} onValueChange={setSelectedLocation} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-card/70 backdrop-blur-sm border theme-border-primary/30 rounded-xl p-1 shadow-lg">
          {locations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className={`
                text-sm font-medium h-16 rounded-lg transition-all duration-300 flex flex-col items-center justify-center
                ${selectedLocation === location.id 
                  ? 'theme-gradient text-white shadow-lg scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }
              `}
            >
              <span className="font-bold text-lg">{location.shortName}</span>
              <span className="text-xs opacity-75">{location.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="mt-8 space-y-8">
            {/* Period Selection */}
            <Card className="bg-card/50 backdrop-blur-sm border theme-border-primary/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center theme-text-primary">
                  <Calendar className="mr-2 h-5 w-5" />
                  Time Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {timePeriods.map((period) => (
                    <Button
                      key={period.id}
                      variant={selectedPeriod === period.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.id as TimePeriod)}
                      className={selectedPeriod === period.id ? 'theme-bg-primary' : ''}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filter Section */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-card/70 backdrop-blur-sm theme-border-primary/30 hover:bg-secondary/50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <FilterSection filters={filters} setFilters={setFilters} data={filteredData} />
              </CollapsibleContent>
            </Collapsible>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 theme-border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading sales data...</p>
              </div>
            ) : (
              <>
                {/* Metrics Cards */}
                <MetricsCards data={filteredData} selectedPeriod={selectedPeriod} />

                {/* Top/Bottom Sellers */}
                <TopBottomSellers data={filteredData} selectedPeriod={selectedPeriod} />

                {/* Charts */}
                <SalesCharts data={filteredData} selectedPeriod={selectedPeriod} />

                {/* Data Tables */}
                <SalesDataTables data={filteredData} selectedPeriod={selectedPeriod} />
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
