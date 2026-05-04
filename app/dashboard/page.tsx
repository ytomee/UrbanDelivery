"use client";

import { useEffect, useState, useMemo } from "react";
import { Order } from "../types/order";
import { getOrders } from "../lib/orders";

type Period = "day" | "week" | "month";

interface ChartDataPoint {
  label: string;
  value: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>("day");
  
  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const chartData = useMemo(() => {
    // Generate data based on period
    const now = new Date();
    const data: ChartDataPoint[] = [];
    
    // helper to zero-out time
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    if (period === "day") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("pt-PT", { weekday: 'short', day: 'numeric' });
        data.push({ label, value: 0 });
      }
      
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffTime = startOfDay(now).getTime() - startOfDay(d).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const idx = 6 - diffDays;
          if (data[idx]) data[idx].value++;
        }
      });
      
    } else if (period === "week") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        data.push({ label: `Semana ${4 - i}`, value: 0 });
      }
      
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffTime = startOfDay(now).getTime() - startOfDay(d).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const weekIdx = Math.floor(diffDays / 7); // 0 is current week, 1 is last week
          const idx = 3 - weekIdx;
          if (data[idx]) data[idx].value++;
        }
      });
      
    } else if (period === "month") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("pt-PT", { month: 'short' });
        data.push({ label, value: 0 });
      }
      
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diffMonths >= 0 && diffMonths < 6) {
          const idx = 5 - diffMonths;
          if (data[idx]) data[idx].value++;
        }
      });
    }

    return data;
  }, [orders, period]);

  const totalVolume = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  // Max value for scaling the SVG
  const maxVal = Math.max(...chartData.map(d => d.value), 1); // at least 1 to avoid div by zero

  // Building SVG Path
  const renderLine = () => {
    if (chartData.length === 0) return null;
    const width = 100;
    const height = 100; // viewbox 0 0 100 100
    
    // We have chartData.length points.
    // x spacing:
    const stepX = width / Math.max(chartData.length - 1, 1);
    
    const points = chartData.map((d, i) => {
      const x = i * stepX;
      // y is inverted because SVG y goes down
      const y = height - (d.value / maxVal) * height * 0.8 - 10; // 0.8 scale to leave top padding
      return `${x},${y}`;
    });

    const dPath = `M ${points.join(' L ')}`;

    // Optional: filled area below line
    const areaPath = `${dPath} L 100,100 L 0,100 Z`;

    return (
      <svg viewBox="0 0 100 100" className="w-full h-40 overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--yale)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--yale)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--yale)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--yale)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill="url(#areaGrad)"
        />
        <path
          d={dPath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-line"
          style={{
            strokeDasharray: '300',
            strokeDashoffset: '0',
            animation: 'draw 1.5s ease-out forwards'
          }}
        />
        {/* Points */}
        {chartData.map((d, i) => {
          const x = i * stepX;
          const y = height - (d.value / maxVal) * height * 0.8 - 10;
          return (
            <g key={i} className="group cursor-default">
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="#FAF0CA"
                stroke="var(--yale)"
                strokeWidth="1.5"
                className="transition-all duration-300 group-hover:r-4 group-hover:stroke-2"
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize="6"
                fill="var(--yale)"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--yale)]">Painel de Gestor</h1>
          <p className="text-muted mt-1">Acompanhe o volume operacional e as entregas da plataforma.</p>
        </div>
      </div>

      <div className="glass-card p-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Volume de Entregas</h2>
            <p className="text-sm text-muted">Total de encomendas registadas no período selecionado.</p>
          </div>
          
          <div className="flex bg-[var(--background)] rounded-full p-1 border border-[var(--border)] shadow-sm">
            {(["day", "week", "month"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  period === p 
                    ? 'bg-[var(--yale)] text-[#FAF0CA] shadow-md' 
                    : 'text-muted hover:text-[var(--foreground)]'
                }`}
              >
                {p === "day" ? "Últimos 7 Dias" : p === "week" ? "Últimas 4 Semanas" : "Últimos 6 Meses"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Cartão Numérico */}
          <div className="flex-shrink-0 w-full md:w-48 aspect-square rounded-2xl bg-gradient-to-br from-[#FAF0CA] to-[#F2E5B5] shadow-inner flex flex-col items-center justify-center border border-[rgba(255,255,255,0.4)]">
            <span className="text-sm font-semibold text-[var(--yale)] uppercase tracking-wider opacity-80 mb-2">Total</span>
            <span className="text-6xl font-bold text-[var(--yale)] tracking-tighter" style={{ textShadow: '0 2px 10px rgba(13, 59, 102, 0.1)' }}>
              {totalVolume}
            </span>
            <span className="text-xs text-[var(--yale)] font-medium mt-2 opacity-70">
              {period === "day" ? "entregas nesta semana" : period === "week" ? "entregas no mês" : "entregas no semestre"}
            </span>
          </div>

          {/* Linha de Tendência */}
          <div className="flex-1 w-full flex flex-col h-full pt-4">
            <div className="relative w-full">
              {renderLine()}
              {/* X-axis labels */}
              <div className="flex justify-between mt-4 text-xs font-medium text-muted px-1">
                {chartData.map((d, i) => (
                  <span key={i} className={i === 0 ? "text-left" : i === chartData.length - 1 ? "text-right" : "text-center"}>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes draw {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
}
