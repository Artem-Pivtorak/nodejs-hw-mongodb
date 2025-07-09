import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from "../middlewares/validateBody.js";
import isValidId from "../middlewares/isValidId.js";
import {
  createContactSchema,
  updateContactSchema
} from "../schemas/contacts.js";

import authenticate from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import { contactSchema } from '../schemas/contactSchema.js';



const router = express.Router();

router.get('/:contactId', isValidId, ctrlWrapper(getContactById));

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

router.get("/", authenticate, ctrlWrapper(getAllContacts));

router.post('/', authenticate, upload.single('photo'), validateBody(contactSchema), createContact);

router.patch('/:contactId', authenticate, upload.single('photo'), updateContact);

export default router;
