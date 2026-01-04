import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/* ---------- TYPES ---------- */

interface GrowthChartProps {
  data: { date: string; value: number }[];
}

interface Asset {
  type: string;
  amount: number;
  color: string;
}

interface AllocationChartProps {
  assets?: Asset[];
}

/* ---------- COMPONENTS ---------- */

export const PortfolioGrowthChart = ({ data }: GrowthChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 w-full flex items-center justify-center text-sm text-slate-500">
        No growth data
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AssetAllocationChart = ({ assets = [] }: AllocationChartProps) => {
  if (assets.length === 0) {
    return (
      <div className="h-48 w-full flex items-center justify-center text-sm text-slate-500">
        No assets allocated
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={assets as any[]}
            dataKey="amount"
            nameKey="type"/>
          
            {/* {assets.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie> */}

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
