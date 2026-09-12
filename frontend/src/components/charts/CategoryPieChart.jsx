import { useMemo } from "react";
import { formatCurrency } from "../../utils/dateRange";
import styles from "./Charts.module.css";

const PALETTE = [
  "#4648d4", // Royal Indigo (Primary)
  "#dc2c4f", // Rose Red (Tertiary)
  "#006c49", // Emerald Green (Secondary)
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

const CategoryPieChart = ({ transactions = [], currency = "₹" }) => {
  const { categoryData, totalExpense, highestCategory } = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === "expense");
    const map = {};
    let total = 0;

    expenseTxs.forEach((t) => {
      const cat = (t.category || "other").toLowerCase();
      const amt = Number(t.amount) || 0;
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

  if (!transactions.length || totalExpense === 0) {
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

  // SVG Donut geometry
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

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
            <svg viewBox="0 0 100 100" className={styles.pieSvg} width="100%" height="100%">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--color-surface-dim)"
                strokeWidth="15"
              />
              {categoryData.map((item) => {
                const strokeLength = (item.percentage / 100) * circumference;
                const offset = accumulatedOffset;
                accumulatedOffset += strokeLength;

                return (
                  <circle
                    key={item.name}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="15"
                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
            </svg>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterLabel}>TOTAL OUT</div>
              <div className={styles.donutCenterValue}>
                {formatCurrency(totalExpense, currency)}
              </div>
            </div>
          </div>

          <div className={styles.legendList}>
            {categoryData.slice(0, 5).map((item) => (
              <div key={item.name} className={styles.legendItem}>
                <div className={styles.legendDotLabel}>
                  <span className={styles.dot} style={{ background: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className={styles.legendFigures}>
                  {item.percentage.toFixed(0)}% ({formatCurrency(item.value, currency)})
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
