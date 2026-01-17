import "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock ResizeObserver for components that use it
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage for store persistence tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

// Mock crypto.randomUUID for consistent test IDs
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${Math.random().toString(36).substring(7)}`,
});
