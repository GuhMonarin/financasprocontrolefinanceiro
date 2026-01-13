import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { MonthData } from '@/hooks/useTransactionsMultiMonth';

interface CategoryTrendsChartProps {
  data: MonthData[];
  type: 'expense' | 'income';
  formatCurrency: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 rounded-lg shadow-lg border border-border max-w-[250px]">
        <p className="font-medium mb-2">{label}</p>
        {payload
          .filter((entry: any) => entry.value > 0)
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 5)
          .map((entry: any, index: number) => (
            <p key={index} className="text-sm truncate" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
      </div>
    );
  }
  return null;
};

export const CategoryTrendsChart = memo(function CategoryTrendsChart({
  data,
  type,
  formatCurrency,
}: CategoryTrendsChartProps) {
  const { chartData, categories } = useMemo(() => {
    // Get all unique categories across all months
    const allCategories = new Set<string>();
    const categoryColors: Record<string, string> = {};

    data.forEach(m => {
      const breakdown = m.categoryBreakdown[type];
      Object.values(breakdown).forEach(cat => {
        allCategories.add(cat.name);
        categoryColors[cat.name] = cat.color;
      });
    });

    // Build chart data
    const sorted = [...data].sort((a, b) => 
      a.year !== b.year ? a.year - b.year : a.month - b.month
    );

    const chartData = sorted.map(m => {
      const row: Record<string, any> = { name: m.label };
      allCategories.forEach(cat => {
        row[cat] = m.categoryBreakdown[type][cat]?.value || 0;
      });
      return row;
    });

    // Get top 5 categories by total value
    const categoryTotals = Array.from(allCategories).map(cat => ({
      name: cat,
      total: data.reduce((sum, m) => sum + (m.categoryBreakdown[type][cat]?.value || 0), 0),
      color: categoryColors[cat],
    }));

    const topCategories = categoryTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { chartData, categories: topCategories };
  }, [data, type]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 card-shadow">
      <h3 className="text-lg font-semibold mb-4">
        Evolução por Categoria - {type === 'expense' ? 'Despesas' : 'Receitas'}
      </h3>
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} formatCurrency={formatCurrency} />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-xs sm:text-sm">{value}</span>}
            />
            {categories.map((cat) => (
              <Line
                key={cat.name}
                type="monotone"
                dataKey={cat.name}
                stroke={cat.color}
                strokeWidth={2}
                dot={{ fill: cat.color, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
