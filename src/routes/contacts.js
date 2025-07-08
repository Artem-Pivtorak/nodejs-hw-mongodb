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
import upload from '../middlewares/upload.js';
import { contactSchema } from '../schemas/contactSchema.js';



const router = express.Router();

// Отримати всі контакти (з пагінацією, фільтрами)
router.get('/', ctrlWrapper(getAllContacts));

// Отримати контакт по id — перед цим перевіримо правильність id
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));

// Створити контакт — перед цим перевіримо тіло запиту
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContact));

// Видалити контакт — перевіряємо id
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

router.get("/", authenticate, ctrlWrapper(getAllContacts));

router.post('/', authenticate, upload.single('photo'), validateBody(contactSchema), createContact);

router.patch('/:contactId', authenticate, upload.single('photo'), updateContact);

export default router;
