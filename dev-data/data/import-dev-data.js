const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // Options
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database Connected!');
  });

// Read the JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Imoprt the data
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Added Successfully !');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Deleting the file
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted Successfully! ');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please add an arrgument of "--import or --delete" ');
}

console.log(process.argv);
