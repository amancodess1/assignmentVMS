import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RoutesTab from '../RoutesTab'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

describe('RoutesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(
      <BrowserRouter>
        <RoutesTab />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Routes')).toBeTruthy()
  })

  it('displays loading state', () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <BrowserRouter>
        <RoutesTab />
      </BrowserRouter>
    )

    expect(screen.getByText(/loading/i)).toBeTruthy()
  })

  it('displays routes data', async () => {
    const mockRoutes = [
      {
        id: 1,
        route_id: 'R001',
        vessel_type: 'Container',
        fuel_type: 'HFO',
        year: 2024,
        ghg_intensity: 91.0,
        fuel_consumption: 5000,
        distance_km: 12000,
        total_emissions: 4500,
        is_baseline: true,
      },
    ]

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoutes,
    })

    render(
      <BrowserRouter>
        <RoutesTab />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeTruthy()
    })
  })

  it('filters routes by vessel type', async () => {
    const mockRoutes = [
      {
        id: 1,
        route_id: 'R001',
        vessel_type: 'Container',
        fuel_type: 'HFO',
        year: 2024,
        ghg_intensity: 91.0,
        fuel_consumption: 5000,
        distance_km: 12000,
        total_emissions: 4500,
        is_baseline: false,
      },
      {
        id: 2,
        route_id: 'R002',
        vessel_type: 'Tanker',
        fuel_type: 'LNG',
        year: 2024,
        ghg_intensity: 88.0,
        fuel_consumption: 4800,
        distance_km: 11500,
        total_emissions: 4200,
        is_baseline: false,
      },
    ]

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoutes,
    })

    render(
      <BrowserRouter>
        <RoutesTab />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeTruthy()
    })

    const vesselTypeSelect = screen.getByLabelText(/vessel type/i)
    fireEvent.change(vesselTypeSelect, { target: { value: 'Container' } })

    await waitFor(() => {
      expect(screen.getByText('R001')).toBeTruthy()
      expect(screen.queryByText('R002')).toBeFalsy()
    })
  })

  it('displays error message on fetch failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(
      <BrowserRouter>
        <RoutesTab />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeTruthy()
    })
  })
})
