import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const Analytics = ({ articles = [] }) => {
    // Dynamic Category Execution
    const categoryCounts = {};
    articles.forEach(article => {
        const cat = article.category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    let categoryData = Object.keys(categoryCounts).map(key => ({
        name: key,
        value: categoryCounts[key]
    }));

    if (categoryData.length === 0) {
        categoryData = [{ name: 'No Data', value: 1 }];
    }

    // Dynamic Weekly Engagement Execution
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const viewsByDay = {
        'Mon': { views: 0, likes: 0 },
        'Tue': { views: 0, likes: 0 },
        'Wed': { views: 0, likes: 0 },
        'Thu': { views: 0, likes: 0 },
        'Fri': { views: 0, likes: 0 },
        'Sat': { views: 0, likes: 0 },
        'Sun': { views: 0, likes: 0 }
    };

    articles.forEach(article => {
        if (!article.createdAt) return;
        const date = new Date(article.createdAt);
        const dayName = days[date.getDay()];
        if (viewsByDay[dayName]) {
            viewsByDay[dayName].views += (Number(article.views) || 0);
            viewsByDay[dayName].likes += (Number(article.likes?.length) || 0);
        }
    });

    const viewsData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        name: day,
        views: viewsByDay[day].views,
        likes: viewsByDay[day].likes
    }));

    const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{label}</p>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
                        {`${payload[0].name}: ${payload[0].value}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

            {/* Main Views Chart */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                gridColumn: 'span 2'
            }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#f1f5f9' }}>Engagement Overview</h3>
                <div style={{ height: 300, width: '100%', minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={viewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
            }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#f1f5f9' }}>Content by Category</h3>
                <div style={{ height: 300, width: '100%', minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Analytics;
