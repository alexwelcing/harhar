import React from 'react';
import { HarEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatBytes } from '../utils/harHelpers';
import { Activity, Database, Clock } from 'lucide-react';

interface DashboardProps {
    entries: HarEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
    // Stats
    const totalRequests = entries.length;
    const totalSize = entries.reduce((acc, curr) => acc + curr.response.content.size, 0);
    const avgTime = entries.reduce((acc, curr) => acc + curr.time, 0) / (totalRequests || 1);
    
    // Chart Data: Status Codes
    const statusData = entries.reduce((acc: any, curr) => {
        const code = curr.response.status;
        const group = Math.floor(code / 100) + 'xx';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {});
    
    const chartData = Object.keys(statusData).map(key => ({
        name: key,
        count: statusData[key]
    })).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-zinc-500 text-sm font-medium">Total Requests</div>
                    <div className="text-2xl font-bold text-zinc-100">{totalRequests}</div>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                    <Database className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-zinc-500 text-sm font-medium">Data Transferred</div>
                    <div className="text-2xl font-bold text-zinc-100">{formatBytes(totalSize)}</div>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-zinc-500 text-sm font-medium">Avg Latency</div>
                    <div className="text-2xl font-bold text-zinc-100">{Math.round(avgTime)}ms</div>
                </div>
            </div>

             <div className="col-span-1 md:col-span-3 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 h-64">
                <h3 className="text-zinc-400 text-sm font-medium mb-4">Response Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#e4e4e7' }}
                            itemStyle={{ color: '#e4e4e7' }}
                            cursor={{ fill: '#27272a', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                    entry.name === '2xx' ? '#10b981' :
                                    entry.name === '3xx' ? '#3b82f6' :
                                    entry.name === '4xx' ? '#f59e0b' :
                                    entry.name === '5xx' ? '#ef4444' : '#71717a'
                                } />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
