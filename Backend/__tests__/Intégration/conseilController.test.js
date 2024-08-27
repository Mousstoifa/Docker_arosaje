// __tests__/conseilController.test.js

import request from 'supertest';
import express from 'express';
import { createConseil, getAllConseils, deleteConseil, updateConseil } from '../../controllers/conseilController';
import Conseil from '../../models/conseilModel';

// Mock de l'application Express
const app = express();
app.use(express.json());

app.post('/conseils', createConseil);
app.get('/conseils', getAllConseils);
app.delete('/conseils/:id', deleteConseil);
app.put('/conseils/:id', updateConseil);

// Mock du modèle Conseil
jest.mock('../../models/conseilModel');

describe('Conseil Controller', () => {

    describe('POST /conseils', () => {
        it('Création nouveau conseil', async () => {
            const newConseil = { title: 'Conseil 1', content: 'Super conseil' };
            const createdConseil = { id: 1, ...newConseil };

            Conseil.createConseil.mockImplementation((conseil, callback) => {
                callback(null, createdConseil);
            });

            const res = await request(app)
                .post('/conseils')
                .send(newConseil)
                .expect(201);

            expect(res.body).toEqual(createdConseil);
            expect(Conseil.createConseil).toHaveBeenCalledWith(newConseil, expect.any(Function));
        });

        it('Erreur lors de la création du conseil', async () => {
            Conseil.createConseil.mockImplementation((conseil, callback) => {
                callback(new Error('Erreur lors de la création du conseil'));
            });

            const res = await request(app)
                .post('/conseils')
                .send({ title: 'Conseil 1', content: 'Conseil 1' })
                .expect(500);

            expect(res.body).toEqual({ error: 'Erreur lors de la création du conseil' });
        });
    });

    describe('GET /conseils', () => {
        it('Récupérer tous les conseils', async () => {
            const conseils = [
                { id: 1, title: 'Conseil 1', content: 'Conseil 1' },
                { id: 2, title: 'Conseil 2', content: 'Conseil 2' }
            ];

            Conseil.getAllConseils.mockImplementation((callback) => {
                callback(null, conseils);
            });

            const res = await request(app)
                .get('/conseils')
                .expect(200);

            expect(res.body).toEqual(conseils);
            expect(Conseil.getAllConseils).toHaveBeenCalledWith(expect.any(Function));
        });

        it('Erreur lors de la récupération', async () => {
            Conseil.getAllConseils.mockImplementation((callback) => {
                callback(new Error('Erreur lors de la récupération'));
            });

            const res = await request(app)
                .get('/conseils')
                .expect(500);

            expect(res.body).toEqual({ error: 'Erreur lors de la récupération' });
        });
    });

    describe('DELETE /conseils/:id', () => {
        it('Supression du conseil', async () => {
            const conseilId = 1;

            Conseil.deleteConseil.mockImplementation((id, callback) => {
                callback(null);
            });

            const res = await request(app)
                .delete(`/conseils/${conseilId}`)
                .expect(204);

            expect(res.text).toBe(''); // Le corps de la réponse devrait être vide
            expect(Conseil.deleteConseil).toHaveBeenCalledWith(conseilId.toString(), expect.any(Function));
        });

        it('Erreur lors de la suppression du conseil', async () => {
            const conseilId = 1;

            Conseil.deleteConseil.mockImplementation((id, callback) => {
                callback(new Error('Erreur lors de la suppression du conseil'));
            });

            const res = await request(app)
                .delete(`/conseils/${conseilId}`)
                .expect(500);

            expect(res.body).toEqual({ error: 'Erreur lors de la suppression du conseil' });
        });
    });

    describe('PUT /conseils/:id', () => {
        it('Mise à jour de conseil', async () => {
            const conseilId = 1;
            const updatedConseil = { title: 'Updated Conseil', content: 'Très bon conseil' };

            Conseil.updateConseil.mockImplementation((id, conseil, callback) => {
                callback(null);
            });

            const res = await request(app)
                .put(`/conseils/${conseilId}`)
                .send(updatedConseil)
                .expect(200);

            expect(res.body).toEqual({ message: 'Conseil mis à jour avec succès' });
            expect(Conseil.updateConseil).toHaveBeenCalledWith(conseilId.toString(), updatedConseil, expect.any(Function));
        });

        it('Erreur lors de la mise à jour du conseil', async () => {
            const conseilId = 1;
            const updatedConseil = { title: 'Updated Title', content: 'Très bon conseil' };

            Conseil.updateConseil.mockImplementation((id, conseil, callback) => {
                callback(new Error('Erreur lors de la mise à jour du conseil'));
            });

            const res = await request(app)
                .put(`/conseils/${conseilId}`)
                .send(updatedConseil)
                .expect(500);

            expect(res.body).toEqual({ error: 'Erreur lors de la mise à jour du conseil' });
        });
    });

});
