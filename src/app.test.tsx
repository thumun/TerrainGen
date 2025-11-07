import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import App from './app.tsx';

describe('App', () => {
  test('renders', () => {
    render(<App />);
    expect(screen.getByText('Learn React')).toBeDefined();
  });
});
