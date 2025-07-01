import mongoose from "mongoose";
import { Contact } from "../db/models/contact.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAllContacts = ({ filter, sortBy, sortOrder, skip, limit }) => {
  return Contact
    .find(filter)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};


export const countContacts = (filter = {}) => {
  return Contact.countDocuments(filter);
};


export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};


export const createContact = (contactData) => {
  return Contact.create(contactData);
};

export const updateContact = async (contactId, userId, data) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, data, { new: true });
};


export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};

