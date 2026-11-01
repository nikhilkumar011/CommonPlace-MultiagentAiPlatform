import mongoose from 'mongoose';
declare const Message: mongoose.Model<{
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    conversationId: mongoose.Types.ObjectId;
    userId: string;
    role: "assistant" | "user";
    content: string;
    attachment?: {
        name: string;
        mimeType: string;
        data: string;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
export default Message;
//# sourceMappingURL=Message.d.ts.map