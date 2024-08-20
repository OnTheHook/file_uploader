// errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console

  res.status(err.status || 500);
  res.render("error", {
    message: "Something went wrong!",
    status: err.status || 500,
    user: req.user,
  });
};

module.exports = errorHandler;
