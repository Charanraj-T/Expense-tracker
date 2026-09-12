import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import MonthSelector from "../../components/common/MonthSelector";
import SummaryCards from "../../components/common/SummaryCards";
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import TrendLineChart from "../../components/charts/TrendLineChart";
import TransactionItem from "../../components/common/TransactionItem";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const {
    refreshAllData,
    transactions,
    chartTransactions,
    currency,
    openAddModal,
    openEditModal,
  } = useTransactionStore();

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const recentTxs = transactions.slice(0, 4);
  const dataForCharts = chartTransactions;

  return (
    <div className={styles.container}>
      {/* Top Header: FINANCIAL OVERVIEW + Month Selector + CTA */}
      <div className={styles.topSection}>
        <span className={styles.overline}>FINANCIAL OVERVIEW</span>
        <div className={styles.headerBar}>
          <MonthSelector />
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

      {/* 3 Summary Cards */}
      <SummaryCards />

      {/* Middle Row: Category Breakdown + Recent Activity */}
      <div className={styles.midGrid}>
        <CategoryPieChart transactions={dataForCharts} currency={currency} />

        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <div className={styles.recentTitleGroup}>
              <span className={styles.recentBar} />
              <h3 className={styles.recentTitle}>Recent Activity</h3>
            </div>
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => navigate("/transactions")}
            >
              <span>View all transactions</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentTxs.length === 0 ? (
            <p className={styles.emptyState}>
              No transactions logged for this cycle yet.
            </p>
          ) : (
            <div className={styles.txList}>
              {recentTxs.map((tx) => (
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

      {/* Bottom Row: Weekly Spending Trend */}
      <div className={styles.bottomSection}>
        <TrendLineChart transactions={dataForCharts} currency={currency} />
      </div>
    </div>
  );
};

export default Home;
