const mongoose=require('mongoose')
const campground = require('../models/campground');
const cities=require('./cities')
const {places,description} =require('./seedHelpers')
mongoose.connect('mongodb://localhost:27017/camp-ground')
.then(()=>{
    console.log("Database Connected")
})
.catch(e=>{
    console.log(e)});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 142; i++) {
    const randomIndex = Math.floor(Math.random() * cities.length);
    const price= Math.floor(Math.random() * 500)+18;

    const camp = new campground({
      location: `${cities[randomIndex].city}, ${cities[randomIndex].state}`,
      title: `${sample(description)} ${sample(description)}`,
      image: 'https://picsum.photos/400?random=${Math.random()}',
      description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      price   

    });
    await camp.save();
  }
};

seedDB().then(()=>{
    mongoose.connection.close()
});