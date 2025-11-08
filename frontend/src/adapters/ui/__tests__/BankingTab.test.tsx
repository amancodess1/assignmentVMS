import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BankingTab from '../BankingTab';

global.fetch = vi.fn();

describe('BankingTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render compliance balance section', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cb: 10000, cb_before: 10000 }),
    });

    render(
      <BrowserRouter>
        <BankingTab />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/compliance balance/i)).toBeTruthy();
    });
  });

  it('should display CB value', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cb: 10000, cb_before: 10000 }),
    });

    render(
      <BrowserRouter>
        <BankingTab />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/10000/i)).toBeTruthy();
    });
  });

  it('should have bank surplus button', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cb: 10000, cb_before: 10000 }),
    });

    render(
      <BrowserRouter>
        <BankingTab />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/bank surplus/i)).toBeTruthy();
    });
  });
});

