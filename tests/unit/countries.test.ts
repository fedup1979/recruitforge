import { describe, it, expect } from 'vitest';
import { countryMap, getCountryDisplay, getCountryName, getCountryFlag } from '../../src/lib/countries';

describe('countryMap', () => {
  it('contains all expected countries', () => {
    const expected = ['MG', 'MA', 'TG', 'SN', 'CI', 'BF', 'NE', 'TN', 'CD', 'CM', 'FR'];
    expected.forEach(code => {
      expect(countryMap[code], `missing ${code}`).toBeDefined();
    });
  });

  it('each country has name, flag, and currency', () => {
    Object.entries(countryMap).forEach(([code, info]) => {
      expect(info.name, `${code} name`).toBeTruthy();
      expect(info.flag, `${code} flag`).toBeTruthy();
      expect(info.currency, `${code} currency`).toBeTruthy();
    });
  });
});

describe('getCountryDisplay', () => {
  it('returns flag + name for known codes', () => {
    const display = getCountryDisplay('MG');
    expect(display).toContain('Madagascar');
  });

  it('returns raw code for unknown codes', () => {
    expect(getCountryDisplay('XX')).toBe('XX');
  });
});

describe('getCountryName', () => {
  it('returns name for known codes', () => {
    expect(getCountryName('MA')).toBe('Maroc');
    expect(getCountryName('FR')).toBe('France');
  });

  it('returns code for unknown codes', () => {
    expect(getCountryName('ZZ')).toBe('ZZ');
  });
});

describe('getCountryFlag', () => {
  it('returns flag for known codes', () => {
    expect(getCountryFlag('MG')).toBeTruthy();
  });

  it('returns empty string for unknown codes', () => {
    expect(getCountryFlag('ZZ')).toBe('');
  });
});
