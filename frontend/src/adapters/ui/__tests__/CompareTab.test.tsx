import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompareTab from '../CompareTab';

// Mock fetch
global.fetch = vi.fn();

describe('CompareTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <BrowserRouter>
        <CompareTab />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('should render comparison data', async () => {
    const mockData = [
      {
        routeId: 'R002',
        baseline: { ghg_intensity: 91.0, route_id: 'R001' },
        comparison: { ghg_intensity: 88.0, route_id: 'R002' },
        percentDiff: -3.3,
        compliant: true,
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <BrowserRouter>
        <CompareTab />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('R002')).toBeTruthy();
    });
  });

  it('should display error message on fetch failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <CompareTab />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeTruthy();
    });
  });
});

