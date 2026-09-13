import styles from "./CategoryPill.module.css";

const CategoryPill = ({
  label,
  variant = "neutral",
  isSelected = false,
  onClick,
  icon,
  className = "",
}) => {
  const isSelectable = Boolean(onClick);

  return (
    <span
      className={`
        ${styles.pill}
        ${styles[variant] || styles.neutral}
        ${isSelectable ? styles.clickable : ""}
        ${isSelected ? styles.selectPillActive : ""}
        ${className}
      `}
      onClick={onClick}
      role={isSelectable ? "button" : undefined}
      tabIndex={isSelectable ? 0 : undefined}
    >
      {icon && <span className={styles.pillIcon}>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

export default CategoryPill;
