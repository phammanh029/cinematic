import mongoose from 'mongoose';
import User from './user.interface';
const Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const UserModel = mongoose.model<User & mongoose.Document>('User', UserSchema);

export default UserModel;
