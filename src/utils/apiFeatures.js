class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    // Create a shallow copy
    const queryObj = { ...this.reqQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    // Replace operators (gte, gt, lte, lt) with MongoDB format ($gte, $gt, etc.)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      // Convert (sort=price,-rating) to .sort('price -rating')
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Newest first
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // If nothing is specified, hides __v, a Mongoose internal version key
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // Page to return, if page=5 means return products from page 5 only
    const page = parseInt(this.reqQuery.page, 10) || 1;
    // Number of products per page, if limit=20 means 20 products on each page
    const limit = parseInt(this.reqQuery.limit, 10) || 20;
    // Number of products to skip, if page=5 skips products from first 4 pages
    const skip = (page - 1) * limit;

    // Prevent users from requesting too many items in one page
    const maxLimit = 50;
    const safeLimit = Math.min(limit, maxLimit);

    this.query = this.query.skip(skip).limit(safeLimit);
    return this;
  }
}

export default APIFeatures;
