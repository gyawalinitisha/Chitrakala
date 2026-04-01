const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// Password must be at least 8 chars, contain an uppercase letter and a number
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one number.';
    }
    return null; // valid
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Validate password strength
    const pwError = validatePassword(password);
    if (pwError) {
        return res.status(400).json({ message: pwError });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'collector', // default to collector if not specified
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage || "",
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Google-only accounts have no password — direct them to Google Sign In
    if (!user.password) {
        return res.status(400).json({ message: 'This account uses Google Sign-In. Please use the Google button to login.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || "",
                bio: user.bio || "",
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Get user by name (for messaging)
// @route   GET /api/auth/user/:name
// @access  Public
const getUserByName = async (req, res) => {
    try {
        const { name } = req.params;
        const user = await User.findOne({ name }).select('_id name profileImage role email');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error("Error fetching user by name:", error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// @desc    Get all artists
// @route   GET /api/auth/artists
// @access  Public
const getAllArtists = async (req, res) => {
    try {
        const artists = await User.find({ role: 'artist' }).select('_id name email profileImage bio createdAt');
        res.status(200).json(artists);
    } catch (error) {
        console.error("Error fetching artists:", error);
        res.status(500).json({ message: 'Error fetching artists', error: error.message });
    }
};

// @desc    Get a single artist by ID
// @route   GET /api/auth/artists/:id
// @access  Public
const getArtistById = async (req, res) => {
    try {
        const artist = await User.findOne({ _id: req.params.id, role: 'artist' })
            .select('_id name email profileImage bio createdAt followers');
        if (!artist) return res.status(404).json({ message: 'Artist not found' });
        const result = artist.toObject();
        result.followerCount = artist.followers.length;
        // If request is authenticated, tell client if they're already following
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const jwt = require('jsonwebtoken');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                result.isFollowing = artist.followers.some(f => String(f) === String(decoded.id));
            } catch { /* ignore */ }
        }
        delete result.followers;
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching artist', error: error.message });
    }
};

// @desc    Update user profile image
// @route   PUT /api/auth/profile-image
// @access  Private
const updateProfileImage = async (req, res) => {
    try {
        const { profileImage } = req.body;

        if (!profileImage) {
            return res.status(400).json({ message: 'Profile image is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage },
            { new: true }
        ).select('_id name email profileImage role');

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating profile image:", error);
        res.status(500).json({ message: 'Error updating profile image', error: error.message });
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        
        // If client ID is missing in .env, tell client
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.warn("GOOGLE_CLIENT_ID is not set in backend .env");
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { name, email, picture } = payload;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            // Register new Google user
            user = await User.create({
                name,
                email,
                profileImage: picture || "",
                role: 'collector', 
            });
        }
        
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage || "",
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Google Authentication failed" });
    }
};

// @desc    Update profile (name, bio)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage || "",
            bio: updatedUser.bio,
            token: generateToken(updatedUser._id) // refreshing token optionally
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

// @desc    Follow or unfollow an artist
// @route   POST /api/auth/artists/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
    try {
        const artistId = req.params.id;
        const userId = req.user._id;

        if (String(artistId) === String(userId)) {
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }

        const artist = await User.findById(artistId);
        if (!artist || artist.role !== 'artist') {
            return res.status(404).json({ message: 'Artist not found.' });
        }

        const isFollowing = artist.followers.some(f => String(f) === String(userId));

        if (isFollowing) {
            artist.followers = artist.followers.filter(f => String(f) !== String(userId));
        } else {
            artist.followers.push(userId);
        }

        await artist.save();
        res.json({ followers: artist.followers.length, isFollowing: !isFollowing });
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({ message: 'Error updating follow status' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Google-only accounts have no password
        if (!user.password) {
            return res.status(400).json({ message: 'This account uses Google Sign-In. Password cannot be changed.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const pwError = validatePassword(newPassword);
        if (pwError) return res.status(400).json({ message: pwError });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserByName,
    getAllArtists,
    getArtistById,
    updateProfileImage,
    googleAuth,
    updateProfile,
    changePassword,
    toggleFollow,
};
