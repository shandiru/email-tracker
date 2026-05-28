import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Email from '../models/Email.js';

const ADMIN_USERNAME = 'dirushan';
const ADMIN_PASSWORD = 'Rsdirug@03';

const signAdminToken = () => {
  return jwt.sign(
    { role: 'admin', username: ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  res.json({
    success: true,
    token: signAdminToken(),
    admin: {
      username: ADMIN_USERNAME
    }
  });
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('email senderEmail isVerified createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    const emailStats = await Email.aggregate([
      {
        $group: {
          _id: '$userId',
          sentCount: { $sum: 1 },
          openedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'opened'] }, 1, 0]
            }
          },
          totalOpens: { $sum: '$openCount' },
          lastSentAt: { $max: '$sentAt' },
          lastOpenedAt: { $max: '$lastOpenedAt' }
        }
      }
    ]);

    const statsByUserId = emailStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    }, {});

    const usersWithStats = users.map((user) => {
      const stats = statsByUserId[user._id.toString()] || {};

      return {
        id: user._id,
        email: user.email,
        senderEmail: user.senderEmail,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sentCount: stats.sentCount || 0,
        openedCount: stats.openedCount || 0,
        totalOpens: stats.totalOpens || 0,
        lastSentAt: stats.lastSentAt || null,
        lastOpenedAt: stats.lastOpenedAt || null
      };
    });

    res.json({
      success: true,
      users: usersWithStats,
      summary: {
        totalUsers: usersWithStats.length,
        verifiedUsers: usersWithStats.filter((user) => user.isVerified).length,
        totalSent: usersWithStats.reduce((count, user) => count + user.sentCount, 0),
        totalOpens: usersWithStats.reduce((count, user) => count + user.totalOpens, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
