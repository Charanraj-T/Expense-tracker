import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Receipt,
  BarChart3,
  User,
  Plus,
} from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import styles from "./MobileNav.module.css";

const MobileNav = () => {
  const { openAddModal } = useTransactionStore();

  return (
    <nav className={styles.mobileNav} aria-label="Mobile Navigation">
      <div className={styles.navSide}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
          }
        >
          <LayoutGrid size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Dashboard</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
          }
        >
          <Receipt size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Transactions</span>
        </NavLink>
      </div>

      <button
        type="button"
        className={styles.fabBtn}
        onClick={openAddModal}
        aria-label="Add Transaction"
        title="Add Transaction"
      >
        <Plus size={26} strokeWidth={2.6} />
      </button>

      <div className={styles.navSide}>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
          }
        >
          <BarChart3 size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Analytics</span>
        </NavLink>

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
          }
        >
          <User size={20} className={styles.navIcon} />
          <span className={styles.navLabel}>Account</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNav;
