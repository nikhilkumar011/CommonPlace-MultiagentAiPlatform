import mongoose from 'mongoose';
interface UserFields {
    name: string;
    email: string;
    password: string;
    profilePic: string;
}
declare const User: mongoose.Model<UserFields, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, UserFields, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<UserFields, mongoose.Model<UserFields, any, any, any, any, any, UserFields & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, UserFields, mongoose.Document<unknown, {}, UserFields, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: mongoose.SchemaDefinitionProperty<string, UserFields, mongoose.Document<unknown, {}, UserFields, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: mongoose.SchemaDefinitionProperty<string, UserFields, mongoose.Document<unknown, {}, UserFields, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    password?: mongoose.SchemaDefinitionProperty<string, UserFields, mongoose.Document<unknown, {}, UserFields, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    profilePic?: mongoose.SchemaDefinitionProperty<string, UserFields, mongoose.Document<unknown, {}, UserFields, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<UserFields & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, UserFields>, UserFields & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default User;
//# sourceMappingURL=User.d.ts.map