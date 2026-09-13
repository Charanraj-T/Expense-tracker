import { useNavigate } from "react-router-dom";
import { Download, LogOut, Wallet, ReceiptText } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useTransactionStore } from "../../store/transactionStore";
import { formatCurrency } from "../../utils/dateRange";
import { downloadBlob } from "../../utils/exportCsv";
import { getErrorMessage } from "../../api/axios";
import { exportTransactionsCsv } from "../../services/transactionService";
import styles from "./Account.module.css";

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    datePreference,
    setDatePreference,
    currentMonth,
    summary,
    pagination,
    buildRangeParams,
  } = useTransactionStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExportCurrentMonth = async () => {
    try {
      const blob = await exportTransactionsCsv(buildRangeParams());
      downloadBlob(blob, `transactions_${currentMonth}.csv`);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = await exportTransactionsCsv({});
      downloadBlob(blob, "all_transactions.csv");
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Account Settings</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            {(user?.username || user?.userId || "U").charAt(0).toUpperCase()}
          </div>
          <div className={styles.profileMeta}>
            <div className={styles.nameBadgeRow}>
              <div className={styles.userName}>{user?.username || "Account"}</div>
              <span className={styles.statusBadge}>Active</span>
            </div>
            {user?.email && (
              <div className={styles.userEmail}>{user.email}</div>
            )}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statIconWrap}>
              <Wallet size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Tracked</span>
              <span className={styles.statValue}>
                {formatCurrency(summary.expense)} this month
              </span>
            </div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statIconWrap}>
              <ReceiptText size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Logged</span>
              <span className={styles.statValue}>
                {pagination?.total ?? 0} entries
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Application Preferences</h2>
          <p className={styles.cardDescription}>
            Customize your cycle calculation.
          </p>
        </div>

        <div className={styles.settingItemColumn}>
          <div className={styles.settingText}>
            <span className={styles.settingLabel}>Month Date Cycle</span>
            <span className={styles.settingDescription}>
              Select the calculation baseline for salary cycles vs calendar months
            </span>
          </div>

          <div className={styles.radioGroup}>
            <label
              className={`${styles.radioLabel} ${
                datePreference === "last-day" ? styles.radioSelected : ""
              }`}
            >
              <input
                type="radio"
                name="datePreference"
                value="last-day"
                checked={datePreference === "last-day"}
                onChange={() => setDatePreference("last-day")}
                className={styles.radioInput}
              />
              <div className={styles.radioDetails}>
                <span className={styles.radioTitle}>Custom End-of-Month Cycle</span>
                <span className={styles.radioDesc}>Last day of prior month to end of current (e.g. Sep 30 – Oct 30)</span>
              </div>
              <span className={styles.badgeRecommended}>Default</span>
            </label>

            <label
              className={`${styles.radioLabel} ${
                datePreference === "first-day" ? styles.radioSelected : ""
              }`}
            >
              <input
                type="radio"
                name="datePreference"
                value="first-day"
                checked={datePreference === "first-day"}
                onChange={() => setDatePreference("first-day")}
                className={styles.radioInput}
              />
              <div className={styles.radioDetails}>
                <span className={styles.radioTitle}>Standard Calendar Month</span>
                <span className={styles.radioDesc}>1st of current month to end of current (e.g. Oct 1 – Oct 31)</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Data Export & Backup</h2>
          <p className={styles.cardDescription}>
            Export your transaction activity as spreadsheet-compatible CSV files.
          </p>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCurrentMonth}
          >
            <Download size={15} />
            Export Current Month ({currentMonth})
          </button>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportAll}
          >
            <Download size={15} />
            Export All Records
          </button>
        </div>
      </div>

      <div className={styles.sessionSection}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Account;
