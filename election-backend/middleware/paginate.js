const paginate = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  req.pagination = {
    skip: (page - 1) * limit,
    limit,
    page
  };
  next();
};

module.exports = paginate;
