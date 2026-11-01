import mongoose from 'mongoose';
const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });
conversationSchema.index({ userId: 1, updatedAt: -1 });
const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
//# sourceMappingURL=Conversation.js.map