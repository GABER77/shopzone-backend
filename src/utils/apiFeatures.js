class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    // Create a shallow copy to avoid mutating original query
    const queryObj = { ...this.reqQuery };

    // Fields to exclude from filtering since they are handled separately
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'searchText'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    // Replace operators (gte, gt, lte, lt) with MongoDB format ($gte, $gt, etc.)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let finalFilter = JSON.parse(queryStr);

    // >>>>> Handle search - a special case of filtering >>>>>

    // Removes whitespace from the start and end of the string
    const searchText = this.reqQuery.searchText?.trim();
    if (searchText) {
      // Create a case-insensitive regex(Regular Expression) from searchText
      const searchRegex = new RegExp(searchText, 'i');

      // Combine existing filters AND search with $and operator
      finalFilter = {
        $and: [
          finalFilter, // Existing filters (e.g. category, price)
          {
            $or: [
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
            ],
          },
        ],
      };
    }

    // Apply the final combined filter to the mongoose query
    this.query = this.query.find(finalFilter);

    // Return 'this' to allow chaining with other APIFeatures methods like sort, paginate
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
