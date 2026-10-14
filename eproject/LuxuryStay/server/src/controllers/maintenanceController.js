import Maintenance from '../models/Maintenance.js';
import Notification from '../models/Notification.js';
// Get all maintenance requests
export const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find().populate('room').sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new maintenance request
export const createMaintenanceRequest = async (req, res) => {
  try {
    const { roomId, reportedBy, issueDescription, priority } = req.body;
    const newRequest = await Maintenance.create({
      room: roomId,
      reportedBy,
      issueDescription,
      priority: priority || 'Medium'
    });
    const populated = await Maintenance.findById(newRequest._id).populate('room');

    // Naya maintenance request save hone ke baad:
    await Notification.create({
      title: 'New Maintenance Issue',
      message: `Issue reported for Room #${populated.room?.roomNumber || 'N/A'}.`,
      type: 'maintenance'
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update request status (Pending -> In Progress -> Resolved)
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('room');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};