import { calculate } from '@/components/Calculator';

describe('calculate', () => {
  it('adds two numbers', () => {
    expect(calculate(2, '+', 3)).toBe(5);
  });

  it('subtracts two numbers', () => {
    expect(calculate(10, '-', 4)).toBe(6);
  });

  it('multiplies two numbers', () => {
    expect(calculate(3, '*', 7)).toBe(21);
  });

  it('divides two numbers', () => {
    expect(calculate(20, '/', 4)).toBe(5);
  });

  it('returns Infinity for division by zero', () => {
    expect(calculate(5, '/', 0)).toBe(Infinity);
  });

  it('handles negative numbers', () => {
    expect(calculate(-3, '+', -7)).toBe(-10);
  });

  it('handles decimal numbers', () => {
    expect(calculate(0.1, '+', 0.2)).toBeCloseTo(0.3);
  });

  it('returns b for unknown operator', () => {
    expect(calculate(5, '^', 3)).toBe(3);
  });

  it('multiplies with zero', () => {
    expect(calculate(0, '*', 100)).toBe(0);
  });

  it('subtracts to negative', () => {
    expect(calculate(3, '-', 10)).toBe(-7);
  });
});