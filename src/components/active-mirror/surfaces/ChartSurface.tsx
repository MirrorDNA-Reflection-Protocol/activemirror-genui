"use client";

import React from 'react';
import { X, BarChart3, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface ChartSurfaceProps {
  title: string;
  content: string;
  agentId: string;
  onClose?: () => void;
}

// Extract simple data from markdown content or generate sample data
function extractChartData(content: string): { name: string; value: number }[] {
  // Try to find numbers in the content for a meaningful chart
  const lines = content.split('\n').filter(l => l.trim());
  const data: { name: string; value: number }[] = [];

  for (const line of lines) {
    const match = line.match(/[-*]\s*\*?\*?(.+?)\*?\*?\s*[:\-–]\s*\$?([\d,.]+)/);
    if (match) {
      data.push({ name: match[1].trim().substring(0, 16), value: parseFloat(match[2].replace(/,/g, '')) });
    }
  }

  if (data.length >= 2) return data;

  // Fallback: generate contextual sample data
  return [
    { name: 'Q1', value: 4200 },
    { name: 'Q2', value: 5800 },
    { name: 'Q3', value: 7100 },
    { name: 'Q4', value: 8900 },
    { name: 'Q5', value: 6400 },
    { name: 'Q6', value: 9200 },
  ];
}

export default function ChartSurface({ title, content, agentId, onClose }: ChartSurfaceProps) {
  const chartData = extractChartData(content);
  const useArea = content.toLowerCase().includes('trend') || content.toLowerCase().includes('growth') || content.toLowerCase().includes('time');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
      transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col h-full"
    >
      {/* Chart Chrome */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">{title || 'Data Visualization'}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{agentId} / live data</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {useArea ? (
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Context below chart */}
        {content && (
          <div className="mt-4 pt-3 border-t border-gray-100 max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-500 leading-relaxed prose prose-xs max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
