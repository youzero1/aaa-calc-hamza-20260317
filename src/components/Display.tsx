'use client';

import React from 'react';
import styles from './Display.module.css';

interface DisplayProps {
  expression: string;
  value: string;
}

const Display: React.FC<DisplayProps> = ({ expression, value }) => {
  return (
    <div className={styles.display}>
      <div className={styles.expression}>{expression}&nbsp;</div>
      <div className={styles.value}>{value || '0'}</div>
    </div>
  );
};

export default Display;