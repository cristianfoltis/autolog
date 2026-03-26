-- AddUniqueConstraint
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_plate_userId_key" UNIQUE ("plate", "userId");
