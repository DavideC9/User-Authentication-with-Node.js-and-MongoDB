const mongoose = require('mongoose');

// Definizione dello schema per il RefreshToken
const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Riferimento al modello User (se esiste)
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '14d' // Token scade dopo 14 giorni
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);;