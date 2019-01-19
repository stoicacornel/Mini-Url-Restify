const errors = require('restify-errors');
const UrlEntry = require('../models/UrlEntry');
const ShortURLLogic = require('../short_url_logic');

module.exports = server => {

    // Get All our Database entries
    server.get('/url_entries', async (req, res, next) => {
        try {
            const allDbEntries = await UrlEntry.find({});
            // When we get all the entries we DO NOT update the lastDateAccessed property of URls
            res.send(allDbEntries);
            next();
        } catch (err) {
            return next(new errors.InvalidContentError(err));
        }
    });

    // Add Entry to our Database
    // Ex. of Payload:: { "originalURL": "YOUR_URL_HERE" }
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

        customName = customName ? customName.replace(/[^a-zA-Z0-9]+/g, "-") : null;
        let customNameEntryAlreadyExists = false;

        while (idAlreadyExists) {
            // Generate our random-ish ID
            let randomIdOrCustomId = customName ? ShortURLLogic.decodeShortURL(customName) : new Date().getTime() + '' + Math.round(Math.random() * Math.pow(10, 3));

            // TODO: Also check here if the original URL is already present in the Database so we
            // TODO: won't insert duplicates
            // Check the Database for an Entry with that ID
            const entryInDatabase = await UrlEntry.findById(randomIdOrCustomId)
                .then((success) => {
                    if (success) {
                        // If we don't use a custom name to generate the ID, we just re-initiate the process of getting
                        // a random ID and try again. This happens automatically while idAlreadyExists = true

                        // If we use a custom name to generate the ID and the Entry already exists:
                        if (customName) {
                            // We send a response (to the Front-End) informing the user of the customName conflict
                            let responseBody = {
                                error: 409,
                                text: "The custom name is already taken. We recommend using letter and numbers."
                            };

                            res.send(409, responseBody);
                            // We put idAlreadyExists as false here to finish the loop but the ID is already in the Database
                            idAlreadyExists = false;
                            customNameEntryAlreadyExists = true;
                        }
                    } else {
                        idAlreadyExists = false;
                        randomIdGenerated = randomIdOrCustomId;
                    }
                }, (error) => {
                    console.log("Error");
                    console.log(error);
                    // idAlreadyExists = false;
                    // randomIdGenerated = randomId;
                })
                .catch((error) => {
                    console.log(error);

                    // If it doesn't exists, save the ID and move forward
                    idAlreadyExists = false;
                    randomIdGenerated = randomIdOrCustomId;
                });
        }

        // If there already is an identical Custom Name Entry in the DB, this variable will be true.
        // In that case, teh response message ahs already been dealt with in the above loop on success.
        if (!customNameEntryAlreadyExists) {
            let dateCreated = new Date().getTime();

            // Create the Entry
            const urlEntry = new UrlEntry({
                _id: randomIdGenerated,
                originalURL: originalURL,
                // Generate the miniURL from our random-ish id if there is not a customName
                miniURL: customName ? customName : ShortURLLogic.encodeOriginalURL(randomIdGenerated),
                customName: customName,
                dateCreated: dateCreated,
                dateUpdated: dateCreated,
                lastDateAccessed: dateCreated
            });

            // Save to DB
            try {
                const newUrlEntry = await urlEntry.save();
                res.send(201);
                next();
            } catch (err) {
                return next(new errors.InternalError(err.message));
            }
        }
    });

    // Get Entry by ID
    server.get('/url_entries/:id', async (req, res, next) => {
        try {
            const urlEntry = await UrlEntry.findById(req.params.id);
            urlEntry.lastDateAccessed = new Date().getTime();

            res.send(urlEntry);
            next(async () => {
                await urlEntry.save();
            });
        } catch (err) {
            return next(
                new errors.ResourceNotFoundError(
                    `There is no Entry with the id of ${req.params.id}`
                )
            );
        }
    });

    // Get OriginalURL by MiniURL
    server.get('/mini/:miniURL', async (req, res, next) => {
        try {
            // Decode our miniURL
            let id = ShortURLLogic.decodeShortURL(req.params.miniURL);

            // And find the Entry object based on the decoded ID
            const urlEntry = await UrlEntry.findById(id);

            // Here we return the whole Entry (strip the other properties if we don't need them)
            urlEntry.lastDateAccessed = new Date().getTime();

            res.send(urlEntry);
            next(async () => {
                await urlEntry.save();
            });
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
        let updateDate = new Date().getTime();

        req.body["dateUpdated"] = updateDate;
        req.body["lastDateAccessed"] = updateDate;

        try {
            // If you are sending just a property, it will keep the rest of the properties intact
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

    });

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
