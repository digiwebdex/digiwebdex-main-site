import { useEffect, useState } from 'react';
import { analyticsService, type ServiceRevenueBreakdown } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(220, 70%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 0%, 45%)',
];

const chartConfig: ChartConfig = {
  domain: { label: 'ডোমেইন', color: COLORS[0] },
  hosting: { label: 'হোস্টিং', color: COLORS[1] },
  webDevelopment: { label: 'ওয়েবসাইট', color: COLORS[2] },
  softwareDevelopment: { label: 'সফটওয়্যার', color: COLORS[3] },
  digitalMarketing: { label: 'মার্কেটিং', color: COLORS[4] },
  other: { label: 'অন্যান্য', color: COLORS[5] },
};

export function ServiceRevenueDistributionChart() {
  const [breakdown, setBreakdown] = useState<ServiceRevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBreakdown() {
      try {
        const data = await analyticsService.getServiceRevenueBreakdown();
        setBreakdown(data);
      } catch (error) {
        console.error('Failed to fetch service breakdown:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBreakdown();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>সেবা অনুযায়ী রাজস্ব বিভাজন</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse bg-muted rounded-full w-48 h-48" />
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return null;
  }

  const data = [
    { name: 'ডোমেইন', value: breakdown.domain, key: 'domain' },
    { name: 'হোস্টিং', value: breakdown.hosting, key: 'hosting' },
    { name: 'ওয়েবসাইট', value: breakdown.webDevelopment, key: 'webDevelopment' },
    { name: 'সফটওয়্যার', value: breakdown.softwareDevelopment, key: 'softwareDevelopment' },
    { name: 'মার্কেটিং', value: breakdown.digitalMarketing, key: 'digitalMarketing' },
    { name: 'অন্যান্য', value: breakdown.other, key: 'other' },
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>সেবা অনুযায়ী রাজস্ব বিভাজন</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => 
                new Intl.NumberFormat('bn-BD', {
                  style: 'currency',
                  currency: 'BDT',
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
          </PieChart>
        </ChartContainer>
        {total === 0 && (
          <p className="text-center text-muted-foreground mt-4">কোনো রাজস্ব ডেটা নেই</p>
        )}
      </CardContent>
    </Card>
  );
}
