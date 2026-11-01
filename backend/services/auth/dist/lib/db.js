import mongoose from 'mongoose';
export async function connectToDatabase() {
    const mongoUri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI (or MONGO_URI) must be set in the environment');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
}
//# sourceMappingURL=db.js.map