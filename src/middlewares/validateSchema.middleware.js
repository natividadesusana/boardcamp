export default function validateSchema(schema) {
  return (req, res, next) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Field 'name' is required" });
    }

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
      const errors = validation.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }

    next();
  };
}
