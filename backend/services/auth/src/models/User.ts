import mongoose from 'mongoose';

interface UserFields {
  name: string;
  email: string;
  password: string;
  profilePic: string;
}

const userSchema = new mongoose.Schema<UserFields>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
