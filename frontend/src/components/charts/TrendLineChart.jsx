import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "../../utils/dateRange";
import styles from "./Charts.module.css";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const parseDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const dateKey = (dt) =>
  `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;

const formatWeekLabel = (start, end) => {
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const sm = MONTHS_SHORT[start.getUTCMonth()];
  const em = MONTHS_SHORT[end.getUTCMonth()];
  return sameMonth
    ? `${sm} ${start.getUTCDate()}-${end.getUTCDate()}`
    : `${sm} ${start.getUTCDate()}-${em} ${end.getUTCDate()}`;
};

const TrendLineChart = ({ transactions = [], currency = "₹", startDate, endDate }) => {
  const { weeks, totalSpend, avgSpend } = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === "expense");
    const daily = new Map();
    let min = null;
    let max = null;

    expenseTxs.forEach((t) => {
      const dt = new Date(t.date);
      const k = dateKey(dt);
      daily.set(k, (daily.get(k) || 0) + (Number(t.amount) || 0));
      if (!min || dt < min) min = dt;
      if (!max || dt > max) max = dt;
    });

    if (!expenseTxs.length) return { weeks: [], totalSpend: 0, avgSpend: 0 };

    const startRaw = parseDate(startDate);
    const endRaw = parseDate(endDate);
    const start = startRaw || new Date(min);
    const end = endRaw || new Date(max);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    const days = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const weeks = [];
    let total = 0;
    for (let i = 0; i < days.length; i += 7) {
      const chunk = days.slice(i, i + 7);
      const sum = chunk.reduce(
        (acc, dt) => acc + (daily.get(dateKey(dt)) || 0),
        0,
      );
      total += sum;
      weeks.push({
        name: formatWeekLabel(chunk[0], chunk[chunk.length - 1]),
        spending: Math.round(sum * 100) / 100,
      });
    }

    const avg = weeks.length ? Math.round((total / weeks.length) * 100) / 100 : 0;
    return { weeks, totalSpend: total, avgSpend: avg };
  }, [transactions, startDate, endDate]);

  if (!weeks.length) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.headerLeft}>
            <h3 className={styles.chartTitle}>Weekly Spending Trend</h3>
            <span className={styles.chartSub}>Expenses bucketed by week</span>
          </div>
        </div>
        <div className={styles.chartBody}>
          <p className={styles.emptyState}>No expense transactions recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.chartTitle}>Weekly Spending Trend</h3>
          <span className={styles.chartSub}>Expenses bucketed by week</span>
        </div>
        <span className={styles.countBadge}>
          Avg/wk: {formatCurrency(avgSpend, currency)}
        </span>
      </div>

      <div className={styles.chartBody}>
        <div className={styles.barChartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#767586", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#767586", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value), currency),
                  "Spending",
                ]}
                cursor={{ fill: "#f2f3ff" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.06)",
                }}
              />
              <ReferenceLine
                y={avgSpend}
                stroke="#b90538"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              <Bar
                dataKey="spending"
                fill="#4648d4"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span>Total spent this cycle</span>
        <span className={styles.footerHighlight}>
          {formatCurrency(totalSpend, currency)}
        </span>
      </div>
    </div>
  );
};

export default TrendLineChart;