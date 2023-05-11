import { db } from "../database/database.connection.js";

export async function createCustomer(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const cpfCheck = await db.query(
      "SELECT cpf FROM customers WHERE cpf = $1",
      [cpf]
    );

    if (cpfCheck.rowCount > 0) {
      return res.status(409).send({ message: "CPF already exists" });
    }

    await db.query(
      "INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)",
      [name, phone, cpf, birthday]
    );

    return res.status(201).send();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export async function getCustomer(req, res) {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM customers WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: "Customer not found" });
    }

    return res.status(200).send(result.rows[0]);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}
