import { Request, Response } from 'express';
import Contact, { IContact } from '../models/contact.model';

// Create a new contact form submission
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    const savedContact = await newContact.save();
    res.status(201).json({
      success: true,
      data: savedContact,
      message: 'Your message has been sent successfully!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// Get all contact form submissions
export const getContacts = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message,
    });
  }
};

// Update contact status
export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedContact,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message,
    });
  }
};

// Delete a contact message
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message,
    });
  }
};
