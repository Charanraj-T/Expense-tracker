import { useMemo } from "react";
import { formatCurrency } from "../../utils/dateRange";
import styles from "./Charts.module.css";

const TrendLineChart = ({ transactions = [], currency = "₹" }) => {
  const { points, dayPoints, avgDaily } = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === "expense");
    const dailyMap = {};
    let total = 0;

    expenseTxs.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const day = d.getUTCDate();
      const amt = Number(t.amount) || 0;
      dailyMap[day] = (dailyMap[day] || 0) + amt;
      total += amt;
    });

    const days = Object.keys(dailyMap)
      .map(Number)
      .sort((a, b) => a - b);

    if (days.length === 0) {
      return { points: "", dayPoints: [], avgDaily: 0 };
    }

    const max = Math.max(...Object.values(dailyMap), 100);
    const avg = days.length > 0 ? Math.round(total / days.length) : 0;

    // SVG coordinates within 300x120 viewport
    const width = 300;
    const height = 120;
    const paddingX = 20;
    const paddingY = 15;

    const minDay = Math.min(...days);
    const maxDay = Math.max(...days);
    const daySpan = maxDay === minDay ? 1 : maxDay - minDay;

    const computed = days.map((day) => {
      const amt = dailyMap[day];
      const x = paddingX + ((day - minDay) / daySpan) * (width - 2 * paddingX);
      const y = height - paddingY - (amt / max) * (height - 2 * paddingY);
      return { day, amt, x, y };
    });

    const pts = computed.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    return {
      points: pts,
      dayPoints: computed,
      avgDaily: avg,
    };
  }, [transactions]);

  if (!dayPoints.length) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.headerLeft}>
            <h3 className={styles.chartTitle}>Weekly Spending Trend</h3>
            <span className={styles.chartSub}>Daily expense trajectory</span>
          </div>
        </div>
        <div className={styles.chartBody}>
          <p className={styles.emptyState}>No expense transactions recorded yet.</p>
        </div>
      </div>
    );
  }

  // Area under the curve
  const areaPoints = `${dayPoints[0].x},110 ${points} ${dayPoints[dayPoints.length - 1].x},110`;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.chartTitle}>Weekly Spending Trend</h3>
          <span className={styles.chartSub}>Paced against monthly momentum</span>
        </div>
        <span className={styles.countBadge}>
          Daily Avg: {formatCurrency(avgDaily, currency)}
        </span>
      </div>

      <div className={styles.chartBody}>
        <div className={styles.lineContainer}>
          <svg viewBox="0 0 300 130" className={styles.lineSvg}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4648d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4648d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid line */}
            <line x1="15" y1="110" x2="285" y2="110" className={styles.gridLine} />
            <line x1="15" y1="20" x2="285" y2="20" className={styles.gridLine} />

            {/* Shaded Area */}
            <polygon points={areaPoints} className={styles.trendArea} />

            {/* Main Trend Line */}
            <polyline points={points} className={styles.trendPath} />

            {/* Data Circles */}
            {dayPoints.map((p) => (
              <g key={p.day}>
                <circle cx={p.x} cy={p.y} r="4" className={styles.dataDot}>
                  <title>{`Day ${p.day}: ${formatCurrency(p.amt, currency)}`}</title>
                </circle>
                <text x={p.x} y="125" textAnchor="middle" className={styles.axisText}>
                  d{p.day}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TrendLineChart;
