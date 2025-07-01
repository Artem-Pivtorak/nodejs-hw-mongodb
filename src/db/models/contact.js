import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  contactType: String,
  isFavourite: Boolean,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


export const Contact = mongoose.model('Contact', contactSchema);
