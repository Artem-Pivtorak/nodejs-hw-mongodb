import mongoose from "mongoose";
import Contact from "../db/models/contact.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllContacts = () => {
  return Contact.find();
};

export const getContactById = (id) => {
  if (!isValidObjectId(id)) return null;
  return Contact.findById(id);
};

export const createContact = (contactData) => {
  return Contact.create(contactData);
};

export const updateContact = (id, updates) => {
  if (!isValidObjectId(id)) return null;
  return Contact.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteContact = (id) => {
  if (!isValidObjectId(id)) return null;
  return Contact.findByIdAndDelete(id);
};
