import Contact from '../models/Contact.js';

// Submit new contact query
export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const newContact = new Contact({ firstName, lastName, email, phone, message });
    await newContact.save();

    res.status(201).json({ message: 'Query submitted successfully', data: newContact });
  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ error: 'Server error while submitting query' });
  }
};

// Get all queries for Admin Dashboard
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Fetch contacts error:', err);
    res.status(500).json({ error: 'Server error while fetching queries' });
  }
};