interface SwitchProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  /** Декоративный режим: переключатель внутри кликабельной карточки, без собственной роли. */
  decorative?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, decorative = false, className = '' }: SwitchProps) {
  const classes = `switch${checked ? ' switch--on' : ''}${className ? ` ${className}` : ''}`;

  if (decorative) {
    return (
      <span className={classes} aria-hidden="true">
        <span className="switch__thumb" />
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={classes}
      onClick={() => onChange?.(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  );
}
