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
    const result = await db.query(`
    SELECT rentals.*, games.name AS game_name, customers.id AS customer_id, customers.name AS customer_name, customers.phone, TO_CHAR(rentals.rentDate::DATE, 'yyyy-mm-dd') AS rentDate
    FROM rentals
    JOIN games ON rentals.gameId = games.id
    JOIN customers ON rentals.customerId = customers.id
    `);

    const rentals = result.rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      gameId: row.gameId,
      rentDate: row.rentDate,
      daysRented: row.daysRented,
      returnDate: row.returnDate,
      originalPrice: row.originalPrice,
      delayFee: row.delayFee,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        phone: row.phone,
      },
      game: {
        id: row.gameId,
        name: row.game_name,
      },
    }));

    return res.status(200).send(rentals);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

export async function updateRental(req, res) {
  const { id } = req.params;

  try {
    const rental = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);

    if (rental.rowCount === 0) {
      return res.status(404).send({ message: 'Rent not found.' });
    }

    if (rental.rows[0].returnDate !== null) {
      return res.status(400).send({ message: 'Lease already completed.' });
    }

    const today = new Date();
    const rentDate = new Date(rental.rows[0].rentDate);
    const daysRented = rental.rows[0].daysRented;
    const pricePerDay = rental.rows[0].originalPrice / daysRented;

    const delayDays = Math.ceil((today - rentDate) / (1000 * 60 * 60 * 24)) - daysRented;
    const delayFee = delayDays > 0 ? Math.round(delayDays * pricePerDay * 100) : 0;

    await db.query(
      'UPDATE rentals SET returnDate = $1, delayFee = $2 WHERE id = $3',
      [today, delayFee, id]
    );

    return res.sendStatus(200);

  } catch (err) {
    return res.status(500).send({ message: err });
  }
}
