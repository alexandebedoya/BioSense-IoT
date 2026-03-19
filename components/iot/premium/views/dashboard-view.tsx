"use client"

import { Thermometer, Droplets, Wifi, Clock, RefreshCw } from "lucide-react"
import { AQIGauge } from "../aqi-gauge"
import { StatCard } from "../stat-card"
import { AlertCard } from "../alert-card"
import { FABButton } from "../fab-button"
import { SensorCardTres } from "@/components/iot/sensor-card-tres"
import { SensorAlerts } from "@/components/iot/sensor-alerts"
import {
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import type { SensorData } from "@/lib/types"

interface DashboardViewProps {
  data: SensorData
  onNavigateToAlerts: () => void
  onNavigateToRecommendations: () => void
}

// Generate chart data from sensor readings
function generateChartData() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const time = new Date(now.getTime() - (11 - i) * 10 * 60 * 1000)
    return {
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      MQ4: 250 + Math.random() * 30,
      MQ7: 200 + Math.random() * 40,
      MQ135: 280 + Math.random() * 35
    }
  })
}

export function DashboardView({ data, onNavigateToAlerts, onNavigateToRecommendations }: DashboardViewProps) {
  const chartData = generateChartData()

  // Calcular AQI basado en los 3 sensores
  const aqi = Math.round(((data.mq4 || 0) / 50 + (data.mq7 || 0) / 100 + (data.mq135 || 0) / 75) * 50)

  return (
    <div className="pb-24">
      {/* Header Section */}
      <div className="p-4 pb-0">
        <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoreo en tiempo real de calidad del aire
        </p>
      </div>

      {/* AQI Card */}
      <div className="p-4">
        <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-premium animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4 text-center">Indice de Calidad del Aire</h2>
          <AQIGauge value={aqi} />
        </div>
      </div>

      {/* Sensor Cards - 3 Sensores */}
      <div className="p-4">
        <SensorCardTres />
      </div>

      {/* Quick Stats Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={Thermometer}
          label="Temperatura"
          value={data.temperature.toFixed(1)}
          unit="C"
          status="info"
          delay={100}
        />
        <StatCard
          icon={Droplets}
          label="Humedad"
          value={data.humidity.toFixed(0)}
          unit="%"
          status="info"
          delay={150}
        />
        <StatCard
          icon={Wifi}
          label="ESP32"
          value="Conectado"
          status="safe"
          delay={200}
        />
        <StatCard
          icon={Clock}
          label="Ultima Sync"
          value="Hace 2 min"
          status="neutral"
          delay={250}
        />
      </div>

      {/* Real-time Chart */}
      <div className="p-4">
        <div className="bg-card rounded-3xl border border-border/50 p-4 shadow-premium animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Niveles en Tiempo Real</h3>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMQ4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMQ7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMQ135" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  domain={[0, 350]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="MQ4" 
                  stroke="#f97316" 
                  fillOpacity={1} 
                  fill="url(#colorMQ4)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="MQ7" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorMQ7)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="MQ135" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorMQ135)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Preview */}
      <div className="px-4">
        <SensorAlerts onViewAll={onNavigateToAlerts} />
      </div>

      {/* FAB for AI Recommendations */}
      <FABButton onClick={onNavigateToRecommendations} />
    </div>
  )
}
