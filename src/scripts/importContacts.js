import fs from 'fs/promises';
import { initMongoConnection } from '../db/initMongoConnection.js';
import { Contact } from '../models/contact.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('DB_HOST:', process.env.DB_HOST);


const importContacts = async () => {
  await initMongoConnection();
  const data = await fs.readFile('./contacts.json', 'utf-8');
  const contacts = JSON.parse(data);
  await Contact.insertMany(contacts);
  console.log('Contacts imported successfully');
  process.exit();
};

importContacts();
