// __tests__/authController.test.js

import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import { signup, login, logout } from '../../controllers/authController.js';
import { createUser, getUserByEmail } from '../../models/authModel.js';
import { generateToken } from '../../utils/jwt.js';

// Mock de l'application Express
const app = express();
app.use(express.json());
app.post('/signup', signup);
app.post('/login', login);
app.post('/logout', logout);

// Mock des fonctions de modèle et du JWT
jest.mock('../../models/authModel.js');
jest.mock('bcrypt');
jest.mock('../../utils/jwt');

describe('Auth Controller', () => {
    
    describe('Inscription', () => {
        it('Inscription réussie', async () => {
            const User = {
                name: 'Test',
                surname: 'Test',
                email: 'test@gmail.com',
                password: '123',
                isBotanist: false
            };
            
            bcrypt.hash.mockResolvedValue('mdp');
            createUser.mockImplementation((name, surname, email, hashedPassword, botanistValue, callback) => {
                callback(null, 1); // Simuler l'insertion réussie avec ID 1
            });

            const res = await request(app)
                .post('/signup')
                .send(User)
                .expect(200);

            expect(res.body).toEqual({ message: 'Inscription réussie', userId: 1 });
            expect(createUser).toHaveBeenCalledWith(User.name, User.surname, User.email, 'mdp', 0, expect.any(Function));
        });

        it('Erreur lors de l\'inscription', async () => {
            const User = {
                name: 'Test',
                surname: 'Test',
                email: 'test@gmail.com',
                password: '123',
                isBotanist: true
            };

            bcrypt.hash.mockResolvedValue('mdp');
            createUser.mockImplementation((name, surname, email, hashedPassword, botanistValue, callback) => {
                callback(new Error('Insertion error')); // Simuler une erreur d'insertion
            });

            const res = await request(app)
                .post('/signup')
                .send(User)
                .expect(500);

            expect(res.body).toEqual({ error: 'Erreur lors de l\'insertion dans la base de données', details: 'Insertion error' });
        });
    });

    describe('Connexion', () => {
        it('Connexion réussie', async () => {
            const user = {
                email: 'test@gmail.com',
                password: '123'
            };

            const foundUser = {
                Code_Utilisateurs: 1,
                password: 'mdp'
            };

            getUserByEmail.mockImplementation((email, callback) => {
                callback(null, foundUser); // Simuler un utilisateur trouvé
            });

            bcrypt.compare.mockResolvedValue(true);
            generateToken.mockReturnValue('Token');

            const res = await request(app)
                .post('/login')
                .send(user)
                .expect(200);

            expect(res.body).toEqual({ token: 'Token' });
            expect(getUserByEmail).toHaveBeenCalledWith(user.email, expect.any(Function));
            expect(bcrypt.compare).toHaveBeenCalledWith(user.password, foundUser.password);
            expect(generateToken).toHaveBeenCalledWith(foundUser.Code_Utilisateurs);
        });

        it('Utilisateur non trouvé', async () => {
            const user = {
                email: 'test@gmail.com',
                password: '123'
            };

            getUserByEmail.mockImplementation((email, callback) => {
                callback(null, null); // Simuler qu'aucun utilisateur n'est trouvé
            });

            const res = await request(app)
                .post('/login')
                .send(user)
                .expect(400);

            expect(res.body).toEqual({ error: 'Email ou mot de passe incorrect' });
        });

        it('Mot de passe incorrect', async () => {
            const user = {
                email: 'test@gmail.com',
                password: '123'
            };

            const foundUser = {
                Code_Utilisateurs: 1,
                password: 'mdp'
            };

            getUserByEmail.mockImplementation((email, callback) => {
                callback(null, foundUser); // Simuler un utilisateur trouvé
            });

            bcrypt.compare.mockResolvedValue(false); // Simuler un mot de passe incorrect

            const res = await request(app)
                .post('/login')
                .send(user)
                .expect(400);

            expect(res.body).toEqual({ error: 'Email ou mot de passe incorrect' });
        });
    });

    describe('Déconnexion', () => {
        it('Déconnexion réussie', async () => {
            const res = await request(app)
                .post('/logout')
                .expect(200);

            expect(res.body).toEqual({ message: 'Déconnexion réussie' });
        });
    });
});
