import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Activity,
} from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { formatCurrency, getDailyAverage } from "../../utils/dateRange";
import styles from "./SummaryCards.module.css";

const SummaryCards = () => {
  const { summary } = useTransactionStore();

  const dailyAvg = getDailyAverage(summary);

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.dailyCard}`}>
        <div className={styles.dailyMainContent}>
          <div className={styles.dailyHeaderGroup}>
            <div className={`${styles.iconCircle} ${styles.dailyIconCircle}`}>
              <Activity size={18} strokeWidth={2.4} />
            </div>
            <div className={styles.dailyTitleGroup}>
              <span className={styles.cardTitle}>Daily Average Run-Rate</span>
              <span className={styles.dailySubtext}>Spending velocity</span>
            </div>
          </div>
          <div className={`${styles.amount} ${styles.dailyAmount}`}>
            {formatCurrency(dailyAvg)}
            <span className={styles.perDay}>/day</span>
          </div>
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.dailyBadge}`}>
            Daily Run-Rate
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Total Income</span>
          <div className={`${styles.iconCircle} ${styles.incomeIconCircle}`}>
            <ArrowDownLeft size={18} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary?.income || 0)}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.incomeBadge}`}>
            + Inflow received
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Total Expenses</span>
          <div className={`${styles.iconCircle} ${styles.expenseIconCircle}`}>
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary?.expense || 0)}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.expenseBadge}`}>
            - Monthly Outflow
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Invested</span>
          <div className={`${styles.iconCircle} ${styles.investmentIconCircle}`}>
            <Landmark size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary?.investment || 0)}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.investmentBadge}`}>
            Assets & SIPs
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
