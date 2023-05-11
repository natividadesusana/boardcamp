import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import customerSchema from "../schemas/customers.schemas.js";
import { createCustomer } from "../controllers/customers.controller.js";
import { getCustomer } from "../controllers/customers.controller.js";

const customersRouter = Router();

customersRouter.post("/customers", validateSchema(customerSchema), createCustomer);
customersRouter.get("/customers", getCustomer);

export default customersRouter;
