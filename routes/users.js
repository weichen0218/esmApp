import express from 'express';
import jwt from 'jsonwebtoken';
import bcryto from 'bcrypt';
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

const users = [
  {
    email: 'abc@gmail.com',
    username: 'abc',
    password: '',
  },
];

// signup
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  console.log(email, password, username);
  const foundUser = users.find((user) => user.email === email);
  if (foundUser) {
    return res.status(400).send({ message: 'User already exists' });
  }
  const hashPassword = await bcryto.hash(password, 10);
  users.push({
    email,
    username,
    password: hashPassword,
  });
  res.status(200).send({ message: 'User created successfully' });
  console.log(users);
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const foundUser = users.find((user) => user.email === email);
  if (!foundUser) {
    return res.status(400).send({ message: 'User does not exist' });
  }
  const isPasswordCorrect = await bcryto.compare(password, foundUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).send({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ email }, 'secret', { expiresIn: '1h' });
  res.send({ message: 'login success', token });
});

router.get('/profile', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
  jwt.verify(token, 'secret', (error, user) => {
    if (error) {
      return res.status(402).send({ message: 'Authorized error' });
    }
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('currentTime:', currentTime);
    console.log('user.exp:', user.exp);
    if (currentTime >= user.exp) {
      return res.status(403).send({ message: 'Token expired' });
    }

    res.send({ message: 'Verification successful', user });
  });
});
// module.exports = router;
export default router;
