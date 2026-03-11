"use client"

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useCurrency } from "@/hooks/use-currency"

interface ChartData { name: string; value: number }

interface DashboardChartsProps {
	appointmentsData?: ChartData[]
	revenueData?: ChartData[]
	statusData?: ChartData[]
	serviceData?: ChartData[]
	monthlyApptData?: ChartData[]
}

const COLORS = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4"]

export function DashboardCharts({
	appointmentsData = [],
	revenueData = [],
	statusData = [],
}: DashboardChartsProps) {
	const { formatCurrency } = useCurrency()

	return (
		<div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", width:"100%", boxSizing:"border-box"}}>

			{/* Randevu Trendi */}
			<div style={{background:"var(--pc-surface,#fff)", borderRadius:"14px", border:"1px solid var(--pc-border,#e5e7eb)", padding:"20px", minHeight:"380px"}}>
				<p style={{fontWeight:700, fontSize:"15px", marginBottom:"4px", color:"var(--pc-text,#111)"}}>Zaman İçinde Randevular</p>
				<p style={{fontSize:"12px", color:"var(--pc-text-sm,#6b7280)", marginBottom:"16px"}}>Tarihe göre randevu trendleri</p>
				<ResponsiveContainer width="100%" height={280}>
					<LineChart data={appointmentsData} margin={{left:0,right:8,top:4,bottom:0}}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
						<XAxis dataKey="name" tick={{fontSize:11}} tickLine={false} axisLine={false} />
						<YAxis hide />
						<Tooltip formatter={(v:any) => [v, "Randevu"]} />
						<Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{r:3, fill:"#3B82F6"}} name="Randevular" />
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Gelir Genel Bakış */}
			<div style={{background:"var(--pc-surface,#fff)", borderRadius:"14px", border:"1px solid var(--pc-border,#e5e7eb)", padding:"20px", minHeight:"380px"}}>
				<p style={{fontWeight:700, fontSize:"15px", marginBottom:"4px", color:"var(--pc-text,#111)"}}>Gelir Genel Bakış</p>
				<p style={{fontSize:"12px", color:"var(--pc-text-sm,#6b7280)", marginBottom:"16px"}}>Döneme göre gelir</p>
				<ResponsiveContainer width="100%" height={280}>
					<BarChart data={revenueData} margin={{left:0,right:8,top:4,bottom:0}}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
						<XAxis dataKey="name" tick={{fontSize:11}} tickLine={false} axisLine={false} />
						<YAxis hide />
						<Tooltip formatter={(v:any) => [formatCurrency(Number(v)), "Gelir"]} />
						<Bar dataKey="value" fill="#3B82F6" radius={[4,4,0,0]} name="Gelir" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* Durum Dağılımı */}
			<div style={{background:"var(--pc-surface,#fff)", borderRadius:"14px", border:"1px solid var(--pc-border,#e5e7eb)", padding:"20px", minHeight:"380px"}}>
				<p style={{fontWeight:700, fontSize:"15px", marginBottom:"4px", color:"var(--pc-text,#111)"}}>Durum Dağılımı</p>
				<p style={{fontSize:"12px", color:"var(--pc-text-sm,#6b7280)", marginBottom:"16px"}}>Randevu durumlarının dağılımı</p>
				<ResponsiveContainer width="100%" height={220}>
					<PieChart>
						<Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
							{statusData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
						</Pie>
						<Tooltip />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>

		</div>
	)
}
