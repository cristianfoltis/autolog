export interface Make {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  year: number;
  vin: string | null;
  mileage: number;
  mileageUnit: string;
  make: Make;
  model: Model;
  createdAt: string;
  updatedAt: string;
}
