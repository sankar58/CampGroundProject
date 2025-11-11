const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate =require('ejs-mate')
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError=require("./utils/ExpressError")
const { title } = require('process');
const {comproundSchema}=require('./schemas')

// ✅ Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/camp-ground', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ Database Connected");
})
.catch(err => {
    console.error("❌ Database connection error:", err);
});

// ✅ EJS setup
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground=(req,res,next)=>{

    const {error}= comproundSchema.validate(req.body)
    if(error){
        const msg =error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }


}

// ✅ Routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds',validateCampground,catchAsync(async (req, res) => {
    // if(!req.body.campground) throw new ExpressError("invalid Campground Data",400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit',validateCampground,catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

// ✅ Update route (PUT)
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

// ✅ Delete route (DELETE)
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));
app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError("page not found",404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500 }=err;
    if (!err.message) err.message="oh No, something went Wrong!"
    res.status(statusCode).render('error',{err});
})

// ✅ Server start
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
