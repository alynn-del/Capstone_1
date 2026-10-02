const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;


async function update(req, res) {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,                 
      { email: req.body.email },    // password stays locked
      { new: true },
    );
    if (!updated) return res.status(404).json({ message: 'User not found.' });


    const token = createJWT(updated);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteAccount(req, res) {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
async function signup(req, res) {
  const user = new User(req.body);
  try {
    await user.save();
    const token = createJWT(user);
    res.json({ token });
  } catch (err) {
    res.status(400).json(err);
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ err: "bad credentials" });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user);
        res.json({ token });
      } else {
        return res.status(401).json({ err: "bad credentials" });
      }
    });
  } catch (err) {
    return res.status(401).json(err);
  }
}

/*----- Helper Functions -----*/

function createJWT(user) {
  return jwt.sign({ user }, SECRET, { expiresIn: "24h" });
}

module.exports = {
  signup,
  login,
  update,
  deleteAccount
};