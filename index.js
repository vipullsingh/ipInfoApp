// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const dotenv = require('dotenv');
const ipInfoRoutes = require('./routes/ipInfoRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch((err) => {
  logger.error(err.message);
  process.exit(1);
});

// Connect to Redis
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

// Set up session middleware with Redis store
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Set up security middleware with Helmet
app.use(helmet());

// Set up rate limiter middleware with Express Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
});
app.use(limiter);

// Set up CORS middleware with CORS
app.use(cors());

// Set up middleware to parse JSON requests
app.use(express.json());

// Register API routes
app.use('/api/v1/ip-info', ipInfoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Set up error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
