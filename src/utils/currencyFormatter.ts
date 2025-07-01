
export const formatCurrency = (value: number, currency: string = '₹'): string => {
  if (value === 0) return `${currency}0`;
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) { // 1 Crore
    return `${sign}${currency}${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) { // 1 Lakh
    return `${sign}${currency}${(absValue / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) { // 1 Thousand
    return `${sign}${currency}${(absValue / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${currency}${absValue.toLocaleString()}`;
  }
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toString();
  }
};
