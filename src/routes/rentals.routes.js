import { Router } from 'express';
import { createRental } from '../controllers/rentalsController.js';
import validateSchema from '../middlewares/validateSchema.middleware.js'
import rentalSchema from '../schemas/rentals.schemas.js'

const rentalsRouter = Router();

rentalsRouter.post('/rentals', validateSchema(rentalSchema), createRental);

export default rentalsRouter;