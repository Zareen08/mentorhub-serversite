export class QueryBuilder {
    model;
    query;
    searchableFields;
    filterableFields;
    whereClause = { isDeleted: false };
    includeClause = {};
    orderByClause = [];
    pageNum = 1;
    limitNum = 10;
    constructor(model, query, opts) {
        this.model = model;
        this.query = query;
        this.searchableFields = opts.searchableFields;
        this.filterableFields = opts.filterableFields;
    }
    search() {
        if (this.query.searchTerm && this.searchableFields.length) {
            this.whereClause.OR = this.searchableFields.map(f => ({ [f]: { contains: this.query.searchTerm, mode: "insensitive" } }));
        }
        return this;
    }
    filter() {
        this.filterableFields.forEach(field => {
            if (this.query[field] !== undefined)
                this.whereClause[field] = this.query[field];
        });
        return this;
    }
    sort() {
        const { sortBy = "createdAt", sortOrder = "desc" } = this.query;
        this.orderByClause = [{ [sortBy]: sortOrder }];
        return this;
    }
    paginate() {
        this.pageNum = Number(this.query.page) || 1;
        this.limitNum = Number(this.query.limit) || 10;
        return this;
    }
    async execute() {
        const skip = (this.pageNum - 1) * this.limitNum;
        const [data, total] = await Promise.all([
            this.model.findMany({ where: this.whereClause, include: Object.keys(this.includeClause).length ? this.includeClause : undefined, orderBy: this.orderByClause, skip, take: this.limitNum }),
            this.model.count({ where: this.whereClause }),
        ]);
        return { data, meta: { page: this.pageNum, limit: this.limitNum, total, totalPages: Math.ceil(total / this.limitNum) } };
    }
    addWhere(clause) { Object.assign(this.whereClause, clause); return this; }
    addInclude(clause) { Object.assign(this.includeClause, clause); return this; }
}
