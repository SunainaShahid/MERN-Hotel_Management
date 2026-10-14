import ServiceRequest from '../models/ServiceRequest.js';
import Notification from '../models/Notification.js';

// Guest ki taraf se nayi service request create karna
export const createServiceRequest = async (req, res) => {
  try {
    const { guestName, roomNumber, serviceType, details } = req.body;

    const newRequest = await ServiceRequest.create({
      user: req.user.id,
      guestName,
      roomNumber,
      serviceType,
      details,
    });

    // Admin ke liye automatic system notification generate karna
    await Notification.create({
      title: 'New Service Request',
      message: `${serviceType} requested for Room #${roomNumber} by ${guestName}.`,
      type: 'general'
    });

    res.status(201).json({ message: 'Service request submitted successfully!', newRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin ke liye saari requests get karna
export const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin ke liye request status update karna (Pending -> Completed)
export const updateServiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};