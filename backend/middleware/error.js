const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let error = { ...err };
    error.message = err.message;

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Ressource non trouvée avec l'id : ${err.value}`;
        error = { message, statusCode: 404 };
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Valeur en doublon détectée (ex: email déjà utilisé)';
        error = { message, statusCode: 400 };
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    const statusCode = error.statusCode || res.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: error.message || 'Erreur Serveur',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
