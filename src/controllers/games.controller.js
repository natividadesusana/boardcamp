import { db } from "../database/database.connection.js";

export async function createGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;

  if (!name) {
    return res.status(400).send({ message: "Field 'name' is required" });
  }

  if (stockTotal <= 0 || pricePerDay <= 0) {
    return res
      .status(400)
      .send({ message: "stockTotal and pricePerDay must be greater than 0" });
  } else if (stockTotal < 0) {
    return res
      .status(400)
      .send({ message: "stockTotal must be greater than or equal to 0" });
  }

  try {
    const result = await db.query(`SELECT * FROM games WHERE name = $1`, [
      name,
    ]);
    if (result.rows.length > 0) {
      return res.status(409).send({ message: "Game already exists" });
    }

    await db.query(
      `INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4)`,
      [name, image, stockTotal, pricePerDay]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

export async function getGames(req, res) {
  try {
    const result = await db.query(`SELECT * FROM games`);

    return res.status(200).send(result.rows);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}
