import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import customerSchema from "../schemas/customers.schemas.js";
import { createCustomer, getCustomer, getCustomerById } from "../controllers/customers.controller.js";

const customersRouter = Router();

customersRouter.post("/customers", validateSchema(customerSchema), createCustomer);
customersRouter.get("/customers", getCustomer);
customersRouter.get("/customers/:id", getCustomerById);
customersRouter.put('/customers/:id', validateSchema(customerSchema), updateCustomer);

export default customersRouter;
