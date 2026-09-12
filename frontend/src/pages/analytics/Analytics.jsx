import { useEffect, useMemo } from "react";
import { TrendingDown, PieChart, Activity } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import MonthSelector from "../../components/common/MonthSelector";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import TrendLineChart from "../../components/charts/TrendLineChart";
import { formatCurrency, getCustomMonthRange } from "../../utils/dateRange";
import styles from "./Analytics.module.css";

const Analytics = () => {
  const {
    summary,
    chartTransactions,
    currency,
    currentMonth,
    datePreference,
    refreshAllData,
  } = useTransactionStore();

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const range = getCustomMonthRange(currentMonth, datePreference);
  const dataForCharts = chartTransactions;

  const daysInPeriod = useMemo(() => {
    if (!range?.startDateStr || !range?.endDateStr) return 30;
    const start = new Date(`${range.startDateStr}T00:00:00Z`).getTime();
    const end = new Date(`${range.endDateStr}T00:00:00Z`).getTime();
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  }, [range]);

  // Compute highest category & daily average
  const { topCategory, topCategoryAmount, dailyAvg } = useMemo(() => {
    const expenses = dataForCharts.filter((tx) => tx.type === "expense");
    const categoryTotals = {};
    expenses.forEach((tx) => {
      const cat = tx.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount || 0);
    });

    let maxCat = "None";
    let maxVal = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > maxVal) {
        maxVal = amt;
        maxCat = cat;
      }
    });

    const avg =
      summary.expense > 0
        ? (summary.expense / daysInPeriod).toFixed(2)
        : 0;

    return {
      topCategory: maxCat,
      topCategoryAmount: maxVal,
      dailyAvg: avg,
    };
  }, [dataForCharts, summary.expense, daysInPeriod]);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.titleSection}>
          <span className={styles.overline}>FINANCIAL INTELLIGENCE</span>
          <h1 className={styles.pageTitle}>Spending Insights</h1>
        </div>
      </div>

      <div className={styles.monthRow}>
        <MonthSelector />
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Outflow</span>
            <div className={`${styles.iconBadge} ${styles.iconExpense}`}>
              <TrendingDown size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {formatCurrency(summary.expense, currency)}
          </div>
          <div className={styles.metricSub}>
            Cycle: <strong>{range.label}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Top Expense Category</span>
            <div className={`${styles.iconBadge} ${styles.iconNeutral}`}>
              <PieChart size={18} strokeWidth={2.2} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ textTransform: "capitalize", color: "var(--color-text-main)" }}>
            {topCategory}
          </div>
          <div className={styles.metricSub}>
            {topCategoryAmount > 0
              ? `${formatCurrency(topCategoryAmount, currency)} logged`
              : "No expense recorded"}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Daily Average Run-Rate</span>
            <div className={`${styles.iconBadge} ${styles.iconPrimary}`}>
              <Activity size={18} strokeWidth={2.2} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ color: "var(--color-primary)" }}>
            {formatCurrency(dailyAvg, currency)}
            <span className={styles.perDay}>/day</span>
          </div>
          <div className={styles.metricSub}>
            Invested: <strong>{formatCurrency(summary.investment, currency)}</strong>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className={styles.chartsGrid}>
        <CategoryPieChart transactions={dataForCharts} currency={currency} />
        <TrendLineChart transactions={dataForCharts} currency={currency} />
      </div>
    </div>
  );
};

export default Analytics;
