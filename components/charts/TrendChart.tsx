"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { MonthPoint } from "@/lib/utils/trend";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

type TrendChartProps = {
    data: MonthPoint[];
    className?: string;
};

const SERIES = [
    { key: "income" as const, label: "Pemasukan", color: "var(--series-1)" },
    { key: "expenses" as const, label: "Pengeluaran", color: "var(--series-2)" },
];

/*
 * The viewBox tracks the container's pixel width so one unit equals one CSS
 * pixel. With a fixed wide viewBox the whole drawing was scaled down on a
 * phone — at 390px the 11px labels rendered at about 4.5px, unreadable.
 * Height is fixed, so the plot gets taller relative to its width as the screen
 * narrows, which is what a 12-point series needs.
 */
const VB_H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 48 };

const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
];

function shortMonth(month: string) {
    return MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month;
}

/** Compact rupiah for axis ticks: 1.500.000 -> "1,5jt". */
function compact(value: number) {
    if (value >= 1_000_000) {
        const jt = value / 1_000_000;
        return `${jt % 1 === 0 ? jt : jt.toFixed(1).replace(".", ",")}jt`;
    }
    if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
    return String(value);
}

/**
 * Twelve-month income vs expense.
 *
 * Two series, so identity is the colour's job — categorical, not the
 * success/destructive tokens. Income-green vs expense-red would be the classic
 * red-green pairing that protanopes and deuteranopes cannot separate; these two
 * hues were validated instead (worst adjacent pair ΔE 26.6 protan).
 *
 * Identity is never carried by colour alone: both series are direct-labelled at
 * their last point, a legend sits above the plot, and the table view below
 * repeats every figure as text.
 */
export function TrendChart({ data, className }: TrendChartProps) {
    const gradientId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(720);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.max(280, Math.round(entry.contentRect.width)));
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const VB = { w: width, h: VB_H };
    // Below this the every-other-month thinning kicks in.
    const dense = width < 520;

    const { points, max } = useMemo(() => {
        const peak = Math.max(
            1,
            ...data.flatMap((d) => [d.income, d.expenses])
        );
        // Round the ceiling up so gridlines land on readable numbers.
        const step = 10 ** Math.floor(Math.log10(peak));
        const ceiling = Math.ceil(peak / step) * step;

        const innerW = VB.w - PAD.left - PAD.right;
        const innerH = VB.h - PAD.top - PAD.bottom;

        const x = (i: number) =>
            PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
        const y = (v: number) => PAD.top + innerH - (v / ceiling) * innerH;

        return {
            max: ceiling,
            points: data.map((d, i) => ({
                ...d,
                x: x(i),
                yIncome: y(d.income),
                yExpenses: y(d.expenses),
            })),
        };
    }, [data, width]);

    if (data.length === 0) return null;

    const line = (key: "yIncome" | "yExpenses") =>
        points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p[key]}`).join(" ");

    const areaIncome = `${line("yIncome")} L ${points[points.length - 1].x} ${VB.h - PAD.bottom} L ${points[0].x} ${VB.h - PAD.bottom} Z`;

    const ticks = [0, 0.5, 1].map((f) => ({
        value: max * f,
        y: PAD.top + (VB.h - PAD.top - PAD.bottom) * (1 - f),
    }));

    const active = activeIndex === null ? null : points[activeIndex];
    const last = points[points.length - 1];

    return (
        <div ref={containerRef} className={cn("space-y-3", className)}>
            {/* Legend — always present for two or more series */}
            <div className="flex flex-wrap items-center gap-4">
                {SERIES.map((s) => (
                    <span key={s.key} className="flex items-center gap-2 text-sm">
                        <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: s.color }}
                        />
                        <span className="text-muted-foreground">{s.label}</span>
                    </span>
                ))}
                <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    aria-expanded={showTable}
                >
                    {showTable ? "Sembunyikan tabel" : "Lihat sebagai tabel"}
                </button>
            </div>

            <svg
                viewBox={`0 0 ${VB.w} ${VB.h}`}
                width={VB.w}
                height={VB.h}
                className="w-full touch-none"
                role="img"
                aria-label={`Grafik pemasukan dan pengeluaran ${data.length} bulan terakhir. Nilai lengkap tersedia pada tabel di bawah.`}
                onMouseLeave={() => setActiveIndex(null)}
                onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const rel = ((e.clientX - rect.left) / rect.width) * VB.w;
                    let nearest = 0;
                    let best = Infinity;
                    points.forEach((p, i) => {
                        const d = Math.abs(p.x - rel);
                        if (d < best) { best = d; nearest = i; }
                    });
                    setActiveIndex(nearest);
                }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--series-1)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--series-1)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Recessive gridlines and value ticks */}
                {ticks.map((t) => (
                    <g key={t.value}>
                        <line
                            x1={PAD.left} x2={VB.w - PAD.right}
                            y1={t.y} y2={t.y}
                            stroke="var(--chart-grid)" strokeWidth="1"
                        />
                        <text
                            x={PAD.left - 8} y={t.y + 4}
                            textAnchor="end"
                            className="fill-muted-foreground"
                            style={{ fontSize: 11 }}
                        >
                            {compact(t.value)}
                        </text>
                    </g>
                ))}

                <path d={areaIncome} fill={`url(#${gradientId})`} />

                {/* 2px marks */}
                <path d={line("yIncome")} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                <path d={line("yExpenses")} fill="none" stroke="var(--series-2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                {/* Month labels, thinned on narrow screens by CSS below */}
                {points.map((p, i) => (
                    <text
                        key={p.month}
                        x={p.x} y={VB.h - 8}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        style={{ fontSize: 11, display: dense && i % 2 === 1 ? "none" : undefined }}
                    >
                        {shortMonth(p.month)}
                    </text>
                ))}

                {/* Crosshair + markers */}
                {active && (
                    <g>
                        <line
                            x1={active.x} x2={active.x}
                            y1={PAD.top} y2={VB.h - PAD.bottom}
                            stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="3 3"
                        />
                        {/* 2px surface ring so the marker stays legible over the line */}
                        <circle cx={active.x} cy={active.yIncome} r="5" fill="var(--series-1)" stroke="var(--card)" strokeWidth="2" />
                        <circle cx={active.x} cy={active.yExpenses} r="5" fill="var(--series-2)" stroke="var(--card)" strokeWidth="2" />
                    </g>
                )}

                {/* Direct labels on the final point, so identity never relies on hue */}
                {!active && (
                    <g style={{ fontSize: 11 }}>
                        <text x={last.x - 6} y={last.yIncome - 8} textAnchor="end" className="fill-muted-foreground">
                            Pemasukan
                        </text>
                        <text x={last.x - 6} y={last.yExpenses + 16} textAnchor="end" className="fill-muted-foreground">
                            Pengeluaran
                        </text>
                    </g>
                )}
            </svg>

            {/* Tooltip as HTML, so it inherits type and colour tokens */}
            {active && (
                <div
                    role="status"
                    className="rounded-lg border bg-card p-3 text-sm shadow-sm"
                >
                    <p className="font-medium">
                        {shortMonth(active.month)} {active.month.slice(0, 4)}
                    </p>
                    <dl className="mt-1 space-y-0.5">
                        {SERIES.map((s) => (
                            <div key={s.key} className="flex items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="h-2 w-2 rounded-full"
                                    style={{ background: s.color }}
                                />
                                <dt className="text-muted-foreground">{s.label}</dt>
                                <dd className="ml-auto font-medium tabular-nums">
                                    {formatCurrency(active[s.key])}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {showTable && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <caption className="sr-only">
                            Pemasukan dan pengeluaran per bulan
                        </caption>
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th scope="col" className="py-2 font-medium">Bulan</th>
                                <th scope="col" className="py-2 font-medium text-right">Pemasukan</th>
                                <th scope="col" className="py-2 font-medium text-right">Pengeluaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.month} className="border-b last:border-0">
                                    <th scope="row" className="py-2 font-normal">
                                        {shortMonth(d.month)} {d.month.slice(0, 4)}
                                    </th>
                                    <td className="py-2 text-right tabular-nums">{formatCurrency(d.income)}</td>
                                    <td className="py-2 text-right tabular-nums">{formatCurrency(d.expenses)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
