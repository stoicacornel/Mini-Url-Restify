const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');
const UrlEntry = require('./models/UrlEntry');

const server = restify.createServer();
let dbCleanUpInterval = null;


server.use(restify.plugins.bodyParser());

server.listen(config.PORT, () => {
    mongoose.set('useFindAndModify', false);
    mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
});

const db = mongoose.connection;

db.on('error', (err) => console.log(err));

db.once('open', () => {
    require('./routes/url_request')(server);
    console.log(`Server started on port ${ config.PORT }`);
});

DBCleanUp = () => {
    clearInterval(dbCleanUpInterval);
    dbCleanUpInterval = setInterval(async () => {
        const allDbEntries = await UrlEntry.find({});
        const timestampNow = new Date().getTime();

        for (let urlDBEntry of allDbEntries) {
            if (!urlDBEntry.lastDateAccessed) {
                // URL Entry does not have the lastDateAccessed property (will occur while testing). Purge
                await UrlEntry.findOneAndRemove({
                    _id: urlDBEntry._id
                });
            } else {
                if (urlDBEntry.lastDateAccessed + config.MINI_URL_EXPIRATION_TIME < timestampNow) {
                    // Entry expired. Purge
                    await UrlEntry.findOneAndRemove({
                        _id: urlDBEntry._id
                    });
                }
            }
        }

        // If you want the DBCleanUp function to trigger only once, on server start-up:
        StopDBCleanUp();
    }, config.INTERVAL_DB_CLEANUP);
};

StopDBCleanUp = () => {
    clearInterval(dbCleanUpInterval);
};

// Disable the DBCleanUp functionality by commenting this:
DBCleanUp();

// Export as desired
module.exports = StopDBCleanUp;
