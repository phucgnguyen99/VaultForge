import { Schema, model } from 'mongoose';

// Seperates plaintext meta for listing/search from encrypted secrets
// Only store password plaintext in enc
// Make sure every query filters by userSub to prevent leakage between users

const EncSchema = new Schema({
    iv: { type: String, required: true },
    data: { type: String, required: true },
    tag: { type: String, required: true },
}, { _id: false });

const PasswordEntrySchema = new Schema({
    userSub: { type: String, index: true, required: true }, // Auth0 user id
    name: { type: String, required: true },     // searchable
    username: { type: String, required: true },  // searchable
    url: { type: String },  // searchable
    tags: { type: [String], default: [] },  // searchable
    strengthScore: { type: Number, default: 0 },    // 0..4 value
    enc: EncSchema,     // encrypted { password, notes, totpSecret? }
}, { timestamps: true });

export default model('PasswordEntry', PasswordEntrySchema);