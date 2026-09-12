import { ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { formatCurrency } from "../../utils/dateRange";
import styles from "./SummaryCards.module.css";

const SummaryCards = () => {
  const { summary, currency } = useTransactionStore();

  return (
    <div className={styles.grid}>
      {/* 1. Total Income Card */}
      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Total Income</span>
          <div className={`${styles.iconCircle} ${styles.incomeIconCircle}`}>
            <ArrowDownLeft size={18} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary.income, currency)}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.incomeBadge}`}>
            + Inflow received
          </span>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Total Expenses</span>
          <div className={`${styles.iconCircle} ${styles.expenseIconCircle}`}>
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary.expense, currency)}
        </div>
        <div className={styles.bottomRow}>
          <span className={`${styles.badge} ${styles.expenseBadge}`}>
            - Monthly Outflow
          </span>
        </div>
      </div>

      {/* 3. Invested Card */}
      <div className={styles.card}>
        <div className={styles.topRow}>
          <span className={styles.cardTitle}>Invested</span>
          <div className={`${styles.iconCircle} ${styles.investmentIconCircle}`}>
            <Landmark size={18} strokeWidth={2.2} />
          </div>
        </div>
        <div className={styles.amount}>
          {formatCurrency(summary.investment, currency)}
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
