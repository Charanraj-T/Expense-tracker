import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Activity, BarChart3 } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import MonthSelector from "../../components/common/MonthSelector";
import SummaryCards from "../../components/common/SummaryCards";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import TransactionItem from "../../components/common/TransactionItem";
import { formatCurrency, getDailyAverage } from "../../utils/dateRange";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const {
    refreshAllData,
    todayTransactions,
    chartTransactions,
    summary,
    currency,
    openAddModal,
    openEditModal,
  } = useTransactionStore();

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const dailyAvg = getDailyAverage(summary);

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div className={styles.headerBar}>
          <div className={styles.monthAndRunRateRow}>
            <MonthSelector />
            <div className={styles.mobileRunRatePill} title="Daily Average Run-Rate">
              <Activity size={13} className={styles.runRateIcon} strokeWidth={2.4} />
              <span>{formatCurrency(dailyAvg, currency)}/day</span>
            </div>
          </div>

          <div className={styles.headerActionGroup}>
            <button
              type="button"
              className={styles.analyticsQuickBtn}
              onClick={() => navigate("/analytics")}
              title="View Visual Analytics"
            >
              <BarChart3 size={15} />
              <span>Analytics</span>
            </button>
            <button
              type="button"
              className={styles.addBtn}
              onClick={openAddModal}
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </div>

      <SummaryCards />

      <div className={styles.midGrid}>
        <CategoryPieChart transactions={chartTransactions} currency={currency} />

        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <div className={styles.recentTitleGroup}>
              <span className={styles.recentBar} />
              <h3 className={styles.recentTitle}>Today's Transactions</h3>
              {Array.isArray(todayTransactions) && todayTransactions.length > 0 && (
                <span className={styles.countBadge}>
                  {todayTransactions.length}
                </span>
              )}
            </div>
            <div className={styles.recentActions}>
              <button
                type="button"
                className={styles.viewAnalyticsLink}
                onClick={() => navigate("/analytics")}
              >
                <BarChart3 size={14} />
                <span>Visual insights</span>
              </button>
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() => navigate("/transactions")}
              >
                <span>All transactions</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {!Array.isArray(todayTransactions) || todayTransactions.length === 0 ? (
            <div className={styles.emptyTodayState}>
              <p className={styles.emptyState}>
                No transactions logged today.
              </p>
              <button
                type="button"
                className={styles.logTodayBtn}
                onClick={openAddModal}
              >
                <Plus size={14} />
                <span>Log today's expense</span>
              </button>
            </div>
          ) : (
            <div className={styles.txList}>
              {todayTransactions.map((tx) => (
                <TransactionItem
                  key={tx._id}
                  transaction={tx}
                  currency={currency}
                  onEdit={() => openEditModal(tx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
