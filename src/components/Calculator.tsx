'use client';

import React, { useState, useCallback } from 'react';
import Display from './Display';
import Button from './Button';
import type { ButtonVariant } from './Button';
import styles from './Calculator.module.css';

interface ButtonConfig {
  label: string;
  variant: ButtonVariant;
  action: string;
}

const buttons: ButtonConfig[] = [
  { label: 'C', variant: 'special', action: 'clear' },
  { label: '±', variant: 'special', action: 'negate' },
  { label: '%', variant: 'special', action: 'percent' },
  { label: '÷', variant: 'operator', action: '/' },
  { label: '7', variant: 'digit', action: '7' },
  { label: '8', variant: 'digit', action: '8' },
  { label: '9', variant: 'digit', action: '9' },
  { label: '×', variant: 'operator', action: '*' },
  { label: '4', variant: 'digit', action: '4' },
  { label: '5', variant: 'digit', action: '5' },
  { label: '6', variant: 'digit', action: '6' },
  { label: '−', variant: 'operator', action: '-' },
  { label: '1', variant: 'digit', action: '1' },
  { label: '2', variant: 'digit', action: '2' },
  { label: '3', variant: 'digit', action: '3' },
  { label: '+', variant: 'operator', action: '+' },
  { label: '0', variant: 'zero', action: '0' },
  { label: '.', variant: 'digit', action: '.' },
  { label: '=', variant: 'equals', action: '=' },
];

function formatNumber(num: number): string {
  if (!isFinite(num)) return 'Error';
  const str = String(num);
  if (str.length > 14) {
    return num.toPrecision(10);
  }
  return str;
}

export function calculate(a: number, operator: string, b: number): number {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? Infinity : a / b;
    default:
      return b;
  }
}

const Calculator: React.FC = () => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue((prev) => (prev === '0' ? digit : prev + digit));
    }
  }, [waitingForSecondOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    setDisplayValue((prev) => (prev.includes('.') ? prev : prev + '.'));
  }, [waitingForSecondOperand]);

  const handleOperator = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (firstOperand !== null && operator && !waitingForSecondOperand) {
      const result = calculate(firstOperand, operator, inputValue);
      const resultStr = formatNumber(result);
      setDisplayValue(resultStr);
      setFirstOperand(result);
      setExpression(`${resultStr} ${nextOperator}`);
    } else {
      setFirstOperand(inputValue);
      setExpression(`${displayValue} ${nextOperator}`);
    }

    setOperator(nextOperator);
    setWaitingForSecondOperand(true);
  }, [displayValue, firstOperand, operator, waitingForSecondOperand]);

  const handleEquals = useCallback(() => {
    if (firstOperand