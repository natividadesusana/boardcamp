import { db } from "../database/database.connection.js";

export async function createRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    const customer = await db.query("SELECT * FROM customers WHERE id = $1", [customerId]);
    const game = await db.query("SELECT * FROM games WHERE id = $1", [gameId]);

    if (customer.rows.length === 0 || game.rows.length === 0) {
      return res.status(400).send({ message: "Client or game not found" });
    }

    if (daysRented <= 0) {
      return res.status(400).send({ message: "daysRented deve ser maior que 0" });
    }

    const rentalDate = new Date();
    const gamePrice = game.rows[0].pricePerDay;
    const originalPrice = daysRented * gamePrice;

    const returnDate = null;
    const delayFee = null;

    const rentedGames = await db.query("SELECT COUNT(*) FROM rentals WHERE gameId = $1 AND returnDate IS NULL", [gameId]);
    const availableGames = game.rows[0].stockTotal - rentedGames.rows[0].count;

    if (availableGames < 1) {
      return res.status(400).send({ message: "There are no games available for rent" });
    }

    await db.query(
      "INSERT INTO rentals (customerId, gameId, rentDate, returnDate, daysRented, originalPrice, delayFee) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [customerId, gameId, rentalDate, returnDate, daysRented, originalPrice, delayFee]
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}


