import { Calendar } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import {
  getCustomMonthRange,
  getCurrentMonthString,
} from "../../utils/dateRange";
import styles from "./MonthSelector.module.css";

const MonthSelector = ({ showCycleBadge = true, className = "" }) => {
  const {
    currentMonth,
    datePreference,
    setMonth,
    resetToCurrentMonth,
  } = useTransactionStore();

  const range = getCustomMonthRange(currentMonth, datePreference);
  const isCurrent = currentMonth === getCurrentMonthString();

  const handleMonthChange = (e) => {
    if (e.target.value) setMonth(e.target.value);
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.monthPill}>
        <Calendar size={15} className={styles.calendarIcon} />
        <input
          type="month"
          className={styles.monthInput}
          value={currentMonth}
          onChange={handleMonthChange}
          title="Select Month"
          aria-label="Select Month"
        />
      </div>

      {showCycleBadge && (
        <div className={styles.cycleBadge} title="Custom Month Cycle">
          <span className={styles.cycleDot} />
          <span>Cycle: {range.label}</span>
        </div>
      )}

      {!isCurrent && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={resetToCurrentMonth}
        >
          This Month
        </button>
      )}
    </div>
  );
};

export default MonthSelector;
