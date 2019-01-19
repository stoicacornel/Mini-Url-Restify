module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 4040,
    URL: process.env.BASE_URL || 'http://localhost:4040',
    INTERVAL_DB_CLEANUP: 3 * 60 * 60 * 1000, // 3 hours
    MINI_URL_EXPIRATION_TIME: 24 * 60 * 60 * 1000, // 24 hours
    // TODO: Replace
    // MONGODB_URI: process.env.MONGODB_URI || 'mongodb://<dbuser>:<dbpassword>@<your_mongoDB_URI>'
};