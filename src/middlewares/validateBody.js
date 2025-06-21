const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Validation error",
        data: error.details.map(e => e.message),
      });
    }
    next();
  };
};

export default validateBody;
