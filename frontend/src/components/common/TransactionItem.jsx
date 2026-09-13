import {
  Banknote,
  TrendingUp,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, isEndOfMonth } from "../../utils/dateRange";
import { getCategoryByName } from "../../config/categories";
import CategoryPill from "./CategoryPill";
import styles from "./TransactionItem.module.css";

const TransactionItem = ({
  transaction,
  onDelete,
  onEdit,
  isMonthEnd,
}) => {
  if (!transaction) return null;

  const isExp = transaction.type === "expense";
  const isInc = transaction.type === "income";
  const eom = isMonthEnd !== undefined ? isMonthEnd : isEndOfMonth(transaction.date);

  const categoryDef = getCategoryByName(transaction.category);
  const IconComponent =
    categoryDef?.icon ||
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
    <div
      className={`${styles.row} ${eom ? styles.monthEndRow : ""}`}
      onClick={() => onEdit && onEdit(transaction)}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
    >
      <div className={styles.leftGroup}>
        <div className={`${styles.iconCircle} ${iconCircleClass}`}>
          <IconComponent size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.detailsGroup}>
          <div className={styles.titleRow}>
            <span className={styles.title}>
              {transaction.title || transaction.category}
            </span>
            {eom && <span className={styles.eomBadge}>Month-End</span>}
          </div>
          <div className={styles.metaRow}>
            <CategoryPill
              label={transaction.category || transaction.type}
              variant={transaction.type}
            />
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
            {formatCurrency(transaction.amount)}
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
