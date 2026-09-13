import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../../utils/dateRange";
import styles from "./Charts.module.css";

const PALETTE = [
  "#4648d4",
  "#dc2c4f",
  "#006c49",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

const CategoryPieChart = ({ transactions = [] }) => {
  const { categoryData, totalExpense, highestCategory } = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const expenseTxs = list.filter((t) => t && t.type === "expense");
    const map = {};
    let total = 0;

    expenseTxs.forEach((t) => {
      const cat = (t?.category || "other").toLowerCase();
      const amt = Number(t?.amount) || 0;
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });

    const items = Object.entries(map)
      .map(([name, value], index) => ({
        name,
        value,
        color: PALETTE[index % PALETTE.length],
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      categoryData: items,
      totalExpense: total,
      highestCategory: items[0]?.name || "",
    };
  }, [transactions]);

  if (!Array.isArray(transactions) || !transactions.length || totalExpense === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.headerLeft}>
            <h3 className={styles.chartTitle}>Category Breakdown</h3>
            <span className={styles.chartSub}>Monthly spending distribution</span>
          </div>
        </div>
        <div className={styles.chartBody}>
          <p className={styles.emptyState}>No expense transactions found for this month.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.chartTitle}>Category Breakdown</h3>
          <span className={styles.chartSub}>Monthly spending distribution</span>
        </div>
        <span className={styles.countBadge}>{categoryData.length} Categories</span>
      </div>

      <div className={styles.chartBody}>
        <div className={styles.pieContainer}>
          <div className={styles.svgWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="80%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {categoryData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.06)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterLabel}>Top Spent</div>
              <div className={styles.donutCenterValue}>
                {highestCategory || "None"}
              </div>
            </div>
          </div>

          <div className={styles.legendList}>
            {categoryData.slice(0, 6).map((item) => (
              <div key={item.name} className={styles.legendItem}>
                <div className={styles.legendDotLabel}>
                  <span className={styles.dot} style={{ background: item.color }} />
                  <span className={styles.catLabelText}>{item.name}</span>
                </div>
                <span className={styles.legendFigures}>
                  {item.percentage.toFixed(0)}%
                  <span className={styles.legendAmount}> ({formatCurrency(item.value)})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {highestCategory && (
        <div className={styles.cardFooter}>
          <span>Highest outflow category</span>
          <span className={styles.footerHighlight}>{highestCategory}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;