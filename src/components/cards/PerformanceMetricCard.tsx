
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';

interface PerformanceMetricCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string;
  icon: React.ReactNode;
  status?: 'positive' | 'neutral' | 'negative';
  tooltip?: string;
  trend?: {
    value: number;
    label?: string;
  };
  onCustomClick?: (e: React.MouseEvent) => void;
  isAnimated?: boolean;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  secondaryValue,
  icon,
  status,
  tooltip,
  trend,
  onCustomClick,
  isAnimated = true
}) => {
  const getStatusColor = () => {
    if (!status) return '';
    if (status === 'positive') return 'text-green-500';
    if (status === 'neutral') return 'text-amber-500';
    return 'text-red-500';
  };

  const getStatusBgColor = () => {
    if (!status) return '';
    if (status === 'positive') return 'bg-green-50';
    if (status === 'neutral') return 'bg-amber-50';
    return 'bg-red-50';
  };

  // Safely display the value by ensuring it's a string
  const displayValue = value !== undefined && value !== null 
    ? String(value)
    : 'N/A';

  // Determine if value is a currency value (contains ₹)
  const isCurrency = typeof value === 'string' && value.includes('₹');

  return (
    <Card 
      className={`card-hover bg-white/60 backdrop-blur-sm transition-all duration-300 ${isAnimated ? 'hover:shadow-md hover:-translate-y-1' : ''} ${getStatusBgColor()}`}
      onClick={onCustomClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {title}
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="max-w-xs text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className={`text-2xl font-bold mt-1 ${getStatusColor()} ${isAnimated ? 'group-hover:scale-105 transition-transform' : ''}`}>
              {displayValue}
              {secondaryValue && (
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  status === 'positive' ? 'bg-green-100 text-green-800' : 
                  status === 'neutral' ? 'bg-amber-100 text-amber-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {secondaryValue.includes('%') && <Percent className="mr-1 h-3 w-3" />}
                  {secondaryValue}
                </span>
              )}
            </div>
            {trend && trend.value !== undefined && (
              <div className={`text-xs mt-1 flex items-center ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value >= 0 ? 
                  <TrendingUp className="h-3 w-3 mr-1" /> : 
                  <TrendingDown className="h-3 w-3 mr-1" />
                } 
                {safeToFixed(Math.abs(trend.value), 1)}%
                {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
              </div>
            )}
          </div>
          <div className={`${status ? getStatusColor() : ''} transition-transform duration-300 ${isAnimated ? 'group-hover:scale-110' : ''}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricCard;
