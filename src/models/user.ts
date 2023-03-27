import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import AuthService from '@src/service/auth';
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

export interface UserModel extends Omit<User, '_id'>, Document {}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Validates the email and throws a validation error, otherwise it will throw a 500
 */
schema.path('email').validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  'already exists in the database.',
  CUSTOM_VALIDATION.DUPLICATED
);

//neste caso usamos uma funcao anonima, nao uma arrow fun por estar usando this por causa do escopo da funcao.
schema.pre<UserModel>('save', async function () {
  //caso o password nao tiver sido setado ou em caso de update e o valor é o mesmo
  if (!this.password || !this.isModified('password')) {
    return;
  }

  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (error) {
    console.error(`Error hasshing the password fpr the user ${this.name}`);
  }
});

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);