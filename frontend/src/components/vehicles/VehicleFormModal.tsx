import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { vehicleSchema } from '../../schemas/vehicle.schema';
import type { VehicleFormData } from '../../schemas/vehicle.schema';
import type { Vehicle } from '../../types/vehicle.types';
import { useCreateVehicle } from '../../hooks/useCreateVehicle';
import { useUpdateVehicle } from '../../hooks/useUpdateVehicle';
import { useMakes } from '../../hooks/useMakes';
import { useModels } from '../../hooks/useModels';
import { useVinLookup } from '../../hooks/useVinLookup';
import { FormField } from '../ui/FormField';
import { SelectField } from '../ui/SelectField';
import { Button } from '../ui/Button';
import { getApiErrorMessage } from '../../utils/api-error';

interface Props {
  readonly vehicle?: Vehicle;
  readonly onClose: () => void;
}

export function VehicleFormModal({ vehicle, onClose }: Props) {
  const isEdit = vehicle !== undefined;
  const { mutate: create, isPending: creating, error: createError } = useCreateVehicle();
  const { mutate: update, isPending: updating, error: updateError } = useUpdateVehicle();
  const isPending = creating || updating;
  const apiError = createError ?? updateError;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          makeId: vehicle.make.id,
          modelId: vehicle.model.id,
          year: vehicle.year,
          plate: vehicle.plate,
          vin: vehicle.vin ?? undefined,
          mileage: vehicle.mileage,
          mileageUnit: vehicle.mileageUnit as 'km' | 'mi',
        }
      : { mileageUnit: 'km' },
  });

  const makeId = watch('makeId');
  const vin = watch('vin');
  const { data: makes = [] } = useMakes();
  const { data: models = [] } = useModels(makeId ? Number(makeId) : null);
  const { mutate: lookupVin, isPending: lookingUp } = useVinLookup();

  function handleVinLookup() {
    if (!vin || vin.length !== 17) return;
    lookupVin(vin, {
      onSuccess: (result) => {
        setValue('year', result.year);
        setValue('makeId', result.makeId);
        setValue('modelId', result.modelId ?? 0);
        if (result.modelId) {
          toast.success(`Found: ${result.makeName} ${result.modelName} (${result.year})`);
        } else {
          toast.warning(`Found: ${result.makeName} (${result.year}). Please select the model.`);
        }
      },
      onError: () => {
        toast.warning('VIN not recognised. Please fill in the details manually.');
      },
    });
  }

  function onSubmit(data: VehicleFormData) {
    if (isEdit) {
      update(
        { id: vehicle.id, data },
        {
          onSuccess: () => {
            toast.success('Vehicle updated');
            onClose();
          },
        },
      );
    } else {
      create(data, {
        onSuccess: () => {
          toast.success('Vehicle added');
          onClose();
        },
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative bg-white text-text-primary rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              {isEdit ? 'Edit vehicle' : 'Add vehicle'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Controller
              name="makeId"
              control={control}
              render={({ field }) => (
                <SelectField
                  id="makeId"
                  label="Make"
                  error={errors.makeId?.message}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    setValue('modelId', 0);
                  }}
                >
                  <option value="">Select make</option>
                  {makes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </SelectField>
              )}
            />

            <Controller
              name="modelId"
              control={control}
              render={({ field }) => (
                <SelectField
                  id="modelId"
                  label="Model"
                  error={errors.modelId?.message}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={!makeId || Number(makeId) === 0}
                >
                  <option value="">Select model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </SelectField>
              )}
            />

            <FormField
              id="year"
              label="Year"
              type="number"
              placeholder="2020"
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
            />

            <FormField
              id="plate"
              label="Plate"
              placeholder="B-123-ABC"
              error={errors.plate?.message}
              {...register('plate')}
            />

            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-text-secondary mb-1">
                VIN (optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="vin"
                  placeholder="1HGBH41JXMN109186"
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/50 ${
                    errors.vin ? 'border-error' : 'border-border'
                  }`}
                  {...register('vin')}
                />
                <button
                  type="button"
                  onClick={handleVinLookup}
                  disabled={!vin || vin.length !== 17 || lookingUp}
                  aria-label="Lookup VIN"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Search size={14} className={lookingUp ? 'animate-spin' : ''} />
                  {lookingUp ? 'Looking up…' : 'Lookup'}
                </button>
              </div>
              {errors.vin && <p className="text-xs text-error mt-1">{errors.vin.message}</p>}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <FormField
                  id="mileage"
                  label="Mileage"
                  type="number"
                  placeholder="50000"
                  error={errors.mileage?.message}
                  {...register('mileage', { valueAsNumber: true })}
                />
              </div>
              <div className="w-24">
                <Controller
                  name="mileageUnit"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      id="mileageUnit"
                      label="Unit"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="km">km</option>
                      <option value="mi">mi</option>
                    </SelectField>
                  )}
                />
              </div>
            </div>

            {apiError && (
              <p className="text-sm text-error">
                {getApiErrorMessage(apiError, 'Something went wrong. Please try again.')}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                {isEdit ? 'Save changes' : 'Add vehicle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
