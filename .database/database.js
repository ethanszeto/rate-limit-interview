export class Database {
  static collections = {};

  static createCollection(name) {
    const instance = new Database.Collection(name);
    Database.collections[name] = instance;
    return instance;
  }

  static Collection = class {
    constructor(name = undefined) {
      this.documents = [];
      this.name = name;
      if (name) {
        Database.collections[name] = this;
      }
    }

    async create(doc) {
      const newDoc = { _id: this._generateId(), ...doc };
      this.documents.push(newDoc);
      return { insertedId: newDoc._id };
    }

    async find(query = {}) {
      return this.documents.filter((doc) => this._matchesQuery(doc, query));
    }

    async findOne(query = {}) {
      return this.documents.find((doc) => this._matchesQuery(doc, query)) || null;
    }

    async findOneAndUpdate(filter = {}, update = {}, options = {}) {
      const doc = await this.findOne(filter);
      if (!doc) return options.upsert ? this.create({ ...filter, ...update.$set }) : null;

      Object.assign(doc, update.$set || {});
      return { value: doc };
    }

    async delete(query = {}) {
      const initialLength = this.documents.length;
      this.documents = this.documents.filter((doc) => !this._matchesQuery(doc, query));
      return { deletedCount: initialLength - this.documents.length };
    }

    async exists(query = {}) {
      return (await this.findOne(query)) !== null;
    }

    async countDocuments(query = {}) {
      return (await this.find(query)).length;
    }

    clear() {
      this.documents = [];
    }

    _matchesQuery(doc, query) {
      return Object.entries(query).every(([key, condition]) => {
        const value = doc[key];
        if (typeof condition === "object" && condition !== null) {
          if (condition.$gt !== undefined) return value > condition.$gt;
          if (condition.$lt !== undefined) return value < condition.$lt;
          if (condition.$eq !== undefined) return value === condition.$eq;
          if (condition.$ne !== undefined) return value !== condition.$ne;
          return false;
        }
        return value === condition;
      });
    }

    _generateId() {
      return Math.random().toString(36).substring(2, 10);
    }
  };
}
