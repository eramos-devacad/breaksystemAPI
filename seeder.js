const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// load env vars
dotenv.config({ path: './config/config.env' });

// load models
const Breaktime = require('./models/Breaktime');
const Break = require('./models/Break');
const User = require('./models/User');

//connect to db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read json files
const breaktime = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/breaktime.json`, 'utf-8'),
);

const breakrest = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/break.json`, 'utf-8'),
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'),
);

// Import to Database
const importData = async () => {
  try {
    await Breaktime.create(breaktime);
    await Break.create(breakrest);
    await User.create(users);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Breaktime.deleteMany();
    await Break.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed ...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
