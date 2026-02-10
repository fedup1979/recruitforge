import { describe, it, expect } from 'vitest';
import {
  statusLabels,
  getStatusInfo,
  getStepIndex,
  getProgressPercentage,
  pipelineSteps,
  stepLabels,
} from '../../src/lib/status';

describe('statusLabels', () => {
  it('has all 7 statuses', () => {
    const expected = ['pending', 'testing', 'review', 'interview', 'hired', 'rejected', 'pool'];
    expected.forEach(s => {
      expect(statusLabels[s], `missing ${s}`).toBeDefined();
    });
  });

  it('each status has label and class', () => {
    Object.entries(statusLabels).forEach(([key, info]) => {
      expect(info.label, `${key} label`).toBeTruthy();
      expect(info.class, `${key} class`).toMatch(/^badge-/);
    });
  });
});

describe('getStatusInfo', () => {
  it('returns correct info for known statuses', () => {
    expect(getStatusInfo('hired').label).toBe('Embauché');
    expect(getStatusInfo('rejected').class).toBe('badge-error');
  });

  it('returns fallback for unknown statuses', () => {
    const info = getStatusInfo('unknown_status');
    expect(info.label).toBe('unknown_status');
    expect(info.class).toBe('badge-ghost');
  });
});

describe('pipelineSteps', () => {
  it('has 5 steps', () => {
    expect(pipelineSteps).toHaveLength(5);
  });

  it('has matching step labels', () => {
    expect(stepLabels).toHaveLength(pipelineSteps.length);
  });
});

describe('getStepIndex', () => {
  it('returns 0 for pending', () => {
    expect(getStepIndex('pending')).toBe(0);
  });

  it('returns 1 for testing', () => {
    expect(getStepIndex('testing')).toBe(1);
  });

  it('returns 4 for terminal statuses', () => {
    expect(getStepIndex('hired')).toBe(4);
    expect(getStepIndex('rejected')).toBe(4);
    expect(getStepIndex('pool')).toBe(4);
  });

  it('returns 0 for unknown status', () => {
    expect(getStepIndex('unknown')).toBe(0);
  });
});

describe('getProgressPercentage', () => {
  it('returns 20% for pending (step 0)', () => {
    expect(getProgressPercentage('pending')).toBe(20);
  });

  it('returns 40% for testing (step 1)', () => {
    expect(getProgressPercentage('testing')).toBe(40);
  });

  it('returns 100% for hired (step 4)', () => {
    expect(getProgressPercentage('hired')).toBe(100);
  });

  it('returns 100% for rejected (step 4)', () => {
    expect(getProgressPercentage('rejected')).toBe(100);
  });
});
