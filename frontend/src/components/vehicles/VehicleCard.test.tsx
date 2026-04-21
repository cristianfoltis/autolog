import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/render-with-providers';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '../../types/vehicle.types';

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

describe('VehicleCard', () => {
  it('renders make, model, year, plate, and mileage', () => {
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Audi A4')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('B-123-ABC')).toBeInTheDocument();
    expect(screen.getByText('50,000 km')).toBeInTheDocument();
  });

  it('does not render VIN row when vin is null', () => {
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByText('VIN')).not.toBeInTheDocument();
  });

  it('renders VIN when present', () => {
    const vehicle = { ...mockVehicle, vin: '1HGBH41JXMN109186' };
    renderWithProviders(<VehicleCard vehicle={vehicle} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('1HGBH41JXMN109186')).toBeInTheDocument();
  });

  it('calls onEdit with vehicle when edit button is clicked', () => {
    const onEdit = vi.fn();
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Edit vehicle'));
    expect(onEdit).toHaveBeenCalledWith(mockVehicle);
  });

  it('calls onDelete with vehicle when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderWithProviders(<VehicleCard vehicle={mockVehicle} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Delete vehicle'));
    expect(onDelete).toHaveBeenCalledWith(mockVehicle);
  });
});
