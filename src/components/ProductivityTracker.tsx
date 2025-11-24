import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProductivityTrackerProps {
  percentage: number;
  theme: string;
}

const ProductivityTracker: React.FC<ProductivityTrackerProps> = ({ percentage, theme }) => {
  const data = [
    { name: 'Completed', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  const COLORS = theme === 'dark'
    ? ['#14b8a6', '#475569'] // dark: teal-500, slate-600
    : ['#0d9488', '#e2e8f0']; // light: teal-600, slate-200

  return (
    <section className="bg-slate-200 dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">إنتاجية اليوم</h2>
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{percentage}%</span>
        </div>
      </div>
    </section>
  );
};

export default ProductivityTracker;