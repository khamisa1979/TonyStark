import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSlug,
  formatBookmark,
  loadBookmarks,
  normalizeUrl,
} from '../src/lib/bookmarks.ts';

test('normalizes URLs with and without an https scheme to the same value', () => {
  assert.equal(normalizeUrl('example.com/docs'), normalizeUrl('https://example.com/docs'));
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  const invalidValues = [
    null,
    '',
    '{not valid json',
    JSON.stringify({ url: 'https://example.com', slug: 'mona-1' }),
    JSON.stringify(['legacy value', { url: 'https://example.com' }]),
  ];

  for (const value of invalidValues) {
    assert.doesNotThrow(() => loadBookmarks(value));
    assert.deepEqual(loadBookmarks(value), []);
  }
});

test('filters malformed entries while loading valid bookmarks', () => {
  const value = JSON.stringify([
    { url: 'example.com', slug: 'mona-1' },
    { url: 'javascript:alert(1)', slug: 'mona-2' },
    { url: 'https://example.org', slug: '' },
  ]);

  assert.deepEqual(loadBookmarks(value), [
    { url: 'https://example.com/', slug: 'mona-1' },
  ]);
});

test('formats a saved bookmark with the exact separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://example.com/', slug: createSlug(123) }),
    'https://example.com/ :: mona-1Z',
  );
});
