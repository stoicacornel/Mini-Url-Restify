module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 4040,
    URL: process.env.BASE_URL || 'http://localhost:4040',
    // TODO: Replace
    // MONGODB_URI: process.env.MONGODB_URI || 'mongodb://<dbuser>:<dbpassword>@<your_mongoDB_URI>'
};