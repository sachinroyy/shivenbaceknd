import { Request, Response } from 'express';

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    const user = req.user as any;
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Convert _id to string if it's an ObjectId
    const userId = user._id ? (user._id.toString ? user._id.toString() : user._id) : null;

    // Return user data (exclude sensitive information)
    const userData = {
      id: userId,
      name: user.name || '',
      email: user.email,
      role: user.role || 'user',
      provider: user.provider || 'local',
      ...(user.picture && { picture: user.picture }),
      ...(user.createdAt && { createdAt: user.createdAt }),
      ...(user.updatedAt && { updatedAt: user.updatedAt })
    };

    return res.status(200).json({
      success: true,
      data: userData
    });
    
  } catch (error: any) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default { getCurrentUser };
