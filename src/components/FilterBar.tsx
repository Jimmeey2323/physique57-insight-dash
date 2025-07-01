
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Users, Building2, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface FilterBarProps {
  data: ProcessedTeacherData[];
  onFilterChange: (filteredData: ProcessedTeacherData[]) => void;
  selectedFilters: {
    period: string[];
    teacher: string[];
    location: string[];
  };
  onFilterUpdate: (filters: {
    period: string[];
    teacher: string[];
    location: string[];
  }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  data, 
  onFilterChange, 
  selectedFilters, 
  onFilterUpdate 
}) => {
  // Get unique values for filters with proper null checks
  const uniquePeriods = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return [...new Set(data
      .map(item => item && item.period ? item.period : null)
      .filter((period): period is string => period !== null && period.trim() !== '')
    )].sort();
  }, [data]);
  
  const uniqueTeachers = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return [...new Set(data
      .map(item => item && item.teacherName ? item.teacherName : null)
      .filter((teacher): teacher is string => teacher !== null && teacher.trim() !== '')
    )].sort();
  }, [data]);
  
  const uniqueLocations = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return [...new Set(data
      .map(item => item && item.location ? item.location : null)
      .filter((location): location is string => location !== null && location.trim() !== '')
    )].sort();
  }, [data]);

  // Apply filters with null checks
  React.useEffect(() => {
    if (!data || !Array.isArray(data)) {
      onFilterChange([]);
      return;
    }

    let filteredData = data.filter(item => item !== null && item !== undefined);

    if (selectedFilters.period.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.period && selectedFilters.period.includes(item.period)
      );
    }

    if (selectedFilters.teacher.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.teacherName && selectedFilters.teacher.includes(item.teacherName)
      );
    }

    if (selectedFilters.location.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.location && selectedFilters.location.includes(item.location)
      );
    }

    onFilterChange(filteredData);
  }, [data, selectedFilters, onFilterChange]);

  // Quick filter functions
  const handleQuickPeriodFilter = (period: string) => {
    if (!period || !selectedFilters) return;
    
    const isSelected = selectedFilters.period.includes(period);
    const newPeriods = isSelected 
      ? selectedFilters.period.filter(p => p !== period)
      : [...selectedFilters.period, period];
    
    onFilterUpdate({
      ...selectedFilters,
      period: newPeriods
    });
  };

  const handleQuickTeacherFilter = (teacher: string) => {
    if (!teacher || !selectedFilters) return;
    
    const isSelected = selectedFilters.teacher.includes(teacher);
    const newTeachers = isSelected 
      ? selectedFilters.teacher.filter(t => t !== teacher)
      : [...selectedFilters.teacher, teacher];
    
    onFilterUpdate({
      ...selectedFilters,
      teacher: newTeachers
    });
  };

  const handleQuickLocationFilter = (location: string) => {
    if (!location || !selectedFilters) return;
    
    const isSelected = selectedFilters.location.includes(location);
    const newLocations = isSelected 
      ? selectedFilters.location.filter(l => l !== location)
      : [...selectedFilters.location, location];
    
    onFilterUpdate({
      ...selectedFilters,
      location: newLocations
    });
  };

  const clearAllFilters = () => {
    onFilterUpdate({
      period: [],
      teacher: [],
      location: []
    });
  };

  const hasActiveFilters = selectedFilters && (
    selectedFilters.period.length > 0 || 
    selectedFilters.teacher.length > 0 || 
    selectedFilters.location.length > 0
  );

  // Early return if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="mb-6 animate-fade-in">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No data available for filtering.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 animate-fade-in">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with clear filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Quick Filters</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedFilters.period.length + selectedFilters.teacher.length + selectedFilters.location.length} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Period Filters */}
          {uniquePeriods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Period</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniquePeriods.map(period => (
                  <Button
                    key={period}
                    variant={selectedFilters.period.includes(period) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickPeriodFilter(period)}
                    className="h-8 text-xs"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Teacher Filters */}
          {uniqueTeachers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Teachers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueTeachers.slice(0, 8).map(teacher => (
                  <Button
                    key={teacher}
                    variant={selectedFilters.teacher.includes(teacher) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickTeacherFilter(teacher)}
                    className="h-8 text-xs"
                  >
                    {teacher}
                  </Button>
                ))}
                {uniqueTeachers.length > 8 && (
                  <Badge variant="secondary" className="h-8 flex items-center">
                    +{uniqueTeachers.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Location Filters */}
          {uniqueLocations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Locations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueLocations.map(location => (
                  <Button
                    key={location}
                    variant={selectedFilters.location.includes(location) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickLocationFilter(location)}
                    className="h-8 text-xs"
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="pt-2 border-t border-muted/30">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Showing {data.length} records</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
