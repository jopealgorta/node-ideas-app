const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

const ideaRouter = require('./routes/ideaRoutes');
const userRouter = require('./routes/userRoutes');
const messageRouter = require('./routes/messageRoutes');

const authController = require('./controllers/authController');

const app = express();

app.enable('trust proxy'); // Enable heroku proxy to handle requests properly

// Security HTTP Headers
app.use(helmet());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));
app.use(cors());
app.options('*', cors());

// Limit requests from the same IP
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request for this IP, please try again in a hour!'
});

app.use('/api', limiter); // Limit only API routes

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // si te ponen una query que siempre de true, por ejemplo
// Data sanitization against XSS (Cross Site Scripting)
app.use(xss()); // Si te ponen html dentro de una query

app.use(compression());

// 2) ROUTES

app.use('/api/users', userRouter);
app.use('/api/ideas', ideaRouter);
app.use('/api/messages', messageRouter);

app.get(/.*/, authController.protect, (req, res, next) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `La URL: ${req.originalUrl} no se encuentra en el servidor`
    });
});

module.exports = app;
