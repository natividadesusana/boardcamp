import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.middleware.js";
import gameSchema from "../schemas/games.schemas.js";
import { createGame, getGames } from "../controllers/games.controller.js";

const gamesRouter = Router();

gamesRouter.post("/games", validateSchema(gameSchema), createGame);
gamesRouter.get("/games", getGames);

export default gamesRouter;
