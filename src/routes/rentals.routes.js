import { Router } from "express";
import { createRentals, getRentals, updateRentals, deleteRentals } from "../controllers/rentals.controller.js";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import rentalSchema from "../schemas/rentals.schemas.js";

const rentalsRouter = Router();

rentalsRouter.post("/rentals", validateSchema(rentalSchema), createRentals);
rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals/:id/return", updateRentals);
rentalsRouter.delete('/rentals/:id', deleteRentals);

export default rentalsRouter;
