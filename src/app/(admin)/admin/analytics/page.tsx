'use client';
// src/app/(admin)/admin/analytics/page.tsx
import { useDashboardStats } from '@/hooks/useRealtime';
import { AdminTopbar } from '@/components/admin/AdminShared';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const C = ['#f4a900','#78C841','#33A1E0','#E52020','#d98b19','#543e35'];

export default function AnalyticsPage() {
  const { stats, pets, users, adoptions, loading } = useDashboardStats();

  // Category distribution
  const byCategory: Record<string,number> = {};
  (pets as any[]).forEach(p => { byCategory[p.category||'Other'] = (byCategory[p.category||'Other']||0)+1; });
  const catData = Object.entries(byCategory).map(([k,v])=>({name:k,count:v})).sort((a,b)=>b.count-a.count);

  // Monthly user signups
  const now = new Date();
  const monthlyUsers = Array.from({length:6},(_,i)=>{
    const d = new Date(now); d.setMonth(d.getMonth()-(5-i));
    const label = d.toLocaleString('en',{month:'short'});
    const count = (users as any[]).filter(u=>{
      const cd = u.createdAt?new Date(u.createdAt):null;
      return cd && cd.getMonth()===d.getMonth() && cd.getFullYear()===d.getFullYear();
    }).length;
    return {label,count};
  });

  const summaryCards = [
    { label:'Adoption Rate',  value:`${stats.adoptionRate}%`, icon:'📊', sub:'Applications approved' },
    { label:'Avg Favorites',  value: pets.length ? Math.round((pets as any[]).reduce((s,p)=>s+(p.favoredBy?.length||0),0)/Math.max(pets.length,1)) : 0, icon:'❤️', sub:'Per pet listing' },
    { label:'Active Users',   value: (users as any[]).filter(u=>u.adminStatus!=='terminated').length, icon:'✅', sub:'Non-terminated' },
    { label:'Pending Ratio',  value:`${stats.totalAdoptions?Math.round((stats.pendingAdoptions/stats.totalAdoptions)*100):0}%`, icon:'⏳', sub:'Still pending' },
  ];

  return (
    <div>
      <AdminTopbar title="Analytics" subtitle="Platform-wide insights — live data"/>
      <div className="p-7 space-y-7">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-display text-2xl font-black">{c.value}</div>
              <div className="font-extrabold text-xs text-[#1b1a18] mt-1">{c.label}</div>
              <div className="text-[10px] text-[#9B6E50]">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category distribution */}
          <div className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Pets by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} layout="vertical" margin={{left:20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d5"/>
                <XAxis type="number" tick={{fontSize:10,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <YAxis dataKey="name" type="category" tick={{fontSize:11,fontWeight:700,fontFamily:'Nunito'}} axisLine={false} tickLine={false} width={70}/>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,border:'1px solid #f0e8d5',borderRadius:12}}/>
                <Bar dataKey="count" name="Pets" radius={[0,8,8,0]}>
                  {catData.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly signups */}
          <div className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Monthly User Signups</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyUsers} margin={{top:5,right:5,left:-30,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d5"/>
                <XAxis dataKey="label" tick={{fontSize:11,fontWeight:700,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fontFamily:'Nunito'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,border:'1px solid #f0e8d5',borderRadius:12}}/>
                <Line type="monotone" dataKey="count" name="New Users" stroke="#f4a900" strokeWidth={2.5} dot={{fill:'#f4a900',r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Adoption funnel */}
          <div className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">Adoption Funnel</div>
            <div className="space-y-3">
              {[
                { label:'Total Applications', value: stats.totalAdoptions,   color:'#f4a900' },
                { label:'Approved',           value: stats.approvedAdoptions, color:'#78C841' },
                { label:'Pending',            value: stats.pendingAdoptions,  color:'#33A1E0' },
                { label:'Rejected',           value: stats.rejectedAdoptions, color:'#E52020' },
              ].map(f => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>{f.label}</span><span>{f.value}</span>
                  </div>
                  <div className="h-2.5 bg-[#f0e8d5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      width:`${stats.totalAdoptions?Math.round((f.value/stats.totalAdoptions)*100):0}%`,
                      background:f.color,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User role donut */}
          <div className="bg-white rounded-2xl p-5 border border-[#f0e8d5]">
            <div className="font-extrabold text-sm mb-4">User Role Distribution</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[{n:'Adopters',v:stats.adopters},{n:'Sellers',v:stats.sellers},{n:'Admins',v:stats.admins}].filter(d=>d.v>0)}
                  dataKey="v" nameKey="n" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {[0,1,2].map(i=><Cell key={i} fill={C[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{fontFamily:'Nunito',fontSize:12,borderRadius:12}}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,fontFamily:'Nunito',fontWeight:700}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
