import { db } from "../database/database.connection.js";

export async function createRentals(req, res) {
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
      SELECT rentals.*, 
          TO_CHAR(rentals."rentDate", 'yyyy-mm-dd') AS "formattedRentDate",
          customers.name AS "customerName",
          games.name AS "gameName"
      FROM rentals
      JOIN customers ON customers.id = rentals."customerId"
      JOIN games ON games.id = rentals."gameId"
    `);

    const rentalList = result.rows.map((rental) => ({
      id: rental.id,
      customerId: rental.customerId,
      gameId: rental.gameId,
      rentDate: rental.formattedRentDate,
      daysRented: rental.daysRented,
      returnDate: rental.returnDate,
      originalPrice: rental.originalPrice,
      delayFee: rental.delayFee,
      customer: {
        id: rental.customerId,
        name: rental.customerName,
      },
      game: {
        id: rental.gameId,
        name: rental.gameName,
      },
    }));

    return res.send(rentalList);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

export async function updateRentals(req, res) {
  const id = req.params.id;

  try {
    const result = await db.query(
      `
        SELECT
          rentals.*,
          games."pricePerDay" AS "pricePerDay"
        FROM rentals 
        JOIN games ON games.id = rentals."gameId"
        WHERE rentals.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Rent not found");
    }

    const rental = result.rows[0];

    if (rental.returnDate !== null) {
      return res.status(400).send("Lease already finalized");
    }

    const returnDate = new Date();
    const diff = Math.floor(
      (returnDate - new Date(rental.rentDate)) / (1000 * 60 * 60 * 24)
    );
    let delayFee = null;

    if (diff > rental.daysRented) {
      delayFee = (diff - rental.daysRented) * rental.pricePerDay;
    }

    await db.query(
      `
        UPDATE rentals
        SET "returnDate" = $1,
            "delayFee" = $2
        WHERE id = $3
      `,
      [returnDate.toISOString().slice(0, 10), delayFee, id]
    );

    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

export async function deleteRentals(req, res) {
  const id = req.params.id;

  try {
    const result = await db.query(
      `
        SELECT * FROM rentals WHERE id=$1
      `,
      [id]
    );

    if (result.rowCount < 1) {
      return res.status(404).send("Rental not found.");
    }

    if (result.rows[0].returnDate !== null) {
      return res.status(400).send("The rental has already been returned.");
    }

    await db.query(
      `
        DELETE FROM rentals WHERE id=$1
      `,
      [id]
    );

    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err);
  }
}
