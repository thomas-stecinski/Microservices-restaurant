const User = require("../models/User");
const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {

  try {

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });

  } catch (err) {

    res.status(500).json({ message: "Erreur serveur", error: err.message });

  }

};

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });

  } catch (err) {

    res.status(500).json({ message: "Erreur serveur", error: err.message });

  }
  
};
