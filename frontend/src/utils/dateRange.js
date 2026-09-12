/**
 * Date and Month Range Utilities
 * Designed around month-based thinking with custom date ranges.
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Returns current month string in YYYY-MM format.
 */
export const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * Calculates custom month range based on preference.
 * Default ("last-day"):
 * - Oct -> Sep 30 to Oct 30
 * - Nov -> Oct 31 to Nov 30
 * Calendar ("first-day"):
 * - Oct -> Oct 1 to Oct 31
 *
 * @param {string} monthStr - 'YYYY-MM'
 * @param {string} preference - 'last-day' | 'first-day'
 */
export const getCustomMonthRange = (monthStr, preference = "last-day") => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    monthStr = getCurrentMonthString();
  }

  const [yearStr, monthIndexStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthIndexStr, 10); // 1 - 12
  const monthName = MONTH_NAMES[month - 1];

  const formatDateToYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (preference === "first-day") {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of current month
    return {
      monthName: `${monthName} ${year}`,
      startDateStr: formatDateToYMD(startDate),
      endDateStr: formatDateToYMD(endDate),
      label: `${MONTH_NAMES_SHORT[month - 1]} 1 – ${MONTH_NAMES_SHORT[month - 1]} ${endDate.getDate()}, ${year}`,
    };
  }

  // "last-day" logic:
  // Starts on last day of previous month:
  // e.g. for Oct (10): Sep 30.
  // for Nov (11): Oct 31.
  const prevMonthLastDate = new Date(year, month - 1, 0);
  const startMonthShort = MONTH_NAMES_SHORT[prevMonthLastDate.getMonth()];
  const startDay = prevMonthLastDate.getDate();

  // Ends on day 30 for 30/31-day months (or last day for Feb)
  const currentMonthLastDay = new Date(year, month, 0).getDate();
  const endDay = currentMonthLastDay >= 30 ? 30 : currentMonthLastDay;
  const endMonthShort = MONTH_NAMES_SHORT[month - 1];

  const startDate = new Date(
    prevMonthLastDate.getFullYear(),
    prevMonthLastDate.getMonth(),
    startDay,
  );
  const endDate = new Date(year, month - 1, endDay);

  return {
    monthName: `${monthName} ${year}`,
    startDateStr: formatDateToYMD(startDate),
    endDateStr: formatDateToYMD(endDate),
    label: `${startMonthShort} ${startDay} – ${endMonthShort} ${endDay}, ${year}`,
  };
};

/**
 * Checks if a date falls near the end of the month (last 4 days: 27th to 31st)
 */
export const isEndOfMonth = (dateValue) => {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return false;
  // Use UTC or noon-safe day extraction
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return day >= lastDay - 3;
};

/**
 * Formats a date string nicely (e.g., "Oct 28, 2024") in a timezone-safe manner
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Groups transactions into Today, Yesterday, and Older in a timezone-safe manner
 */
export const groupTransactionsByDate = (transactions = []) => {
  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayStr = getLocalDateStr(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterday);

  const groups = {
    today: [],
    yesterday: [],
    older: [],
  };

  transactions.forEach((tx) => {
    if (!tx || !tx.date) return;
    let txDateStr = "";
    if (typeof tx.date === "string" && tx.date.length >= 10) {
      txDateStr = tx.date.slice(0, 10);
    } else {
      const d = new Date(tx.date);
      txDateStr = isNaN(d.getTime()) ? "" : getLocalDateStr(d);
    }

    if (txDateStr === todayStr) {
      groups.today.push(tx);
    } else if (txDateStr === yesterdayStr) {
      groups.yesterday.push(tx);
    } else {
      groups.older.push(tx);
    }
  });

  return groups;
};

/**
 * Currency formatter
 */
export const formatCurrency = (amount, symbol = "₹") => {
  const num = Number(amount) || 0;
  return `${symbol} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
