const errors = require('restify-errors');
const UrlEntry = require('../models/UrlEntry');

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

    // Add Entry to our Database
    server.post('/url_entries', async (req, res, next) => {

        // Check for JSON
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }
        // TODO: Here change the functionality

        // Get the Entry properties from the Front End / Postman
        const { originalURL, miniURL, customName } = req.body;

        // Create the Entry
        const urlEntry = new UrlEntry({
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

    // Delete Customer
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
