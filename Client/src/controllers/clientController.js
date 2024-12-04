const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const clients = [];

exports.createClient = (req, res) => {
  const { name, email, password } = req.body;

  if (clients.some(client => client.email === email)) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newClient = {
    id: clients.length + 1,
    name,
    email,
    password: hashedPassword
  };

  clients.push(newClient);
  res.status(201).json({ id: newClient.id, name: newClient.name, email: newClient.email });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const client = clients.find(c => c.email === email);

  if (!client || !bcrypt.compareSync(password, client.password)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  // Génération du token JWT
  const token = generateToken({ id: client.id, email: client.email });
  res.json({ token });
};

exports.listClients = (req, res) => {
  res.json(clients.map(({ password, ...client }) => client)); 
};

exports.getClient = (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  if (!client) return res.status(404).json({ error: 'Client non trouvé' });
  const { password, ...clientData } = client; 
  res.json(clientData);
};
