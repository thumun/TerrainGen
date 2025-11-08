import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import Editor from '../index';

describe('Editor', () => {
  test('renders title', () => {
    render(<Editor />);
    expect(screen.getByText('TerrainGen')).toBeDefined();
  });
});
