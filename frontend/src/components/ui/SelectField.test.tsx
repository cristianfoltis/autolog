import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render-with-providers';
import { SelectField } from './SelectField';

describe('SelectField', () => {
  it('renders label and options', () => {
    renderWithProviders(
      <SelectField id="test" label="Make">
        <option value="1">Audi</option>
        <option value="2">BMW</option>
      </SelectField>,
    );

    expect(screen.getByLabelText('Make')).toBeInTheDocument();
    expect(screen.getByText('Audi')).toBeInTheDocument();
    expect(screen.getByText('BMW')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    renderWithProviders(
      <SelectField id="test" label="Make" error="Please select a make">
        <option value="">Select</option>
      </SelectField>,
    );

    expect(screen.getByText('Please select a make')).toBeInTheDocument();
  });

  it('applies error border when error is present', () => {
    renderWithProviders(
      <SelectField id="test" label="Make" error="Required">
        <option value="">Select</option>
      </SelectField>,
    );

    expect(screen.getByLabelText('Make')).toHaveClass('border-error');
  });

  it('is disabled when disabled prop is passed', () => {
    renderWithProviders(
      <SelectField id="test" label="Model" disabled>
        <option value="">Select</option>
      </SelectField>,
    );

    expect(screen.getByLabelText('Model')).toBeDisabled();
  });
});
