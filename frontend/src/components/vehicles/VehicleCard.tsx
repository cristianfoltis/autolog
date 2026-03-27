import { Car, Pencil, Trash2 } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle.types';

interface Props {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
            <Car size={20} className="text-brand" />
          </div>
          <div>
            <p className="font-semibold text-white">
              {vehicle.make.name} {vehicle.model.name}
            </p>
            <p className="text-sm text-text-muted">{vehicle.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Edit vehicle"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="p-1.5 text-text-muted hover:text-error transition-colors rounded-lg hover:bg-white/10"
            aria-label="Delete vehicle"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide">Plate</p>
          <p className="text-white text-sm font-medium mt-0.5">{vehicle.plate}</p>
        </div>
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wide">Mileage</p>
          <p className="text-white text-sm font-medium mt-0.5">
            {vehicle.mileage.toLocaleString()} {vehicle.mileageUnit}
          </p>
        </div>
        {vehicle.vin && (
          <div className="col-span-2">
            <p className="text-text-muted text-xs uppercase tracking-wide">VIN</p>
            <p className="text-white font-mono text-xs mt-0.5 truncate">{vehicle.vin}</p>
          </div>
        )}
      </div>
    </div>
  );
}
