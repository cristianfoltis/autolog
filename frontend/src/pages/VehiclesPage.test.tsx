import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/render-with-providers';
import { VehiclesPage } from './VehiclesPage';

vi.mock('../hooks/useVehicles', () => ({ useVehicles: vi.fn() }));
vi.mock('../hooks/useDeleteVehicle', () => ({ useDeleteVehicle: vi.fn() }));
vi.mock('../hooks/useCreateVehicle', () => ({ useCreateVehicle: vi.fn() }));
vi.mock('../hooks/useUpdateVehicle', () => ({ useUpdateVehicle: vi.fn() }));
vi.mock('../hooks/useMakes', () => ({ useMakes: vi.fn() }));
vi.mock('../hooks/useModels', () => ({ useModels: vi.fn() }));
vi.mock('../hooks/useVinLookup', () => ({ useVinLookup: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/AuthContext')>();
  return { ...actual, useAuth: vi.fn() };
});

import { useVehicles } from '../hooks/useVehicles';
import { useDeleteVehicle } from '../hooks/useDeleteVehicle';
import { useCreateVehicle } from '../hooks/useCreateVehicle';
import { useUpdateVehicle } from '../hooks/useUpdateVehicle';
import { useMakes } from '../hooks/useMakes';
import { useModels } from '../hooks/useModels';
import { useAuth } from '../context/AuthContext';
import { useVinLookup } from '../hooks/useVinLookup';
import * as sonner from 'sonner';

const mockUser = { id: 'u-1', email: 'test@test.com', name: 'Test User' };

const mockVehicle = {
  id: 'v-1',
  plate: 'B-123-ABC',
  year: 2020,
  vin: null,
  mileage: 50000,
  mileageUnit: 'km',
  make: { id: 1, name: 'Audi' },
  model: { id: 1, name: 'A4' },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser as any,
    token: 'tok',
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  });
  vi.mocked(useDeleteVehicle).mockReturnValue({ mutate: vi.fn() } as any);
  vi.mocked(useCreateVehicle).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as any);
  vi.mocked(useUpdateVehicle).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as any);
  vi.mocked(useMakes).mockReturnValue({ data: [], isLoading: false } as any);
  vi.mocked(useModels).mockReturnValue({ data: [], isLoading: false } as any);
  vi.mocked(useVinLookup).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
});

describe('VehiclesPage', () => {
  it('shows loading spinner while fetching', () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: true } as any);
    renderWithProviders(<VehiclesPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no vehicles', () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);
    expect(screen.getByText('Add your first vehicle to get started.')).toBeInTheDocument();
  });

  it('renders vehicle cards when vehicles exist', () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);
    expect(screen.getByText('Audi A4')).toBeInTheDocument();
    expect(screen.getByText('1 vehicle')).toBeInTheDocument();
  });

  it('shows plural label for multiple vehicles', () => {
    vi.mocked(useVehicles).mockReturnValue({
      data: [mockVehicle, mockVehicle],
      isLoading: false,
    } as any);
    renderWithProviders(<VehiclesPage />);
    expect(screen.getByText('2 vehicles')).toBeInTheDocument();
  });

  it('opens add modal when Add vehicle button is clicked', async () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    fireEvent.click(screen.getAllByText('Add vehicle')[0]);

    await waitFor(() => {
      expect(screen.getByText('Add vehicle', { selector: 'h2' })).toBeInTheDocument();
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    fireEvent.click(screen.getByLabelText('Edit vehicle'));

    await waitFor(() => {
      expect(screen.getByText('Edit vehicle', { selector: 'h2' })).toBeInTheDocument();
    });
  });

  it('opens add modal from empty state button', async () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    // index 1 = empty state button (index 0 = header button)
    const buttons = screen.getAllByRole('button', { name: 'Add vehicle' });
    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument();
    });
  });

  it('calls deleteVehicle when confirmed', () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteVehicle).mockReturnValue({ mutate } as any);
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    renderWithProviders(<VehiclesPage />);
    fireEvent.click(screen.getByLabelText('Delete vehicle'));

    expect(mutate).toHaveBeenCalledWith('v-1', expect.any(Object));
  });

  it('does not call deleteVehicle when cancelled', () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteVehicle).mockReturnValue({ mutate } as any);
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    renderWithProviders(<VehiclesPage />);
    fireEvent.click(screen.getByLabelText('Delete vehicle'));

    expect(mutate).not.toHaveBeenCalled();
  });

  it('closes add modal when onClose is called', async () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    fireEvent.click(screen.getAllByText('Add vehicle')[0]);
    await waitFor(() => screen.getByRole('button', { name: 'Close' }));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByText('Add vehicle', { selector: 'h2' })).not.toBeInTheDocument();
    });
  });

  it('calls toast.success after successful delete', () => {
    const mutate = vi
      .fn()
      .mockImplementation((_id: string, { onSuccess }: { onSuccess: () => void }) => onSuccess());
    vi.mocked(useDeleteVehicle).mockReturnValue({ mutate } as any);
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    renderWithProviders(<VehiclesPage />);
    fireEvent.click(screen.getByLabelText('Delete vehicle'));

    expect(sonner.toast.success).toHaveBeenCalledWith('Vehicle removed');
  });

  it('calls toast.error after failed delete', () => {
    const mutate = vi
      .fn()
      .mockImplementation((_id: string, { onError }: { onError: () => void }) => onError());
    vi.mocked(useDeleteVehicle).mockReturnValue({ mutate } as any);
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    renderWithProviders(<VehiclesPage />);
    fireEvent.click(screen.getByLabelText('Delete vehicle'));

    expect(sonner.toast.error).toHaveBeenCalledWith('Failed to delete vehicle');
  });

  it('closes edit modal when onClose is called', async () => {
    vi.mocked(useVehicles).mockReturnValue({ data: [mockVehicle], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    fireEvent.click(screen.getByLabelText('Edit vehicle'));
    await waitFor(() => screen.getByRole('heading', { name: 'Edit vehicle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Edit vehicle' })).not.toBeInTheDocument();
    });
  });

  it('falls back to email when user has no name', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u-1', email: 'test@test.com', name: null } as any,
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('calls logout when Sign out is clicked', () => {
    const logout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      token: 'tok',
      login: vi.fn(),
      logout,
      isAuthenticated: true,
    });
    vi.mocked(useVehicles).mockReturnValue({ data: [], isLoading: false } as any);
    renderWithProviders(<VehiclesPage />);

    fireEvent.click(screen.getByText('Sign out'));
    expect(logout).toHaveBeenCalled();
  });
});
