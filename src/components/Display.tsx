'use client';

import React from 'react';
import styles from './Display.module.css';

interface DisplayProps {
  value: string;
  expression: string;
}

const Display: React.FC<DisplayProps> = ({ value, expression }) => {
  const fontSize = value.length > 9 ? '1.8rem' : value.length > 6 ? '2.4rem' : '3rem';

  return (
    <div className={styles.display}>
      <div className={styles.expression}>
        {expression || '\u00A0'}
      </div>
      <div
        className={`${styles.value} ${value === 'Error' ? styles.error : ''}`}
        style={{ fontSize }}
      >
        {value}
      </div>
    </div>
  );
};

export default Display;
