"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContactStatus = exports.getContacts = exports.createContact = void 0;
const contact_model_1 = __importDefault(require("../models/contact.model"));
// Create a new contact form submission
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, subject, message } = req.body;
        const newContact = new contact_model_1.default({
            name,
            email,
            phone,
            subject,
            message,
        });
        const savedContact = yield newContact.save();
        res.status(201).json({
            success: true,
            data: savedContact,
            message: 'Your message has been sent successfully!',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message,
        });
    }
});
exports.createContact = createContact;
// Get all contact form submissions
const getContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, search } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { subject: searchRegex },
                { message: searchRegex },
            ];
        }
        const contacts = yield contact_model_1.default.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact messages',
            error: error.message,
        });
    }
});
exports.getContacts = getContacts;
// Update contact status
const updateContactStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['new', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value',
            });
        }
        const updatedContact = yield contact_model_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status',
            error: error.message,
        });
    }
});
exports.updateContactStatus = updateContactStatus;
// Delete a contact message
const deleteContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedContact = yield contact_model_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact message',
            error: error.message,
        });
    }
});
exports.deleteContact = deleteContact;
