
import React from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Palette, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeSelector() {
  const { theme, themeColor, setTheme, setThemeColor } = useTheme();

  const themes = [
    { name: 'Light', value: 'light' as const, icon: Sun },
    { name: 'Dark', value: 'dark' as const, icon: Moon },
  ];

  const colors = [
    { name: 'Purple', value: 'purple' as const, class: 'bg-purple-500' },
    { name: 'Blue', value: 'blue' as const, class: 'bg-blue-500' },
    { name: 'Emerald', value: 'emerald' as const, class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose' as const, class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber' as const, class: 'bg-amber-500' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Mode</h4>
            <div className="flex space-x-2">
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <Button
                    key={t.value}
                    variant={theme === t.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(t.value)}
                    className="flex-1"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {t.name}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Color</h4>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <Button
                  key={color.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setThemeColor(color.value)}
                  className={`p-2 h-10 ${themeColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.class}`} />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
