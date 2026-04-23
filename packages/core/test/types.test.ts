import { describe, it, expect } from 'vitest';
import { ValidationError } from '../src/types';

describe('ValidationError', () => {
  it('stores operation name and param', () => {
    const err = new ValidationError('resize', 'w', 'must be 1-16384');
    expect(err.operation).toBe('resize');
    expect(err.param).toBe('w');
    expect(err.message).toBe('must be 1-16384');
    expect(err.name).toBe('ValidationError');
    expect(err).toBeInstanceOf(Error);
  });
});
