import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Database } from "./.database/database.js";

/*
RequestLog contains objects of shape:
  {
    _id: MongoID,
    userId: string,
    timestamp: Date,
  }
*/
export const RequestLog = Database.createCollection("RequestLog");
/* Database Functions Available:
    Collection.find(query)
    Collection.findOne(query)
    Collection.create(doc)
    Collection.findOneAndUpdate(query, updates, options)
    Collection.delete(query)
    Collection.exists(query)
    Collection.countDocuments(query)
*/

//////////////////////////
/* Rate-Limit Middlware */
//////////////////////////

/**
 * Middleware that should limit the amount of
 * requests to any endpoint to 10 per second,
 * and no more.
 *
 * @TODO Fix this incorrect implementation of the
 * Express Rate Limit Middleware.
 *
 * There are 7 key improvements to make:
 * - Some are bug fixes
 * - Some are architectural optimizations
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
async function rateLimit(req, res, next) {
  const now = Date.now();
  const cutoff = now - 1000;

  await RequestLog.create({ userId: req.body.user_id, timestamp: now });

  const recent = await RequestLog.find({
    userId: req.body.user_id,
    timestamp: { $gt: cutoff },
  });

  if (recent.length > 10) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  next();
}

////////////////////////////
/* Mock Endpoint Resolver */
///////////////////////////

/**
 * Handles the Request
 * Mock Resolution
 *
 * @param {Request} req
 * @param {Response} res
 */
async function handleRequest(req, res) {
  res.status(200).json({ message: "Endpoint Hit" });
}

////////////////////////
/* Endpoint Defintion */
////////////////////////

const router = express.Router();
router.route("/request").post(rateLimit, handleRequest);

///////////////////////////////
/* Express Server Definition */
///////////////////////////////

const server = express();

server.use(cors());
server.use(helmet());
server.use(express.json());
server.use("/", router);

export default server;
