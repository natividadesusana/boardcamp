import { db } from "../database/database.connection.js";

export async function createRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  if (!Number.isInteger(daysRented) || daysRented <= 0) {
    return res.sendStatus(400);
  }

  try {
    const customerData = await db.query(
      "SELECT * FROM customers WHERE id = $1",
      [customerId]
    );
    if (customerData.rowCount === 0) {
      return res.sendStatus(400);
    }

    const gameData = await db.query("SELECT * FROM games WHERE id = $1", [
      gameId,
    ]);
    if (gameData.rowCount === 0) {
      return res.sendStatus(400);
    }

    const { stockTotal, pricePerDay } = gameData.rows[0];

    const gameRentals = await db.query(
      'SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL',
      [gameId]
    );
    if (gameRentals.rowCount >= stockTotal) {
      return res.status(400).send("All units already rented");
    }

    const rentDate = new Date().toISOString().slice(0, 10);
    const originalPrice = pricePerDay * daysRented;

    const rentalData = [
      customerId,
      gameId,
      rentDate,
      daysRented,
      null, 
      originalPrice,
      null, 
    ];

    await db.query(
      `
      INSERT INTO rentals (
        "customerId",
        "gameId",
        "rentDate",
        "daysRented",
        "returnDate",
        "originalPrice",
        "delayFee"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      rentalData
    );

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

export async function getRentals(req, res) {
  try {
    const result = await db.query(`SELECT rentals.*, games.*, customers.*, TO_CHAR(rentals.rentDate::DATE, 'yyyy-mm-dd') AS rentDate
    FROM rentals
    JOIN games ON rentals.gameId = games.id
    JOIN customers ON rentals.customerId = customers.id
    WHERE rentals.id = $1
    `);

    return res.status(200).send(result.rows);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}