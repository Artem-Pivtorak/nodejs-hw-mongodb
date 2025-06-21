import mongoose from "mongoose";
import { Contact } from "../db/models/contact.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllContacts = ({ filter = {}, sortBy = "name", sortOrder = "asc", skip = 0, limit = 10 }) => {
  return Contact
    .find(filter)
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

export const countContacts = (filter = {}) => {
  return Contact.countDocuments(filter);
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
