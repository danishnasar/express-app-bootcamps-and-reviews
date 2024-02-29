const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config({ path: './config/.env' });
connectDB();
const bootcamp = require('./routes/bootcamp');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
//const logger = require('./middleware/logger');
const limiter = rateLimit({
    windowLimit: 10 * 60 * 1000,
    max: 100
})

const app = express();

//Body parser
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());
app.use(fileupload());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    server.close(() => process.exit(1));
})