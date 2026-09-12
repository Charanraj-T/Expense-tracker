import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
    nextMonth,
    prevMonth,
    resetToCurrentMonth,
  } = useTransactionStore();

  const range = getCustomMonthRange(currentMonth, datePreference);
  const isCurrent = currentMonth === getCurrentMonthString();

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.monthPill}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={prevMonth}
          title="Previous Month"
          aria-label="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        <span className={styles.titleLabel}>
          <Calendar size={15} className={styles.calendarIcon} />
          <span>{range.monthName}</span>
        </span>

        <button
          type="button"
          className={styles.navBtn}
          onClick={nextMonth}
          title="Next Month"
          aria-label="Next Month"
        >
          <ChevronRight size={16} />
        </button>
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
