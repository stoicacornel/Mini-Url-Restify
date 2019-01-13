const errors = require('restify-errors');
const UrlEntry = require('../models/UrlEntry');
const ShortURLLogic = require('../short_url_logic');

module.exports = server => {

    // Get All our Database entries
    server.get('/url_entries', async (req, res, next) => {
        try {
            const allDbEntries = await UrlEntry.find({});
            res.send(allDbEntries);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    // TODO: Add a timestamp property. This will be modified every time the miniURL is decoded on GET /mini/:miniURL
    // TODO: The timestamp will be sued for Database clean-up if URL hasn't been accessed in X minutes/days/months/years TBD
    // Add Entry to our Database
    // Ex. of Payload:: { "originalURL": "https://www.youtube.com/watch?v=9bZkp7q19f0" }
    server.post('/url_entries', async (req, res, next) => {

        // Check for JSON
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }

        // Get the Entry properties from the Front End / Postman
        // 'customName' is an artifact here because the functionality is not yet implemented
        let { originalURL, customName } = req.body;

        let idAlreadyExists = true;
        let randomIdGenerated = 0;

        while (idAlreadyExists) {
            // Generat our random-ish ID
            let randomId = new Date().getTime() + '' + Math.round(Math.random() * Math.pow(10, 3));

            // TODO: Also check here if the original URL is already present in the Database so we
            // TODO: won't insert duplicates
            // Check the Database for an Entry with that ID
            const entryInDatabase = await UrlEntry.findById(randomId)
                .then((success) => {
                    res.send(entryInDatabase);
                }, (error) => {
                    console.log("Error");
                    console.log(error);
                    // idAlreadyExists = false;
                    // randomIdGenerated = randomId;
                })
                .catch((error) => {
                    // If it doesn't exists, save the ID and move forward
                    idAlreadyExists = false;
                    randomIdGenerated = randomId;
                });
        }

        // Generate the miniURL from our random-ish id
        let miniURL = ShortURLLogic.encodeOriginalURL(randomIdGenerated);

        // Create the Entry
        const urlEntry = new UrlEntry({
            _id: randomIdGenerated,
            originalURL,
            miniURL,
            customName
        });

        // Save to DB
        try {
            const newUrlEntry = await urlEntry.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });

    // Get Entry by ID
    server.get('/url_entries/:id', async (req, res, next) => {
        try {
            const urlEntry = await UrlEntry.findById(req.params.id);
            miniURL = ShortURLLogic.decodeShortURL(urlEntry.miniURL);

            res.send(urlEntry);
            next();
        } catch (err) {
            return next(
                new errors.ResourceNotFoundError(
                    `There is no Entry with the id of ${req.params.id}`
                )
            );
        }
    });

    // TODO: Implement a Database clean-up based on the last time the url has been accessed (decoded)
    // TODO: Implement the customName functionality in the future
    // Get OriginalURL by MiniURL
    server.get('/mini/:miniURL', async (req, res, next) => {
        try {
            // Decode our miniURL
            let id = ShortURLLogic.decodeShortURL(req.params.miniURL);

            // And find the Entry object based on the decoded ID
            const urlEntry = await UrlEntry.findById(id);

            // Here we return the whole Entry (strip the other properties if we don't need them)
            res.send(urlEntry);
            next();
        } catch (err) {
            return next(
                new errors.ResourceNotFoundError(
                    `There is no Entry with the id of ${req.params.id}`
                )
            );
        }
    });

    // Update Entry
    server.put('/url_entries/:id', async (req, res, next) => {
            // Check for JSON
            if (!req.is('application/json')) {
                return next(
                    new errors.InvalidContentError("Expects 'application/json'")
                );
            }

            try {
                // If you are sending just a property, it will keep the rest of th properties intact
                const urlEntry = await UrlEntry.findOneAndUpdate(
                    { _id: req.params.id },
                    req.body
                );
                res.send(200);
                next();
            } catch (err) {
                return next(
                    new errors.ResourceNotFoundError(
                        `There is no Entry with the id of ${req.params.id}`
                    )
                );
            }
        }
    );

    // TODO: Implement a Database clean-up based on the last time the url has been accessed (decoded)
    // Delete Entry
    server.del('/url_entries/:id', async (req, res, next) => {
        try {
            const urlEntry = await UrlEntry.findOneAndRemove({
                _id: req.params.id
            });
            res.send(204);
            next();
        } catch (err) {
            return next(
                new errors.ResourceNotFoundError(
                    `There is no Entry with the id of ${req.params.id}`
                )
            );
        }
    });
};
