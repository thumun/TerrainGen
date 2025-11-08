// Mock ResizeObserver (somehow it's not in JSDom already...)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
