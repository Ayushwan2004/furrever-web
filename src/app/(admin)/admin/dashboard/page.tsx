'use client';
// src/app/(admin)/admin/dashboard/page.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDashboardStats } from '@/hooks/useRealtime';
import { AdminTopbar, MetricCard } from '@/components/admin/AdminShared';
import { fmtRelative } from '@/utils';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

gsap.registerPlugin(ScrollTrigger);

const COLORS = ['#f4a900','#78C841','#33A1E0','#E52020','#d98b19'];

export default function DashboardPage() {
  const { stats, adoptions, pets, users, loading } = useDashboardStats();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.metric-card', { opacity:0, y:20, stagger:.08, duration:.5, ease:'power3.out',
        scrollTrigger:{ trigger:'.metrics-grid', start:'top 90%' } });
      gsap.from('.chart-card', { opacity:0, y:25, stagger:.1, duration:.55, ease:'power3.out',
        scrollTrigger:{ trigger:'.charts-grid', start:'top 90%' } });
    }, ref);
    return () => ctx.revert();
  }, [loading]);

  // Build monthly adoption data from realtime data
  const now = new Date();
  const monthlyData = Array.from({length:6},(_,i) => {
    const d = new Date(now); d.setMonth(d.getMonth()-(5-i));
    const label = d.toLocaleString('en',{month:'short'});
    const month = d.getMonth(), year = d.getFullYear();
    const count = (adoptions as any[]).filter(a => {
      const cd = a.createdAt ? new Date(a.createdAt) : null;
      return cd && cd.getMonth()===month && cd.getFullYear()===year;
    }).length;
    const approved = (adoptions as any[]).filter(a => {
      const cd = a.createdAt ? new Date(a.createdAt) : null;
      return cd && cd.getMonth()===month && cd.getFullYear()===year && a.status==='approved';
    }).length;
    return { label, count, approved };
  });

  const roleData = [
    { name:'Adopters', value: stats.adopters },
    { name:'Sellers',  value: stats.sellers },
    { name:'Admins',   value: stats.admins },
  ].filter(r => r.value > 0);

  const statusData = [
    { name:'Pending',  value: stats.pendingAdoptions },
    { name:'Approved', value: stats.approvedAdoptions },
    { name:'Rejected', value: stats.rejectedAdoptions },
  ].filter(r => r.value > 0);

  const recentAdoptions = (adoptions as any[]).slice(0,5);
  const recentUsers     = (users as any[]).slice(0,5);

  const metrics = [
    { icon:'🐾', label:'Total Pets',      value: stats.totalPets,      color:'#f4a900', pct: Math.min((stats.totalPets/500)*100,100) },
    { icon:'👥', label:'Total Users',     value: stats.totalUsers,     color:'#78C841', pct: Math.min((stats.totalUsers/1000)*100,100) },
    { icon:'🤝', label:'Total Adoptions', value: stats.totalAdoptions, color:'#33A1E0', pct: Math.min((stats.totalAdoptions/300)*100,100) },
    { icon:'⏳', label:'Pending',         value: stats.pendingAdoptions,color:'#f4a900',pct: stats.totalAdoptions?Math.round((stats.pendingAdoptions/stats.totalAdoptions)*100):0 },
    { icon:'🏆', label:'Certificates',   value: 0,                    color:'#d98b19', pct: 0 },
    { icon:'📬', label:'Messages',        value: stats.totalContacts,  color:'#E52020', pct: 0 },
    { icon:'📊', label:'Adoption Rate',   value: `${stats.adoptionRate}%`, color:'#78C841', pct: stats.adoptionRate },
    { icon:'🚫', label:'Terminated',      value: stats.terminated,     color:'#E52020', pct: 0 },
  ];

  return (
    <div ref={ref}>
      <AdminTopbar title="Dashboard" subtitle="Realtime overview of FurrEver platform" />
      <div className="p-7 space-y-7">
        {/* Metrics */}
        <div className="metrics-grid grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map((m,i) => (
            <div key={i} className="metric-card">
              <MetricCard {...m} />
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="charts-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Adoption trend */}
          <div className="chart-card lg:col-span-2 bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Adoption Trend <span className="text-[10px] font-semibold text-[#9B6E50] ml-1">Last 6 months</span></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{top:5,right:5,left:-30,bottom:0}}>
                <defs>
                  <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f4a900" stopOpacity={.3}/><stop offset="95%" stopColor="#f4a900" stopOpacity={0}/></linearGradient>
                  <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#78C841" stopOpacity={.3}/><stop offset="95%" stopColor="#78C841" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d5"/>
                <XAxis dataKey="label" tick={{fontSize:11,fontWeight:700,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,border:'1px solid #f0e8d5',borderRadius:12}}/>
                <Area type="monotone" dataKey="count"    name="Applications" stroke="#f4a900" fill="url(#ga1)" strokeWidth={2.5}/>
                <Area type="monotone" dataKey="approved" name="Approved"     stroke="#78C841" fill="url(#ga2)" strokeWidth={2.5}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Role pie */}
          <div className="chart-card bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">User Roles</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {roleData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,borderRadius:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {roleData.map((r,i) => (
                <div key={r.name} className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{background:COLORS[i]}}/>
                  {r.name} ({r.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Adoption status bar */}
          <div className="chart-card bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Adoption Status Breakdown</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData} margin={{top:5,right:5,left:-30,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d5"/>
                <XAxis dataKey="name" tick={{fontSize:11,fontWeight:700,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,border:'1px solid #f0e8d5',borderRadius:12}}/>
                <Bar dataKey="value" name="Count" radius={[8,8,0,0]}>
                  {statusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="chart-card bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Recent Activity</div>
            <div className="space-y-2.5">
              {recentAdoptions.length === 0 && recentUsers.length === 0 && (
                <div className="text-center py-8 text-[#9B6E50] text-sm">No recent activity</div>
              )}
              {recentAdoptions.slice(0,3).map((a:any) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-[#f0e8d5] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-base">🤝</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{a.adopterName} → {a.petName}</div>
                    <div className="text-[10px] text-[#9B6E50]">{fmtRelative(a.createdAt)}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    a.status==='approved'?'bg-green-50 text-green-700 border-green-300':
                    a.status==='pending' ?'bg-amber-50 text-amber-700 border-amber-300':
                    'bg-red-50 text-red-600 border-red-200'}`}>{a.status}</span>
                </div>
              ))}
              {recentUsers.slice(0,2).map((u:any) => (
                <div key={u.uid||u.id} className="flex items-center gap-3 py-2 border-b border-[#f0e8d5] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base">👤</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{u.name} joined as {u.role}</div>
                    <div className="text-[10px] text-[#9B6E50]">{fmtRelative(u.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
