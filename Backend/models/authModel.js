const { db } = require('../config/db');

const createUser = (name, surname, email, hashedPassword, botanistValue, callback) => {
    const query = `INSERT INTO Utilisateurs (Nom, Prenom, Email, Password, Botaniste) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, surname, email, hashedPassword, botanistValue], function (err) {
        callback(err, this.lastID);
    });
};

const getUserByEmail = (email, callback) => {
    const query = `SELECT * FROM Utilisateurs WHERE Email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
};

module.exports = {
    createUser,
    getUserByEmail
};
