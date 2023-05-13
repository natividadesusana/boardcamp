import { Router } from "express";
import { createRental, getRentals, updateRental } from "../controllers/rentals.controller.js";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import rentalSchema from "../schemas/rentals.schemas.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", validateSchema(rentalSchema), createRental);
rentalsRouter.post("/rentals/:id/return", updateRental);

export default rentalsRouter;
