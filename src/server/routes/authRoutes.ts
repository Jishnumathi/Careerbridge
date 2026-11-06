import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { generateToken, protect, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, name, organization, department, rollNumber, companyName, designation } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Security rule: public registration cannot create admin accounts
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be created via the public registration endpoint.',
      });
    }

    const assignedRole: UserRole = role === 'recruiter' ? 'recruiter' : 'student';

    // Check duplicate email
    const existing = await db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.users.create({
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role: assignedRole,
      name: name.trim(),
      organization: organization || (assignedRole === 'recruiter' ? companyName : 'Apex Institute of Technology'),
      avatar: '',
      isActive: true,
    });

    // Create corresponding profile
    if (assignedRole === 'student') {
      await db.students.create({
        user: newUser._id,
        rollNumber: (rollNumber || `22CS${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase(),
        name: newUser.name,
        email: newUser.email,
        phone: '',
        department: department || 'Computer Science',
        graduationYear: '2026',
        cgpa: 7.5,
        tenthPercentage: 80,
        twelfthPercentage: 80,
        activeBacklogs: 0,
        historyBacklogs: 0,
        skills: ['JavaScript', 'React.js', 'Node.js'],
        projects: [],
        certifications: [],
        resumeUrl: '',
        resumeFileName: '',
        isVerifiedByTpo: false,
        placementStatus: 'Unplaced',
      });
    } else if (assignedRole === 'recruiter') {
      await db.recruiters.create({
        user: newUser._id,
        companyName: companyName || organization || 'Enterprise Partner',
        designation: designation || 'Campus Talent Acquisition Lead',
        industry: 'Software & Technology',
        website: '',
        isVerified: true,
      });
    }

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const userSafe = { ...newUser };
    delete userSafe.password;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userSafe,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userSafe = { ...user };
    delete userSafe.password;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userSafe,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile: any = null;
    if (user.role === 'student') {
      profile = await db.students.findByUserId(user._id.toString());
    } else if (user.role === 'recruiter') {
      profile = await db.recruiters.findByUserId(user._id.toString());
    }

    const userSafe = { ...user };
    delete userSafe.password;

    return res.json({
      success: true,
      user: userSafe,
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error retrieving current session.', error: err.message });
  }
});

// GET /api/auth/demo-users
// Generates live JWT tokens for all pre-seeded users for 1-click role testing
authRouter.get('/demo-users', async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.users.find();
    const demoAccounts = allUsers.map((u: any) => {
      const token = generateToken({
        id: u._id.toString(),
        email: u.email,
        role: u.role,
        name: u.name,
      });
      const userSafe = { ...u };
      delete userSafe.password;
      return {
        ...userSafe,
        token,
      };
    });

    return res.json({
      success: true,
      users: demoAccounts,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
