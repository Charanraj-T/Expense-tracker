import { useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import { getCurrentMonthString } from "../../utils/dateRange";
import styles from "./MonthSelector.module.css";

const MonthSelector = ({ className = "" }) => {
  const {
    currentMonth,
    setMonth,
    resetToCurrentMonth,
  } = useTransactionStore();

  const inputRef = useRef(null);
  const isCurrent = currentMonth === getCurrentMonthString();

  const handleMonthChange = (e) => {
    if (e.target.value) setMonth(e.target.value);
  };

  const formattedMonth = (() => {
    if (!currentMonth || !/^\d{4}-\d{2}$/.test(currentMonth)) return "Current Month";
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, 1));
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  })();

  const handleOpenPicker = () => {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={styles.monthPill}
        onClick={handleOpenPicker}
        role="button"
        tabIndex={0}
        title="Click to select month"
      >
        <Calendar size={16} className={styles.calendarIcon} />
        <span className={styles.monthTitle}>{formattedMonth}</span>
        <ChevronDown size={14} className={styles.chevronIcon} />
        <input
          ref={inputRef}
          type="month"
          className={styles.hiddenMonthInput}
          value={currentMonth}
          onChange={handleMonthChange}
          aria-label="Select Month"
        />
      </div>

      {!isCurrent && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={resetToCurrentMonth}
          title="Reset to current month"
        >
          This Month
        </button>
      )}
    </div>
  );
};

export default MonthSelector;
