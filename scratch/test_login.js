const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hostelsathi');
  const User = require('../backend/models/User');
  
  await User.deleteMany({ email: 'testbug@test.com' });
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  
  await User.create({
    name: 'Test Bug',
    phone: '9999999999',
    email: 'TestBug@test.com',
    password: hashedPassword,
    role: 'student'
  });
  
  const username = 'TestBug@test.com';
  const password = '123456';
  
  const user = await User.findOne({
    $or: [{ email: username.toLowerCase() }, { phone: username }]
  });
  
  console.log('User found:', !!user);
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
  }
  
  process.exit(0);
}
test().catch(console.error);
