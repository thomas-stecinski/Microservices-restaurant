const User = require("../models/User");

exports.getUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);

  } catch (err) {

    res.status(500).json({ message: "Erreur serveur", error: err.message });
    
  }
};
