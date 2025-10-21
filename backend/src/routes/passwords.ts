import { Router } from 'express';
import PasswordEntry from '../models/PasswordEntry';
import { encryptJson, decryptJson } from '../crypto';

// Express router implementing the password API for the current authenticated user
const router = Router();

// List + search by name/username/url/tags
router.get('/', async (req:any, res) => {
    const userSub = req.auth?.sub;
    const q = (req.query.q as string || '').trim();
    const filter:any = { userSub };

    if (q) {
        filter.$or = [
        { name:     { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { url:      { $regex: q, $options: 'i' } },
        { tags:     { $elemMatch: { $regex: q, $options: 'i' } } },
        ];
    }

    const rows = await PasswordEntry.find(filter).sort({ updatedAt: -1 });
    res.json(rows);
});

// Create JSON for PasswordEntry object
router.post('/', async (req:any, res) => {
    const userSub = req.auth?.sub;
    const { name, username, url, tags, secret, strengthScore } = req.body;
    const enc = encryptJson(secret); // secret = { password, notes? }
    const row = await PasswordEntry.create({
        userSub, name, username, url, tags, enc, strengthScore: strengthScore ?? 0
    });
    res.status(201).json(row);
});

// Decrypt one (optional)
// Returns the encrypted doc plus { secret } in plaintext
router.get('/:id/decrypt', async (req:any, res) => {
    const userSub = req.auth?.sub;
    const row = await PasswordEntry.findOne({ _id: req.params.id, userSub });
    if (!row) return res.sendStatus(404);
    const secret = decryptJson(row.enc);
    res.json({ ...row.toObject(), secret });
});

// Update
// If a secret is provided, re-encrypts it. updates meta fields and strengthScore
router.put('/:id', async (req:any, res) => {
    const userSub = req.auth?.sub;
    const { name, username, url, tags, secret, strengthScore } = req.body;
    const update:any = { name, username, url, tags, strengthScore };
    if (secret) update.enc = encryptJson(secret);
    const row = await PasswordEntry.findOneAndUpdate(
        { _id: req.params.id, userSub }, update, { new: true }
    );
    if (!row) return res.sendStatus(404);
    res.json(row);
});

// Delete
router.delete('/:id', async (req:any, res) => {
    const userSub = req.auth?.sub;
    const out = await PasswordEntry.deleteOne({ _id: req.params.id, userSub });
    res.json({ deleted: out.deletedCount === 1 });
});

export default router;
