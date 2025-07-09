import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import cloudinary from '../services/cloudinary.js';
import fs from 'fs/promises';

export const getAllContacts = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite
  } = req.query;

  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

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
    message: 'Successfully found contacts!',
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
  const contact = await contactsService.getContactById(contactId, req.user._id);
  if (!contact) throw createError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Contact found!',
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const { path: tempPath } = req.file;
  let photoUrl = null;

  try {
    const result = await cloudinary.uploader.upload(tempPath, {
  folder: 'contacts',
});
    photoUrl = result.secure_url;

    await fs.unlink(tempPath);
    const contactData = {
      ...req.body,
      userId: req.user._id,
      photo: photoUrl,
    };

    const newContact = await contactsService.createContact(contactData);

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: newContact,
    });
  } catch (error) {
    await fs.unlink(tempPath);
    throw createError(500, "Failed to upload photo to Cloudinary.");
  }
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'contacts',
    });
    req.body.photo = result.secure_url;
  }

  const updated = await contactsService.updateContact(
    contactId,
    req.user._id,
    req.body
  );

  if (!updated) throw createError(404, 'Contact not found');

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await contactsService.deleteContact(contactId, req.user._id);
  if (!deleted) throw createError(404, 'Contact not found');

  res.status(204).send();
};
