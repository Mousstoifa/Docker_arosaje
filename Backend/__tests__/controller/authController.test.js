import { createUser, getUserByEmail } from '../../models/authModel';
import { generateToken } from '../../utils/jwt';
import { signup, login, logout } from '../../controllers/authController';
import { jest, expect, describe, test, it, beforeAll, beforeEach } from '@jest/globals';
//import { dbTest, setupDatabase, teardownDatabase } from '../../config/dbTest';
import axios from 'axios';

const bcrypt = require('bcrypt')
jest.mock('bcrypt');
jest.mock('../../models/authModel');
jest.mock('../../utils/jwt')

describe('Test de la fonction signup', () => {
    let req;
    let res;
    beforeEach(() => {
        req = {
            body: {
                name: "Test",
                surname: "Test",
                email: "test@gmail.com",
                password: "1234",
                isBotanist: false
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    })

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Inscrption réussi', async () => {
        bcrypt.hash.mockResolvedValue('mdp')
        createUser.mockImplementation((name, surname, email, hashedPassword, botanistValue, callback) => {
            callback(null, 1);
        });

        await signup(req, res);
        expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
        expect(createUser).toHaveBeenCalledWith('Test', 'Test', 'test@gmail.com', 'mdp', 0, expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Inscription réussie', userId: 1 });
    });

    test('Erreur dans la BDD', async () => {
        bcrypt.hash.mockResolvedValue('mdp');
        createUser.mockImplementation((name, surname, email, hashedPassword, botanistValue, callback) => {
            callback(new Error('Database insertion error'), null);
        });

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Erreur lors de l'insertion dans la base de données",
            details: 'Database insertion error'
        });
    });

    test('Erreur hash mot de passe', async () => {
        bcrypt.hash.mockRejectedValue(new Error('Erreur hachage'));

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erreur lors de l\'inscription',
            details: 'Erreur hachage'
        });
    });
})

describe('Test de la fonction login', () => {
    let req;
    let res;
    beforeEach(() => {
        req = {
            body: {
                email: "test@gmail.com",
                password: "1234",
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    })

    afterEach(() => {
        jest.resetAllMocks();
    });
    
    test('Connexion réussie', async () => {
        const user = { Code_Utilisateurs: 1, password: 'mdp' };

        getUserByEmail.mockImplementation((email, callback) => {callback(null, user)})
        bcrypt.compare.mockResolvedValue(true);
        generateToken.mockReturnValue('token génerer');

        await login(req, res)

        expect(getUserByEmail).toHaveBeenCalledWith('test@gmail.com', expect.any(Function))
        expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'mdp');
        expect(generateToken).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'token génerer' });
    })

    test('Erreur de base de données', async () => {
        getUserByEmail.mockImplementation((email, callback) => callback(new Error('DB error'), null));
        
        await login(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erreur lors de la connexion à la base de données',
            details: 'DB error',
        });
    });

    test('Utilisateur non trouvé', async () => {
        getUserByEmail.mockImplementation((email, callback) => callback(null, null));
        
        await login(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });

    test('Mot de passe incorrect', async () => {
        const user = { Code_Utilisateurs: 1, password: 'mdp' };
        getUserByEmail.mockImplementation((email, callback) => callback(null, user));
        bcrypt.compare.mockResolvedValue(false);
        
        await login(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });

    test('Erreur lors de la comparaison du mot de passe', async () => {
        const user = { Code_Utilisateurs: 1, password: 'mdp' };
        getUserByEmail.mockImplementation((email, callback) => callback(null, user));
        bcrypt.compare.mockRejectedValue(new Error('Erreur hachage'));
        
        await login(req, res);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Erreur lors de la comparaison du mot de passe',
            details: 'Erreur hachage',
        });
    });
})

describe('Test de la fonction logout', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Déconnexion réussie', () => {
        logout(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie' });
    });
});