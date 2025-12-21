import React, { useState, useEffect, useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
	BarChart,
	Users,
	Eye,
	Activity,
	Calendar,
	ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

// --- Types ---

type TimeseriesEntry = {
	date: string; // ISO datetime string
	pageviews: number;
	visitors: number;
	bounce_rate: number;
	migration_date?: string | null;
};

type StatEntry = {
	key: string;
	pageviews: number;
	visitors: number;
	migration_date?: string | null;
};

type StatsBreakdown = {
	path: StatEntry[];
	device_type: StatEntry[];
	referrer: StatEntry[];
	os_name: StatEntry[];
	country: StatEntry[];
};

type AllStats = {
	metadata: { export_date: string; source: string };
	timeseries: TimeseriesEntry[];
	stats: StatsBreakdown;
};

type ProjectInfo = {
	slug: string;
	name: string;
};

type ProjectListResponse = {
	projects: ProjectInfo[];
	total: number;
};

// --- Components ---

const GlassCard = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof Card>) => (
	<Card
		className={cn(
			"border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 shadow-sm",
			className
		)}
		{...props}
	>
		{children}
	</Card>
);

const RechartsAreaChart = ({
	data,
	dataKey,
	color,
	height = 300,
}: {
	data: TimeseriesEntry[];
	dataKey: "pageviews" | "visitors";
	color: string;
	height?: number;
}) => {
	if (!data || data.length === 0)
		return (
			<div
				className="flex items-center justify-center text-muted-foreground text-sm"
				style={{ height: height }}
			>
				No data available
			</div>
		);

	// Filter data to start from the first non-zero entry
	const firstNonZeroIndex = data.findIndex((d) => d[dataKey] > 0);
	const filteredData =
		firstNonZeroIndex === -1 ? data : data.slice(firstNonZeroIndex);

	const formattedData = filteredData.map((d) => ({
		...d,
		formattedDate: new Date(d.date).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		}),
	}));

	return (
		<div style={{ width: "100%", height: height }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={formattedData}
					margin={{
						top: 10,
						right: 10,
						left: 0,
						bottom: 0,
					}}
				>
					<defs>
						<linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={color} stopOpacity={0.4} />
							<stop offset="95%" stopColor={color} stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="currentColor"
						opacity={0.1}
						className="text-muted-foreground"
					/>
					<XAxis
						dataKey="formattedDate"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						minTickGap={30}
						stroke="currentColor"
						tick={{ fill: "currentColor" }}
						className="text-muted-foreground"
					/>
					<YAxis
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => value.toLocaleString()}
						stroke="currentColor"
						tick={{ fill: "currentColor" }}
						className="text-muted-foreground"
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "hsl(var(--card))",
							borderColor: "hsl(var(--border))",
							borderRadius: "var(--radius)",
							color: "hsl(var(--foreground))",
						}}
						itemStyle={{ color: "hsl(var(--foreground))" }}
						labelStyle={{
							color: "hsl(var(--muted-foreground))",
							marginBottom: "0.25rem",
						}}
					/>
					<Area
						type="monotone"
						dataKey={dataKey}
						stroke={color}
						fillOpacity={1}
						fill={`url(#color-${dataKey})`}
						strokeWidth={2}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

const MetricCard = ({
	title,
	value,
	icon: Icon,
	trend,
}: {
	title: string;
	value: string | number;
	icon: any;
	trend?: string;
}) => (
	<GlassCard className="hover:border-primary/20 hover:shadow-primary/5">
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium text-muted-foreground">
				{title}
			</CardTitle>
			<div className="p-2 bg-primary/10 rounded-full">
				<Icon className="h-4 w-4 text-primary" />
			</div>
		</CardHeader>
		<CardContent>
			<div className="text-2xl font-bold tracking-tight">{value}</div>
			{trend && (
				<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
					<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
					{trend}
				</p>
			)}
		</CardContent>
	</GlassCard>
);

const BreakdownList = ({
	title,
	items,
	maxVal,
}: {
	title: string;
	items: StatEntry[];
	maxVal: number;
}) => (
	<GlassCard className="h-[400px] flex flex-col">
		<CardHeader className="pb-3">
			<CardTitle className="text-sm font-medium flex items-center gap-2">
				{title}
			</CardTitle>
		</CardHeader>
		<CardContent className="space-y-3 flex-1 overflow-auto custom-scrollbar pr-2">
			{items.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-20 text-muted-foreground text-xs text-center">
					<Activity className="w-4 h-4 mb-1 opacity-20" />
					No data available
				</div>
			) : (
				items.map((item, i) => (
					<div key={i} className="group flex flex-col space-y-1.5 shrink-0">
						<div className="flex justify-between text-xs sm:text-sm">
							<span
								className="truncate max-w-[70%] text-foreground/90 font-medium group-hover:text-primary transition-colors"
								title={item.key}
							>
								{item.key.replace(/^https?:\/\/[^/]+/, "") || "/"}
							</span>
							<span className="font-mono text-muted-foreground">
								{item.pageviews.toLocaleString()}
							</span>
						</div>
						<div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-primary/80 group-hover:bg-primary transition-colors"
								initial={{ width: 0 }}
								animate={{ width: `${(item.pageviews / maxVal) * 100}%` }}
								transition={{ duration: 0.5, delay: i * 0.05 }}
							/>
						</div>
					</div>
				))
			)}
		</CardContent>
	</GlassCard>
);

// --- Main Dashboard Component ---

export default function ProjectStatsDashboard() {
	const [projects, setProjects] = useState<ProjectInfo[]>([]);
	const [selectedSlug, setSelectedSlug] = useState<string>("");
	const [stats, setStats] = useState<AllStats | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [period, setPeriod] = useState<string>("0");

	const API_BASE = import.meta.env.PUBLIC_API_BASE;
	// Fetch Projects List
	useEffect(() => {
		async function fetchProjects() {
			try {
				const res = await fetch(`${API_BASE}/api/v1/projects`);
				if (!res.ok) throw new Error("Failed to fetch projects");
				const data: ProjectListResponse = await res.json();
				setProjects(data.projects);
				if (data.projects.length > 0) {
					setSelectedSlug(data.projects[0].slug);
				}
			} catch (err) {
				console.error(err);
				setError(
					"Could not load projects. Ensure API is running at " + API_BASE
				);
			}
		}
		fetchProjects();
	}, []);

	// Fetch Stats when selection changes
	useEffect(() => {
		if (!selectedSlug) return;

		async function fetchStats() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`${API_BASE}/api/v1/${selectedSlug}/stats?days=${period}`
				);
				if (!res.ok) throw new Error("Failed to fetch stats");
				const data: AllStats = await res.json();
				setStats(data);
			} catch (err) {
				console.error(err);
				setError("Failed to load stats for this project.");
				setStats(null);
			} finally {
				setLoading(false);
			}
		}

		fetchStats();
	}, [selectedSlug, period]);

	// Effect to reset period for jportal if > 90 days
	useEffect(() => {
		if (selectedSlug === "jportal" && (period === "365" || period === "0")) {
			setPeriod("90");
		}
	}, [selectedSlug, period]);

	// Derived metrics
	const totals = useMemo(() => {
		if (!stats) return { views: 0, visitors: 0, bounce: 0 };
		const views = stats.timeseries.reduce(
			(acc, curr) => acc + curr.pageviews,
			0
		);
		const visitors = stats.timeseries.reduce(
			(acc, curr) => acc + curr.visitors,
			0
		);
		// Calculate weighted average bounce rate based on pageviews
		const entriesWithBounce = stats.timeseries.filter(
			(entry) => entry.bounce_rate > 0 && entry.pageviews > 0
		);
		const totalPageviewsWithBounce = entriesWithBounce.reduce(
			(acc, curr) => acc + curr.pageviews,
			0
		);
		const bounce =
			totalPageviewsWithBounce > 0
				? entriesWithBounce.reduce(
						(acc, curr) => acc + curr.bounce_rate * curr.pageviews,
						0
				  ) / totalPageviewsWithBounce
				: 0;
		return { views, visitors, bounce };
	}, [stats]);

	if (projects.length === 0 && !error) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="relative w-12 h-12">
					<div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
					<div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				</div>
				<p className="text-muted-foreground animate-pulse">
					Connecting to internal analytics...
				</p>
			</div>
		);
	}

	return (
		<div className="w-full max-w-7xl mx-auto space-y-8">
			{/* Controls Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-card/30 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
				<div className="space-y-1">
					<h2 className="text-xl font-semibold tracking-tight">
						Dashboard Overview
					</h2>
					<p className="text-sm text-muted-foreground">
						Monitoring real-time performance metrics
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					<Select value={selectedSlug} onValueChange={setSelectedSlug}>
						<SelectTrigger className="w-full sm:w-[220px] bg-background/50 border-primary/20 focus:ring-primary/20">
							<SelectValue placeholder="Select Project" />
						</SelectTrigger>
						<SelectContent>
							{projects.map((p) => (
								<SelectItem
									key={p.slug}
									value={p.slug}
									className="cursor-pointer"
								>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={period} onValueChange={setPeriod}>
						<SelectTrigger className="w-full sm:w-[140px] bg-background/50 border-primary/20 focus:ring-primary/20">
							<Calendar className="w-4 h-4 mr-2 text-primary" />
							<SelectValue placeholder="Period" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Last 7 days</SelectItem>
							<SelectItem value="30">Last 30 days</SelectItem>
							<SelectItem value="90">Last 90 days</SelectItem>
							{selectedSlug !== "jportal" && (
								<>
									<SelectItem value="365">Last 365 days</SelectItem>
									<SelectItem value="0">Lifetime</SelectItem>
								</>
							)}
						</SelectContent>
					</Select>
				</div>
			</div>

			{error ? (
				<GlassCard className="border-destructive/30 bg-destructive/5">
					<CardHeader>
						<CardTitle className="text-destructive flex items-center gap-2">
							<Activity className="w-5 h-5" />
							Connection Error
						</CardTitle>
						<CardDescription className="text-destructive/80">
							{error}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="p-4 bg-background/50 rounded-lg text-sm font-mono border border-border/50">
							Troubleshooting:
							<ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
								<li>Ensure the Python API is running on port 8000</li>
								<li>
									Check if{" "}
									<code className="bg-muted px-1 rounded">api/main.py</code> is
									executing without errors
								</li>
								<li>Verify network connectivity</li>
							</ul>
						</div>
					</CardContent>
				</GlassCard>
			) : loading || !stats ? (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-32 rounded-xl bg-muted/40 animate-pulse border border-border/30"
							/>
						))}
					</div>
					<div className="h-[400px] rounded-xl bg-muted/40 animate-pulse border border-border/30" />
				</div>
			) : (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<MetricCard
							title="Total Pageviews"
							value={totals.views.toLocaleString()}
							icon={Eye}
							trend={period === "0" ? "Lifetime" : `Last ${period} days`}
						/>
						<MetricCard
							title="Total Visitors"
							value={totals.visitors.toLocaleString()}
							icon={Users}
							trend={`Unique sessions`}
						/>
						<MetricCard
							title="Avg. Bounce Rate"
							value={`${totals.bounce.toFixed(1)}%`}
							icon={Activity}
							trend={`Average`}
						/>
					</div>

					{/* Charts Area */}
					<Tabs defaultValue="traffic" className="w-full">
						<div className="flex items-center justify-between mb-4 px-1">
							<TabsList className="bg-muted/50 p-1 border border-border/20">
								<TabsTrigger
									value="traffic"
									className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
								>
									Traffic
								</TabsTrigger>
								<TabsTrigger
									value="visitors"
									className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
								>
									Visitors
								</TabsTrigger>
							</TabsList>
						</div>

						<GlassCard className="p-1">
							<CardContent className="p-6">
								<TabsContent value="traffic" className="mt-0 space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-lg font-semibold tracking-tight">
												Pageviews Over Time
											</h3>
											<p className="text-sm text-muted-foreground">
												Daily pageviews for the selected period
											</p>
										</div>
										<div className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
											{period === "0" ? "Lifetime" : `${period} Day Trend`}
										</div>
									</div>
									<div className="w-full pt-4">
										<RechartsAreaChart
											data={
												period === "0"
													? stats.timeseries
													: stats.timeseries.slice(-parseInt(period))
											}
											dataKey="pageviews"
											color="#f97316"
											height={280}
										/>
									</div>
								</TabsContent>

								<TabsContent value="visitors" className="mt-0 space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-lg font-semibold tracking-tight">
												Visitors Over Time
											</h3>
											<p className="text-sm text-muted-foreground">
												Daily unique visitors for the selected period
											</p>
										</div>
										<div className="bg-emerald-500/10 text-emerald-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
											{period === "0" ? "Lifetime" : `${period} Day Trend`}
										</div>
									</div>
									<div className="w-full pt-4">
										<RechartsAreaChart
											data={
												period === "0"
													? stats.timeseries
													: stats.timeseries.slice(-parseInt(period))
											}
											dataKey="visitors"
											color="#10b981"
											height={280}
										/>
									</div>
								</TabsContent>
							</CardContent>
						</GlassCard>
					</Tabs>

					{/* Breakdowns Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						<BreakdownList
							title="Top Paths"
							items={stats.stats.path}
							maxVal={Math.max(...stats.stats.path.map((s) => s.pageviews), 1)}
						/>
						<BreakdownList
							title="Top Referrers"
							items={stats.stats.referrer}
							maxVal={Math.max(
								...stats.stats.referrer.map((s) => s.pageviews),
								1
							)}
						/>
						<BreakdownList
							title="Countries"
							items={stats.stats.country}
							maxVal={Math.max(
								...stats.stats.country.map((s) => s.pageviews),
								1
							)}
						/>
						<BreakdownList
							title="Device Types"
							items={stats.stats.device_type}
							maxVal={Math.max(
								...stats.stats.device_type.map((s) => s.pageviews),
								1
							)}
						/>
						<BreakdownList
							title="Operating Systems"
							items={stats.stats.os_name}
							maxVal={Math.max(
								...stats.stats.os_name.map((s) => s.pageviews),
								1
							)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
