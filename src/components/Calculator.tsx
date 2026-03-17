'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import Display from './Display';
import CalcButton from './Button';
import styles from './Calculator.module.css';

type CalculatorAction =
  | { type: 'DIGIT'; payload: string }
  | { type: 'DECIMAL' }
  | { type: 'OPERATOR'; payload: string }
  | { type: 'EQUALS' }
  | { type: 'CLEAR' }
  | { type: 'BACKSPACE' }
  | { type: 'PERCENT' }
  | { type: 'TOGGLE_SIGN' };

interface CalculatorState {
  display: string;
  expression: string;
  previousValue: string;
  operator: string | null;
  waitingForOperand: boolean;
  justCalculated: boolean;
}

const MAX_DISPLAY_LENGTH = 12;

const initialState: CalculatorState = {
  display: '0',
  expression: '',
  previousValue: '',
  operator: null,
  waitingForOperand: false,
  justCalculated: false,
};

function formatResult(num: number): string {
  if (!isFinite(num)) return 'Error';
  if (isNaN(num)) return 'Error';

  // Handle very large or very small numbers
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    const exp = num.toExponential(6);
    return exp.length > MAX_DISPLAY_LENGTH ? num.toExponential(3) : exp;
  }

  const str = num.toString();
  if (str.includes('.')) {
    const parts = str.split('.');
    const intPart = parts[0];
    const decPart = parts[1];
    const availableDecimals = MAX_DISPLAY_LENGTH - intPart.length - 1;
    if (availableDecimals <= 0) return intPart;
    return parseFloat(num.toFixed(availableDecimals)).toString();
  }

  return str.length > MAX_DISPLAY_LENGTH ? num.toExponential(3) : str;
}

function calculate(a: number, op: string, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) return Infinity;
      return a / b;
    default:
      return b;
  }
}

function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case 'CLEAR':
      return { ...initialState };

    case 'DIGIT': {
      const digit = action.payload;

      if (state.display === 'Error') {
        return {
          ...state,
          display: digit,
          expression: '',
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.waitingForOperand) {
        return {
          ...state,
          display: digit,
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.justCalculated) {
        return {
          ...state,
          display: digit,
          expression: '',
          previousValue: '',
          operator: null,
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.display === '0' && digit !== '.') {
        return { ...state, display: digit };
      }

      if (state.display.replace('-', '').length >= MAX_DISPLAY_LENGTH) {
        return state;
      }

      return {
        ...state,
        display: state.display + digit,
      };
    }

    case 'DECIMAL': {
      if (state.display === 'Error') {
        return {
          ...state,
          display: '0.',
          expression: '',
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.waitingForOperand) {
        return {
          ...state,
          display: '0.',
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.justCalculated) {
        return {
          ...state,
          display: '0.',
          expression: '',
          previousValue: '',
          operator: null,
          waitingForOperand: false,
          justCalculated: false,
        };
      }

      if (state.display.includes('.')) return state;

      if (state.display.replace('-', '').length >= MAX_DISPLAY_LENGTH) return state;

      return {
        ...state,
        display: state.display + '.',
      };
    }

    case 'OPERATOR': {
      const op = action.payload;

      if (state.display === 'Error') return state;

      const currentValue = parseFloat(state.display);

      if (state.previousValue !== '' && !state.waitingForOperand && state.operator) {
        const prev = parseFloat(state.previousValue);
        const result = calculate(prev, state.operator, currentValue);
        const resultStr = formatResult(result);

        return {
          ...state,
          display: resultStr,
          expression: resultStr + ' ' + op,
          previousValue: resultStr === 'Error' ? '' : resultStr,
          operator: op,
          waitingForOperand: true,
          justCalculated: false,
        };
      }

      return {
        ...state,
        expression: state.display + ' ' + op,
        previousValue: state.display,
        operator: op,
        waitingForOperand: true,
        justCalculated: false,
      };
    }

    case 'EQUALS': {
      if (state.display === 'Error') return { ...initialState };

      if (state.operator === null || state.previousValue === '') {
        return {
          ...state,
          expression: state.display + ' =',
          justCalculated: true,
        };
      }

      const prev = parseFloat(state.previousValue);
      const current = parseFloat(state.display);
      const result = calculate(prev, state.operator, current);
      const resultStr = formatResult(result);

      return {
        ...state,
        display: resultStr,
        expression: state.previousValue + ' ' + state.operator + ' ' + state.display + ' =',
        previousValue: '',
        operator: null,
        waitingForOperand: false,
        justCalculated: true,
      };
    }

    case 'BACKSPACE': {
      if (state.display === 'Error') return { ...initialState };
      if (state.waitingForOperand) return state;
      if (state.justCalculated) return { ...initialState };

      if (state.display.length <= 1 || state.display === '-0') {
        return { ...state, display: '0' };
      }

      const newDisplay = state.display.slice(0, -1);
      return {
        ...state,
        display: newDisplay === '-' ? '0' : newDisplay,
      };
    }

    case 'PERCENT': {
      if (state.display === 'Error') return state;

      const current = parseFloat(state.display);
      let result: number;

      if (state.previousValue !== '' && state.operator) {
        const prev = parseFloat(state.previousValue);
        if (state.operator === '+' || state.operator === '-') {
          result = prev * (current / 100);
        } else {
          result = current / 100;
        }
      } else {
        result = current / 100;
      }

      const resultStr = formatResult(result);
      return {
        ...state,
        display: resultStr,
        justCalculated: false,
      };
    }

    case 'TOGGLE_SIGN': {
      if (state.display === 'Error' || state.display === '0') return state;
      if (state.display.startsWith('-')) {
        return { ...state, display: state.display.slice(1) };
      }
      return { ...state, display: '-' + state.display };
    }

    default:
      return state;
  }
}

const Calculator: React.FC = () => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.key >= '0' && e.key <= '9') {
        dispatch({ type: 'DIGIT', payload: e.key });
      } else if (e.key === '.') {
        dispatch({ type: 'DECIMAL' });
      } else if (e.key === '+') {
        dispatch({ type: 'OPERATOR', payload: '+' });
      } else if (e.key === '-') {
        dispatch({ type: 'OPERATOR', payload: '-' });
      } else if (e.key === '*') {
        dispatch({ type: 'OPERATOR', payload: '×' });
      } else if (e.key === '/') {
        dispatch({ type: 'OPERATOR', payload: '÷' });
      } else if (e.key === 'Enter' || e.key === '=') {
        dispatch({ type: 'EQUALS' });
      } else if (e.key === 'Backspace') {
        dispatch({ type: 'BACKSPACE' });
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        dispatch({ type: 'CLEAR' });
      } else if (e.key === '%') {
        dispatch({ type: 'PERCENT' });
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttons = [
    { label: 'C', type: 'special' as const, action: () => dispatch({ type: 'CLEAR' }) },
    { label: '+/-', type: 'special' as const, action: () => dispatch({ type: 'TOGGLE_SIGN' }) },
    { label: '%', type: 'special' as const, action: () => dispatch({ type: 'PERCENT' }) },
    { label: '÷', type: 'operator' as const, action: () => dispatch({ type: 'OPERATOR', payload: '÷' }) },

    { label: '7', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '7' }) },
    { label: '8', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '8' }) },
    { label: '9', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '9' }) },
    { label: '×', type: 'operator' as const, action: () => dispatch({ type: 'OPERATOR', payload: '×' }) },

    { label: '4', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '4' }) },
    { label: '5', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '5' }) },
    { label: '6', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '6' }) },
    { label: '-', type: 'operator' as const, action: () => dispatch({ type: 'OPERATOR', payload: '-' }) },

    { label: '1', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '1' }) },
    { label: '2', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '2' }) },
    { label: '3', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '3' }) },
    { label: '+', type: 'operator' as const, action: () => dispatch({ type: 'OPERATOR', payload: '+' }) },

    { label: '⌫', type: 'special' as const, action: () => dispatch({ type: 'BACKSPACE' }) },
    { label: '0', type: 'digit' as const, action: () => dispatch({ type: 'DIGIT', payload: '0' }) },
    { label: '.', type: 'digit' as const, action: () => dispatch({ type: 'DECIMAL' }) },
    { label: '=', type: 'equals' as const, action: () => dispatch({ type: 'EQUALS' }) },
  ];

  const activeOperator = state.waitingForOperand ? state.operator : null;

  return (
    <div className={styles.calculator}>
      <Display
        value={state.display}
        expression={state.expression}
      />
      <div className={styles.keypad}>
        {buttons.map((btn, idx) => (
          <CalcButton
            key={idx}
            label={btn.label}
            type={btn.type}
            onClick={btn.action}
            isActive={btn.type === 'operator' && btn.label === activeOperator}
          />
        ))}
      </div>
    </div>
  );
};

export default Calculator;
