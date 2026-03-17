'use client';

import React from 'react';
import styles from './Button.module.css';

type ButtonType = 'digit' | 'operator' | 'special' | 'equals';

interface ButtonProps {
  label: string;
  type: ButtonType;
  onClick: () => void;
  isActive?: boolean;
}

const CalcButton: React.FC<ButtonProps> = ({ label, type, onClick, isActive = false }) => {
  const classNames = [
    styles.button,
    styles[type],
    isActive ? styles.activeOperator : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default CalcButton;
