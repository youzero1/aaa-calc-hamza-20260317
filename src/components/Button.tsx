'use client';

import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'digit' | 'operator' | 'special' | 'equals' | 'zero';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'digit' }) => {
  const className = `${styles.button} ${styles[variant] || ''}`;

  return (
    <button className={className} onClick={onClick} type="button">
      {label}
    </button>
  );
};

export default Button;