import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = "name",
    sortOrder = "asc",
    type,
    isFavourite
  } = req.query;

  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === "true";

  const totalItems = await contactsService.countContacts(filter);
  const totalPages = Math.ceil(totalItems / perPage);
  const skip = (page - 1) * perPage;

  const contacts = await contactsService.getAllContacts({
    filter,
    sortBy,
    sortOrder,
    skip,
    limit: Number(perPage),
  });

  res.status(200).json({
    status: 200,
    message: "Successfully found contacts!",
    data: {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};


export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.getContactById(contactId);
  if (!contact) throw createError(404, "Contact not found");

  res.status(200).json({
    status: 200,
    message: "Contact found!",
    data: contact,
  });
};


export const createContact = async (req, res) => {
  const contactData = {
    ...req.body,
    userId: req.user._id
  };
  const newContact = await contactsService.createContact(contactData);
  res.status(201).json({
  status: 201,
  message: "Successfully created a contact!",
  data: newContact,
});


};


export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updated = await contactsService.updateContact(contactId, req.body);
  if (!updated) throw createError(404, "Contact not found");

  res.status(200).json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updated,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await contactsService.deleteContact(contactId);
  if (!deleted) throw createError(404, "Contact not found");

  res.status(204).send();
};

