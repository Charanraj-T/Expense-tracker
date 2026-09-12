import {
  Utensils,
  ShoppingCart,
  Home,
  Zap,
  Car,
  ShoppingBag,
  Film,
  Banknote,
  Briefcase,
  TrendingUp,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate, isEndOfMonth } from "../../utils/dateRange";
import CategoryPill from "./CategoryPill";
import styles from "./TransactionItem.module.css";

const CATEGORY_ICONS = {
  food: Utensils,
  dining: Utensils,
  groceries: ShoppingCart,
  rent: Home,
  housing: Home,
  utilities: Zap,
  bills: Zap,
  travel: Car,
  transit: Car,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  salary: Banknote,
  income: Banknote,
  freelance: Briefcase,
  investment: TrendingUp,
  sip: TrendingUp,
};

const TransactionItem = ({
  transaction,
  currency = "₹",
  onDelete,
  onEdit,
  isMonthEnd,
}) => {
  if (!transaction) return null;

  const isExp = transaction.type === "expense";
  const isInc = transaction.type === "income";
  const eom = isMonthEnd !== undefined ? isMonthEnd : isEndOfMonth(transaction.date);

  const catKey = (transaction.category || "").toLowerCase();
  const IconComponent =
    CATEGORY_ICONS[catKey] ||
    (isInc ? Banknote : transaction.type === "investment" ? TrendingUp : CreditCard);

  const iconCircleClass = isInc
    ? styles.incomeIcon
    : transaction.type === "investment"
    ? styles.investmentIcon
    : styles.expenseIcon;

  const amountClass = isInc
    ? styles.incomeAmount
    : transaction.type === "investment"
    ? styles.investmentAmount
    : styles.expenseAmount;

  return (
    <div className={`${styles.row} ${eom ? styles.monthEndRow : ""}`}>
      <div className={styles.leftGroup}>
        <div className={`${styles.iconCircle} ${iconCircleClass}`}>
          <IconComponent size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.detailsGroup}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{transaction.category}</span>
            {eom && <span className={styles.eomBadge}>Month-End</span>}
          </div>
          <div className={styles.metaRow}>
            <CategoryPill
              label={transaction.type}
              variant={transaction.type}
            />
            <span className={styles.dotSeparator}>•</span>
            <span>{formatDate(transaction.date)}</span>
            {transaction.note && (
              <>
                <span className={styles.dotSeparator}>•</span>
                <span className={styles.noteText}>{transaction.note}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.amountGroup}>
          <div className={`${styles.amount} ${amountClass}`}>
            {isInc ? "+" : isExp ? "-" : ""}
            {formatCurrency(transaction.amount, currency)}
          </div>
          <span className={styles.statusLabel}>
            {isInc ? "Inflow" : isExp ? "Outflow" : "Asset"}
          </span>
        </div>
        {onEdit && (
          <button
            type="button"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            title="Edit transaction"
            aria-label="Edit transaction"
          >
            <Pencil size={15} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => onDelete(transaction._id, e)}
            title="Delete transaction"
            aria-label="Delete transaction"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
