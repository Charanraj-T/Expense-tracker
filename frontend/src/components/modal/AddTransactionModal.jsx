import { useState, useRef, useEffect } from "react";
import {
  Zap,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Delete,
  Calendar,
  FileText,
  Check,
  Tag,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Home,
  Car,
  Film,
  Banknote,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { useTransactionStore } from "../../store/transactionStore";
import styles from "./AddTransactionModal.module.css";

const ALL_CATEGORIES = [
  { name: "food", icon: Utensils, label: "Food & Dining" },
  { name: "groceries", icon: ShoppingCart, label: "Groceries" },
  { name: "shopping", icon: ShoppingBag, label: "Shopping" },
  { name: "rent", icon: Home, label: "Rent & Living" },
  { name: "travel", icon: Car, label: "Transit" },
  { name: "bills", icon: Zap, label: "Utilities" },
  { name: "entertainment", icon: Film, label: "Entertainment" },
  { name: "salary", icon: Banknote, label: "Salary" },
  { name: "freelance", icon: Briefcase, label: "Freelance" },
  { name: "investment", icon: TrendingUp, label: "Investment" },
  { name: "other", icon: CreditCard, label: "Other" },
];

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AddTransactionModal = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    addTransaction,
    updateTransaction,
    editingTransaction,
    recentCategories,
    currency,
  } = useTransactionStore();

  const amountRef = useRef(null);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState("");

  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(editingTransaction);

  // Pre-select most recent category and auto-focus amount when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setTimeout(() => {
        amountRef.current?.focus();
      }, 50);
      setFeedback("");
      setError("");
      const initialCat =
        recentCategories && recentCategories.length > 0
          ? recentCategories[0]
          : "food";
      setCategory(initialCat);
      setCustomCategory("");
    }
  }, [isAddModalOpen, recentCategories]);

  // Prefill fields when editing an existing transaction
  useEffect(() => {
    if (isAddModalOpen && editingTransaction) {
      const tx = editingTransaction;
      const txCategory = tx.category || "";
      const isKnownCategory = ALL_CATEGORIES.some((c) => c.name === txCategory);
      setAmount(String(tx.amount ?? ""));
      setType(tx.type || "expense");
      setCategory(txCategory);
      setCustomCategory(isKnownCategory ? "" : txCategory);
      setDate(
        tx.date
          ? new Date(tx.date).toISOString().slice(0, 10)
          : getTodayDateString(),
      );
      setNote(tx.note || "");
      setFeedback("");
      setError("");
    }
  }, [isAddModalOpen, editingTransaction]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAddModalOpen) {
        closeAddModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, closeAddModal]);

  if (!isAddModalOpen) return null;

  const handleSelectCategory = (catName) => {
    setCategory(catName);
    setCustomCategory("");
    if (feedback) setFeedback("");
    if (error) setError("");
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    setCategory(e.target.value);
    if (feedback) setFeedback("");
    if (error) setError("");
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (feedback) setFeedback("");
    if (error) setError("");
  };

  const handleClearAmount = () => {
    setAmount("");
    amountRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      amountRef.current?.focus();
      return;
    }

    const finalCategory = (category || customCategory || "")
      .trim()
      .toLowerCase();
    if (!finalCategory) {
      setError("Please select or enter a category");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: numAmount,
        type,
        category: finalCategory,
        date: new Date(`${date}T12:00:00.000Z`).toISOString(),
        note: note.trim() || undefined,
      };

      if (isEditing) {
        await updateTransaction(payload);
        return;
      }

      await addTransaction(payload);

      // Clear fields as required
      setAmount("");
      setNote("");
      setCustomCategory("");
      setCategory("");

      setFeedback(
        `Added ${currency} ${numAmount} (${finalCategory})! Ready for next.`,
      );

      // Keep modal open, refocus Amount
      setTimeout(() => {
        amountRef.current?.focus();
      }, 50);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  // Build list of primary category items
  const primaryCategoryKeys = (
    recentCategories && recentCategories.length > 0
      ? recentCategories
      : ["food", "groceries", "shopping"]
  ).slice(0, 4);

  const getCatObj = (catName) => {
    const found = ALL_CATEGORIES.find((c) => c.name === catName);
    return found || { name: catName, icon: Tag, label: catName };
  };

  const primaryList = primaryCategoryKeys.map(getCatObj);
  const moreList = ALL_CATEGORIES.filter(
    (c) => !primaryCategoryKeys.includes(c.name)
  );

  const currentCategoryObj = getCatObj(category || customCategory);

  return (
    <div className={styles.backdrop} onClick={closeAddModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.lightningIcon}>
              <Zap size={14} />
            </div>
            <span className={styles.headerTitle}>
              {isEditing ? "EDIT TRANSACTION" : "SPEED LOGGER"}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeAddModal}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {feedback && (
          <div className={styles.successFlash}>
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 1. Type Selector (Segmented Toggle) */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "expense" ? styles.activeExpense : ""}`}
              onClick={() => {
                setType("expense");
                if (feedback) setFeedback("");
              }}
            >
              <ArrowUpRight size={14} /> Expense
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "income" ? styles.activeIncome : ""}`}
              onClick={() => {
                setType("income");
                if (feedback) setFeedback("");
              }}
            >
              <ArrowDownLeft size={14} /> Income
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === "investment" ? styles.activeInvestment : ""}`}
              onClick={() => {
                setType("investment");
                if (feedback) setFeedback("");
              }}
            >
              <TrendingUp size={14} /> Invest
            </button>
          </div>

          {/* 2. Amount Input Box (Primary Focus) */}
          <div className={styles.amountContainer}>
            <div className={styles.amountInputGroup}>
              <span className={styles.amountPrefix}>
                {type === "income" ? "+" : type === "expense" ? "-" : ""}{currency}
              </span>
              <input
                ref={amountRef}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0"
                className={styles.amountInput}
                value={amount}
                onChange={handleAmountChange}
                required
                autoFocus
              />
            </div>
            {amount && (
              <button
                type="button"
                className={styles.clearAmountBtn}
                onClick={handleClearAmount}
                title="Clear"
              >
                <Delete size={16} />
              </button>
            )}
          </div>

          {/* 3. Category Selector */}
          <div className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <span className={styles.sectionLabel}>Category</span>
              {category && (
                <span className={styles.selectedCatLabel}>
                  {currentCategoryObj.label}
                </span>
              )}
            </div>

            <div className={styles.chipList}>
              {primaryList.map((cat) => {
                const ChipIcon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`${styles.categoryChip} ${
                      category === cat.name ? styles.chipSelected : ""
                    }`}
                    onClick={() => handleSelectCategory(cat.name)}
                  >
                    <ChipIcon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.moreChip}
                onClick={() => setShowMoreCategories((prev) => !prev)}
              >
                {showMoreCategories ? "Less..." : "+ More..."}
              </button>
            </div>

            {showMoreCategories && (
              <div className={styles.chipList} style={{ marginTop: "0.25rem" }}>
                {moreList.map((cat) => {
                  const ChipIcon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      className={`${styles.categoryChip} ${
                        category === cat.name ? styles.chipSelected : ""
                      }`}
                      onClick={() => handleSelectCategory(cat.name)}
                    >
                      <ChipIcon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              placeholder="Or type custom category..."
              className={styles.customCategoryInput}
              value={customCategory}
              onChange={handleCustomCategoryChange}
            />
          </div>

          {/* 4. Date Picker Input */}
          <div className={styles.inputFieldWrapper}>
            <Calendar size={16} className={styles.inputIcon} />
            <input
              type="date"
              className={styles.inputField}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (feedback) setFeedback("");
              }}
              required
            />
          </div>

          {/* 5. Note Input */}
          <div className={styles.inputFieldWrapper}>
            <FileText size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Add note (optional)..."
              className={styles.inputField}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (feedback) setFeedback("");
              }}
            />
          </div>

          {/* 6. Save Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <Check size={16} />
            <span>
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update"
                  : `Save ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
