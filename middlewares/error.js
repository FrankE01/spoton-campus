const handleErrors = (err, req, res, next) => {
  res.setHeader("Content-Type", "application/json");

  const error = {
    message: err.message,
    status: err.status || 500,
  };

  res.status(error.status).send(JSON.stringify(error));
};

module.exports = handleErrors;
