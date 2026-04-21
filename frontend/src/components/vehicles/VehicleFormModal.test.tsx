import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/render-with-providers';
import { VehicleFormModal } from './VehicleFormModal';
import type { Vehicle } from '../../types/vehicle.types';

vi.mock('../../hooks/useCreateVehicle', () => ({ useCreateVehicle: vi.fn() }));
vi.mock('../../hooks/useUpdateVehicle', () => ({ useUpdateVehicle: vi.fn() }));
vi.mock('../../hooks/useMakes', () => ({ useMakes: vi.fn() }));
vi.mock('../../hooks/useModels', () => ({ useModels: vi.fn() }));
vi.mock('../../hooks/useVinLookup', () => ({ useVinLookup: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), warning: vi.fn() } }));

import { useCreateVehicle } from '../../hooks/useCreateVehicle';
import { useUpdateVehicle } from '../../hooks/useUpdateVehicle';
import { useMakes } from '../../hooks/useMakes';
import { useModels } from '../../hooks/useModels';
import { useVinLookup } from '../../hooks/useVinLookup';
import * as sonner from 'sonner';

const mockMakes = [
  { id: 1, name: 'Audi' },
  { id: 2, name: 'BMW' },
];

const mockModels = [{ id: 1, name: 'A4' }];

const mockVehicle: Vehicle = {
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
  vi.mocked(useMakes).mockReturnValue({ data: mockMakes } as any);
  vi.mocked(useModels).mockReturnValue({ data: mockModels } as any);
  vi.mocked(useVinLookup).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
});

describe('VehicleFormModal', () => {
  it('renders "Add vehicle" title in add mode', () => {
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument();
  });

  it('renders "Edit vehicle" title in edit mode', () => {
    renderWithProviders(<VehicleFormModal vehicle={mockVehicle} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Edit vehicle' })).toBeInTheDocument();
  });

  it('pre-populates fields from vehicle in edit mode', () => {
    renderWithProviders(<VehicleFormModal vehicle={mockVehicle} onClose={vi.fn()} />);
    expect(screen.getByDisplayValue('B-123-ABC')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
  });

  it('renders make options from useMakes', () => {
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'Audi' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'BMW' })).toBeInTheDocument();
  });

  it('resets modelId when make selection changes', () => {
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: '1' } });
    expect(screen.getByLabelText('Model')).toHaveValue('');
  });

  it('changes model select value when model is selected', () => {
    renderWithProviders(<VehicleFormModal vehicle={mockVehicle} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: '1' } });
    expect(screen.getByLabelText('Model')).toHaveValue('1');
  });

  it('calls create mutate on valid add form submit', async () => {
    const mutate = vi.fn();
    vi.mocked(useCreateVehicle).mockReturnValue({ mutate, isPending: false, error: null } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('Plate'), { target: { value: 'B-123-ABC' } });
    fireEvent.change(screen.getByLabelText('Mileage'), { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
  });

  it('calls update mutate on valid edit form submit', async () => {
    const mutate = vi.fn();
    vi.mocked(useUpdateVehicle).mockReturnValue({ mutate, isPending: false, error: null } as any);

    renderWithProviders(<VehicleFormModal vehicle={mockVehicle} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'v-1' }),
        expect.any(Object),
      );
    });
  });

  it('disables submit button while pending', () => {
    vi.mocked(useCreateVehicle).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeDisabled();
  });

  it('shows fallback error message when API call fails', () => {
    vi.mocked(useCreateVehicle).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error('unexpected'),
    } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);

    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('calls onClose when backdrop button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<VehicleFormModal onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<VehicleFormModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state on the Lookup button while looking up', () => {
    vi.mocked(useVinLookup).mockReturnValue({ mutate: vi.fn(), isPending: true } as any);
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /lookup vin/i })).toBeDisabled();
    expect(screen.getByText('Looking up…')).toBeInTheDocument();
  });

  it('Lookup button is disabled when VIN is shorter than 17 characters', () => {
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('1HGBH41JXMN109186'), {
      target: { value: 'SHORT' },
    });
    expect(screen.getByRole('button', { name: /lookup vin/i })).toBeDisabled();
  });

  it('Lookup button is enabled when VIN is exactly 17 characters', () => {
    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('1HGBH41JXMN109186'), {
      target: { value: 'VSSZZZ5FZGR117755' },
    });
    expect(screen.getByRole('button', { name: /lookup vin/i })).toBeEnabled();
  });

  it('fills year, make, and model and shows success toast on full VIN match', async () => {
    const mutate = vi
      .fn()
      .mockImplementation((_vin: string, { onSuccess }: { onSuccess: (r: object) => void }) =>
        onSuccess({ year: 2016, makeId: 1, makeName: 'Audi', modelId: 1, modelName: 'A4' }),
      );
    vi.mocked(useVinLookup).mockReturnValue({ mutate, isPending: false } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('1HGBH41JXMN109186'), {
      target: { value: 'VSSZZZ5FZGR117755' },
    });
    fireEvent.click(screen.getByRole('button', { name: /lookup vin/i }));

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Found: Audi A4 (2016)');
    });
  });

  it('fills year and make and shows warning toast on partial VIN match', async () => {
    const mutate = vi
      .fn()
      .mockImplementation((_vin: string, { onSuccess }: { onSuccess: (r: object) => void }) =>
        onSuccess({ year: 2016, makeId: 1, makeName: 'Audi', modelId: null, modelName: null }),
      );
    vi.mocked(useVinLookup).mockReturnValue({ mutate, isPending: false } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('1HGBH41JXMN109186'), {
      target: { value: 'VSSZZZ5FZGR117755' },
    });
    fireEvent.click(screen.getByRole('button', { name: /lookup vin/i }));

    await waitFor(() => {
      expect(sonner.toast.warning).toHaveBeenCalledWith(
        'Found: Audi (2016). Please select the model.',
      );
    });
  });

  it('shows warning toast when VIN lookup finds no match', async () => {
    const mutate = vi
      .fn()
      .mockImplementation((_vin: string, { onError }: { onError: () => void }) => onError());
    vi.mocked(useVinLookup).mockReturnValue({ mutate, isPending: false } as any);

    renderWithProviders(<VehicleFormModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('1HGBH41JXMN109186'), {
      target: { value: 'VSSZZZ5FZGR117755' },
    });
    fireEvent.click(screen.getByRole('button', { name: /lookup vin/i }));

    await waitFor(() => {
      expect(sonner.toast.warning).toHaveBeenCalledWith(
        'VIN not recognised. Please fill in the details manually.',
      );
    });
  });

  it('calls toast.success and onClose on successful create', async () => {
    const onClose = vi.fn();
    const mutate = vi
      .fn()
      .mockImplementation((_data: unknown, { onSuccess }: { onSuccess: () => void }) =>
        onSuccess(),
      );
    vi.mocked(useCreateVehicle).mockReturnValue({ mutate, isPending: false, error: null } as any);

    renderWithProviders(<VehicleFormModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('Plate'), { target: { value: 'B-123-ABC' } });
    fireEvent.change(screen.getByLabelText('Mileage'), { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Vehicle added');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls toast.success and onClose on successful edit', async () => {
    const onClose = vi.fn();
    const mutate = vi
      .fn()
      .mockImplementation((_data: unknown, { onSuccess }: { onSuccess: () => void }) =>
        onSuccess(),
      );
    vi.mocked(useUpdateVehicle).mockReturnValue({ mutate, isPending: false, error: null } as any);

    renderWithProviders(<VehicleFormModal vehicle={mockVehicle} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Vehicle updated');
      expect(onClose).toHaveBeenCalled();
    });
  });
});
