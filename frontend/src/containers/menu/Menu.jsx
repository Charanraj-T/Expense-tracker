import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils/getInitials";
import styles from "./Menu.module.css";

const Menu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.username || user?.userId || "Account";
  const initials = getInitials(displayName);

  return (
    <nav className={styles.sidebar}>
      <div className={styles.topSection}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <Wallet size={18} strokeWidth={2.2} />
          </div>
          <span className={styles.brandName}>ClearSpend</span>
        </div>

        {/* Navigation Items */}
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
              }
            >
              <LayoutDashboard size={18} className={styles.navIcon} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
              }
            >
              <Receipt size={18} className={styles.navIcon} />
              <span>Transactions</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
              }
            >
              <BarChart3 size={18} className={styles.navIcon} />
              <span>Analytics</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
              }
            >
              <Settings size={18} className={styles.navIcon} />
              <span>Account</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* User Info & Logout at bottom */}
      <div className={styles.bottomSection}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            {user?.email && <span className={styles.userEmail}>{user.email}</span>}
          </div>
        </div>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Menu;
