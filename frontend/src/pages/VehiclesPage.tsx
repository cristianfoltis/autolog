import { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { useDeleteVehicle } from '../hooks/useDeleteVehicle';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleFormModal } from '../components/vehicles/VehicleFormModal';
import type { Vehicle } from '../types/vehicle.types';
import logo from '../assets/final-logo.svg';

function vehicleCountLabel(count: number) {
  return count === 1 ? '1 vehicle' : `${count} vehicles`;
}

export function VehiclesPage() {
  const { user, logout } = useAuth();
  const { data: vehicles = [], isLoading } = useVehicles();
  const { mutate: deleteVehicle } = useDeleteVehicle();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  function handleDelete(vehicle: Vehicle) {
    if (!confirm(`Delete ${vehicle.make.name} ${vehicle.model.name}?`)) return;
    deleteVehicle(vehicle.id, {
      onSuccess: () => toast.success('Vehicle removed'),
      onError: () => toast.error('Failed to delete vehicle'),
    });
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={logo} alt="autolog" className="h-6 invert" />
          <div className="flex items-center gap-4">
            <p className="text-sm text-text-secondary">{user?.name ?? user?.email}</p>
            <button
              onClick={logout}
              className="text-sm text-text-muted hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Vehicles</h1>
            <p className="text-text-secondary text-sm mt-1">
              {vehicles.length === 0 ? 'No vehicles yet' : vehicleCountLabel(vehicles.length)}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add vehicle
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && vehicles.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car size={28} className="text-brand" />
            </div>
            <p className="text-white font-semibold mb-1">No vehicles yet</p>
            <p className="text-text-secondary text-sm mb-6">
              Add your first vehicle to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Add vehicle
            </button>
          </div>
        )}

        {!isLoading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={setEditingVehicle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && <VehicleFormModal onClose={() => setShowAddModal(false)} />}

      {editingVehicle && (
        <VehicleFormModal vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} />
      )}
    </div>
  );
}
