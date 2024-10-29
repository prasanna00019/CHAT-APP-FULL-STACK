import User from "../models/UserModel.js";
export const getUserInfoByID = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
};
export const updateOnlineStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { onlineStatus } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ShowOnline: onlineStatus },
            { new: true } 
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Online status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update online status' });
    }
};
export const updateLastSeen = async (req, res) => {
    try {
        const { userId } = req.params;
        const { lastSeen } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ShowLastSeen: lastSeen },
            { new: true } 
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Last seen updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update last seen' });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { online, lastSeen } = req.body;
        const currentUser = await User.findById(userId);
        if (currentUser && currentUser.online === online) {
            return res.status(200).json({ message: 'Nothing to update in online' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { online: online, lastSeen: lastSeen },
            { new: true } 
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Online status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update online status' });
    }
};  