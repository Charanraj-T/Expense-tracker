import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChevronDown,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieIcon,
  CreditCard,
} from "lucide-react";
import MonthSelector from "../../components/common/MonthSelector";
import { useTransactionStore } from "../../store/transactionStore";
import { getTransactions } from "../../services/transactionService";
import {
  formatCurrency,
  getCustomMonthRange,
  getCurrentMonthString,
} from "../../utils/dateRange";
import { CATEGORY_GROUPS, getCategoryByName } from "../../config/categories";
import styles from "./Analytics.module.css";

const CATEGORY_COLORS = {
  food: "#4f46e5",
  groceries: "#0284c7",
  shopping: "#64748b",
  rent: "#6366f1",
  bills: "#f59e0b",
  travel: "#059669",
  entertainment: "#e11d48",
  health: "#10b981",
  books: "#8b5cf6",
  salary: "#059669",
  freelance: "#0284c7",
  sip: "#4f46e5",
  mutual_funds: "#8b5cf6",
  stocks: "#0284c7",
  ppf: "#d97706",
  gold: "#eab308",
  fixed_deposit: "#0d9488",
  investment: "#4f46e5",
  other: "#94a3b8",
};

const FALLBACK_PALETTE = [
  "#4f46e5",
  "#059669",
  "#0284c7",
  "#e11d48",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#64748b",
];

const getCategoryColor = (name, index = 0) => {
  const key = String(name || "").toLowerCase();
  return CATEGORY_COLORS[key] || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
};

const getCategoryIcon = (name) => getCategoryByName(name)?.icon || CreditCard;

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !Array.isArray(payload) || !payload.length) return null;

  return (
    <div className={styles.customTooltip}>
      <div className={styles.tooltipTitle}>{label}</div>
      {payload.map((item, idx) => {
        if (!item) return null;
        return (
          <div key={idx} className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: item.color || item.fill || "#4648d4" }}
              />
              {item.name || "Value"}:
            </span>
            <span className={styles.tooltipValue}>
              {formatCurrency(item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Analytics = () => {
  const { currentMonth, datePreference } = useTransactionStore();

  const [rangePeriod, setRangePeriod] = useState("this_month");
  const [filterType, setFilterType] = useState("");
  const [granularity, setGranularity] = useState("daily");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dateRange = useMemo(() => {
    const monthStr = currentMonth || getCurrentMonthString();
    const parts = String(monthStr || "").split("-").map(Number);
    const y = parts[0] && !isNaN(parts[0]) ? parts[0] : new Date().getFullYear();
    const m = parts[1] && !isNaN(parts[1]) ? parts[1] : new Date().getMonth() + 1;

    if (rangePeriod === "this_month") {
      const customRange = getCustomMonthRange(monthStr, datePreference);
      return {
        startDate: customRange?.startDateStr || "",
        endDate: customRange?.endDateStr || "",
        title: customRange?.monthName || "Current Month",
      };
    }

    if (rangePeriod === "last_3_months") {
      const startD = new Date(Date.UTC(y, m - 3, 1));
      const endD = new Date(Date.UTC(y, m, 0));
      const fmt = (d) =>
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      return {
        startDate: fmt(startD),
        endDate: fmt(endD),
        title: "Last 3 Months",
      };
    }

    if (rangePeriod === "ytd") {
      const startD = new Date(Date.UTC(y, 0, 1));
      const endD = new Date(Date.UTC(y, m, 0));
      const fmt = (d) =>
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      return {
        startDate: fmt(startD),
        endDate: fmt(endD),
        title: `Year ${y}`,
      };
    }

    return { startDate: "", endDate: "", title: "" };
  }, [currentMonth, rangePeriod, datePreference]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (!dateRange?.startDate || !dateRange?.endDate) return;
      setIsLoading(true);
      try {
        const data = await getTransactions({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          category: selectedCategory || undefined,
          type: filterType || undefined,
          limit: 1000,
        });
        if (!isCancelled) {
          setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
        }
      } catch (err) {
        console.error("Failed to load analytics transactions:", err);
        if (!isCancelled) setTransactions([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [dateRange, selectedCategory, filterType]);

  const analyticsData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;

    const txList = Array.isArray(transactions) ? transactions : [];

    txList.forEach((tx) => {
      if (!tx) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") totalIncome += amt;
      else if (tx.type === "expense") totalExpense += amt;
      else if (tx.type === "investment") totalInvestment += amt;
    });

    const netSavings = totalIncome - totalExpense - totalInvestment;
    const savingsRate =
      totalIncome > 0
        ? ((totalInvestment + Math.max(0, netSavings)) / totalIncome) * 100
        : 0;

    let daysCount = 30;
    if (dateRange?.startDate && dateRange?.endDate) {
      const s = new Date(dateRange.startDate);
      const e = new Date(dateRange.endDate);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        if (diff > 0) daysCount = diff;
      }
    }

    const dailyBurnRate = daysCount > 0 ? totalExpense / daysCount : 0;

    const categoryMap = {};
    let categoryTotal = 0;

    txList.forEach((tx) => {
      if (!tx) return;
      if (filterType ? tx.type === filterType : tx.type === "expense") {
        const cat = (tx.category || "other").toLowerCase();
        const amt = Number(tx.amount) || 0;
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
        categoryTotal += amt;
      }
    });

    const categoryList = Object.entries(categoryMap)
      .map(([name, amount], index) => {
        const percent = categoryTotal > 0 ? (amount / categoryTotal) * 100 : 0;
        return {
          name,
          amount,
          percent: Math.round(percent),
          color: getCategoryColor(name, index),
          Icon: getCategoryIcon(name),
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryList[0] || null;

    return {
      totalIncome,
      totalExpense,
      totalInvestment,
      netSavings,
      savingsRate,
      daysCount,
      dailyBurnRate,
      categoryList,
      categoryTotal,
      topCategory,
    };
  }, [transactions, dateRange, filterType]);

  const chartData = useMemo(() => {
    const txList = Array.isArray(transactions) ? transactions : [];
    if (!txList.length) return [];

    const bucketMap = new Map();

    const getBucketKeyAndLabel = (dateVal) => {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;

      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const day = d.getUTCDate();
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      if (granularity === "daily") {
        const key = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const label = `${day} ${monthNames[m - 1]}`;
        return { key, label, order: key };
      }

      if (granularity === "weekly") {
        const weekNum = Math.min(5, Math.ceil(day / 7));
        const key = `${y}-${String(m).padStart(2, "0")}-W${weekNum}`;
        const label = `Week ${weekNum} (${monthNames[m - 1]})`;
        return { key, label, order: key };
      }

      if (granularity === "monthly") {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        const label = `${monthNames[m - 1]} ${y}`;
        return { key, label, order: key };
      }

      if (granularity === "yearly") {
        const key = `${y}`;
        const label = `${y}`;
        return { key, label, order: key };
      }

      return null;
    };

    txList.forEach((tx) => {
      if (!tx || !tx.date) return;
      const parsed = getBucketKeyAndLabel(tx.date);
      if (!parsed) return;

      const { key, label, order } = parsed;
      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          key,
          label,
          order,
          income: 0,
          expense: 0,
          investment: 0,
          total: 0,
        });
      }

      const bucket = bucketMap.get(key);
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") bucket.income += amt;
      else if (tx.type === "expense") bucket.expense += amt;
      else if (tx.type === "investment") bucket.investment += amt;
      bucket.total += amt;
    });

    return Array.from(bucketMap.values()).sort((a, b) =>
      a.order.localeCompare(b.order),
    );
  }, [transactions, granularity]);

  const averageValue = useMemo(() => {
    if (!Array.isArray(chartData) || !chartData.length) return 0;
    const key = filterType || "expense";
    const sum = chartData.reduce((acc, b) => acc + (Number(b?.[key]) || 0), 0);
    return Math.round(sum / chartData.length);
  }, [chartData, filterType]);

  const availableCategories = useMemo(() => {
    if (filterType && CATEGORY_GROUPS?.[filterType]) {
      return CATEGORY_GROUPS[filterType];
    }
    const all = [
      ...(CATEGORY_GROUPS?.expense || []),
      ...(CATEGORY_GROUPS?.income || []),
      ...(CATEGORY_GROUPS?.investment || []),
    ];
    const seen = new Set();
    return all.filter((c) => {
      if (!c || !c.name) return false;
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    });
  }, [filterType]);

  return (
    <div className={styles.analyticsPage}>
      <section className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            Financial Intelligence • Live Sync Active
          </div>
          <h1 className={styles.title}>Analytics & Insights</h1>
          <p className={styles.subtitle}>
            Clear breakdown of where your money goes across {dateRange.title}
          </p>
        </div>

        <div className={styles.headerRight}>
          <MonthSelector />
          <div className={styles.periodPills}>
            <button
              type="button"
              className={`${styles.periodPill} ${
                rangePeriod === "this_month" ? styles.activePeriodPill : ""
              }`}
              onClick={() => setRangePeriod("this_month")}
            >
              This Month
            </button>
            <button
              type="button"
              className={`${styles.periodPill} ${
                rangePeriod === "last_3_months" ? styles.activePeriodPill : ""
              }`}
              onClick={() => setRangePeriod("last_3_months")}
            >
              Last 3 Months
            </button>
            <button
              type="button"
              className={`${styles.periodPill} ${
                rangePeriod === "ytd" ? styles.activePeriodPill : ""
              }`}
              onClick={() => setRangePeriod("ytd")}
            >
              Year to Date
            </button>
          </div>
        </div>
      </section>

      <section className={styles.filterToolbar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type:</span>
          <div className={styles.segmentGroup}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                filterType === "" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setFilterType("")}
            >
              <span className={styles.desktopText}>All Cashflow</span>
              <span className={styles.mobileText}>All</span>
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                filterType === "expense" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setFilterType("expense")}
            >
              Expenses
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                filterType === "income" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setFilterType("income")}
            >
              Income
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                filterType === "investment" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setFilterType("investment")}
            >
              <span className={styles.desktopText}>Savings & Investments</span>
              <span className={styles.mobileText}>Savings</span>
            </button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Timeframe:</span>
          <div className={styles.segmentGroup}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                granularity === "daily" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setGranularity("daily")}
            >
              Daily
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                granularity === "weekly" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setGranularity("weekly")}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                granularity === "monthly" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setGranularity("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${styles.segmentBtn} ${
                granularity === "yearly" ? styles.activeSegmentBtn : ""
              }`}
              onClick={() => setGranularity("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category:</span>
          <div className={styles.categorySelectWrapper}>
            <select
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
            >
              <option value="">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectChevron} />
          </div>
        </div>
      </section>

      <section className={styles.mainGrid}>
        <div className={`${styles.contentCard} ${styles.categoryCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardHeaderTitle}>Spending by Category</h2>
              <div className={styles.cardHeaderSub}>
                Total Outflow: {formatCurrency(analyticsData.categoryTotal)}
              </div>
            </div>
            <span className={styles.cardHeaderBadge}>
              {analyticsData.categoryList.length} Categories
            </span>
          </div>

          {analyticsData.categoryList.length > 0 && (
            <div
              className={styles.segmentedBarContainer}
              title="Distribution across categories"
            >
              {analyticsData.categoryList.map((cat) => (
                <div
                  key={cat.name}
                  className={styles.segmentedBarSlice}
                  style={{
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color,
                  }}
                  title={`${cat.name}: ${cat.percent}%`}
                />
              ))}
            </div>
          )}

          {analyticsData.categoryList.length === 0 ? (
            <div className={styles.emptyState}>
              <PieIcon size={32} />
              <span className={styles.emptyStateTitle}>No data recorded</span>
              <span>No transactions match the selected filters.</span>
            </div>
          ) : (
            <div className={styles.categoryRankList}>
              {analyticsData.categoryList.map((cat) => (
                <div key={cat.name} className={styles.categoryItem}>
                  <div className={styles.categoryItemTop}>
                    <div className={styles.categoryItemLeft}>
                      <div
                        className={styles.categoryIconBox}
                        style={{
                          backgroundColor: `${cat.color}18`,
                          color: cat.color,
                        }}
                      >
                        <cat.Icon size={16} strokeWidth={2.2} />
                      </div>
                      <div className={styles.categoryTextInfo}>
                        <span className={styles.categoryName}>
                          {cat.name.replace(/_/g, " ")}
                        </span>
                        <span className={styles.categorySubtext}>
                          {cat.percent}% of outflow
                        </span>
                      </div>
                    </div>
                    <div className={styles.categoryItemRight}>
                      <span className={styles.categoryAmount}>
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className={styles.categoryPercentage}>
                        {cat.percent}%
                      </span>
                    </div>
                  </div>
                  <div className={styles.categoryProgressBarTrack}>
                    <div
                      className={styles.categoryProgressBarFill}
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.contentCard} ${styles.chartCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardHeaderTitle}>
                {filterType === ""
                  ? "Cashflow Comparison"
                  : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Trend`}
              </h2>
              <div className={styles.cardHeaderSub}>
                {filterType === ""
                  ? `Income vs Outflow (${granularity} view)`
                  : `${granularity} breakdown with average baseline`}
              </div>
            </div>

            <div className={styles.chartLegend}>
              {filterType === "" ? (
                <>
                  <div className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: "#059669" }}
                    />
                    <span>Income</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ backgroundColor: "#4f46e5" }}
                    />
                    <span>Expenses</span>
                  </div>
                </>
              ) : (
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{
                      backgroundColor:
                        filterType === "income"
                          ? "#059669"
                          : filterType === "investment"
                            ? "#0284c7"
                            : "#4f46e5",
                    }}
                  />
                  <span>
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartContainer}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <span>Loading analytics graph...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateTitle}>No graph data</span>
                <span>No transactions found for the selected timeframe.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    minTickGap={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                  />
                  <Tooltip
                    content={<CustomChartTooltip />}
                  />
                  {filterType === "" ? (
                    <>
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="expense"
                        name="Expenses"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        isAnimationActive={false}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey={filterType}
                        name={
                          filterType.charAt(0).toUpperCase() +
                          filterType.slice(1)
                        }
                        fill={
                          filterType === "income"
                            ? "#059669"
                            : filterType === "investment"
                              ? "#0284c7"
                              : "#4f46e5"
                        }
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                        isAnimationActive={false}
                      />
                      {averageValue > 0 && (
                        <ReferenceLine
                          y={averageValue}
                          stroke="#94a3b8"
                          strokeDasharray="3 3"
                          label={{
                            value: `Avg: ${formatCurrency(averageValue)}`,
                            fill: "#64748b",
                            fontSize: 11,
                            position: "top",
                          }}
                        />
                      )}
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.graphHighlightsRow}>
            <div className={styles.highlightMiniCard}>
              <div
                className={`${styles.highlightIconCircle} ${styles.highlightInflowIcon}`}
              >
                <ArrowDownLeft size={16} strokeWidth={2.4} />
              </div>
              <div className={styles.highlightContent}>
                <span className={styles.highlightLabel}>Total Inflow</span>
                <span className={styles.highlightAmount}>
                  {formatCurrency(analyticsData.totalIncome)}
                </span>
              </div>
            </div>

            <div className={styles.highlightMiniCard}>
              <div
                className={`${styles.highlightIconCircle} ${styles.highlightOutflowIcon}`}
              >
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </div>
              <div className={styles.highlightContent}>
                <span className={styles.highlightLabel}>Total Outflow</span>
                <span className={styles.highlightAmount}>
                  {formatCurrency(analyticsData.totalExpense)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.netSavingsBanner}>
            <span>
              Net Period Position ({dateRange.title}):
            </span>
            <span
              className={styles.netSavingsValue}
              style={{
                color: analyticsData.netSavings >= 0 ? "#166534" : "#991b1b",
              }}
            >
              {analyticsData.netSavings >= 0 ? "+" : ""}
              {formatCurrency(analyticsData.netSavings)} (
              {analyticsData.savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
