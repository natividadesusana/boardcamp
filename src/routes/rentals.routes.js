import { Router } from 'express';
import { createRental, getRentals } from '../controllers/rentals.controller.js';
import validateSchema from '../middlewares/validateSchema.middleware.js'
import rentalSchema from '../schemas/rentals.schemas.js'

const rentalsRouter = Router();

rentalsRouter.post('/rentals', validateSchema(rentalSchema), createRental);
rentalsRouter.get("/rentals", getRentals)

export default rentalsRouter;