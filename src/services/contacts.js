import Contact from "../db/models/contact.js";


export const getAllContacts = () => {
  return Contact.find();
};

export const getContactById = (id) => {
  return Contact.findById(id);
};


export const createContact = (contactData) => {
  return Contact.create(contactData);
};

export const updateContact = (id, updates) => {
  return Contact.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteContact = (id) => {
  return Contact.findByIdAndDelete(id);
};
