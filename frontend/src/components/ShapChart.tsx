import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { ShapFeature } from '../types'

interface ShapChartProps {
  features: ShapFeature[]
}

export default function ShapChart({ features }: ShapChartProps) {
  const data = [...features].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(255,255,255,0.5)' }}>
        What drove this prediction
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            domain={[-4, 4]}
            tickFormatter={v => v > 0 ? `+${v}` : `${v}`}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: '← Better finish  |  Worse finish →',
              position: 'insideBottom',
              offset: -2,
              fill: 'rgba(255,255,255,0.3)',
              fontSize: 9,
            }}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={140}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: 'rgba(20,20,20,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(value: number, _name: string, props: { payload?: ShapFeature }) => [
              `${(value as number) > 0 ? '+' : ''}${(value as number).toFixed(2)} positions`,
              props.payload?.feature ?? '',
            ]}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.25)" />
          <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.shap_value < 0 ? '#4CAF50' : '#e8002d'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
