const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');
const session=require('express-session')
const flash = require("connect-flash")

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// ✅ FIXED DATABASE CONNECTION (NO DEPRECATED OPTIONS)
mongoose.connect('mongodb://localhost:27017/camp-ground')
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Database connection error:", err));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig ={
    secret :'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000 *60*60*24*7,
        maxAge :1000 *60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};

app.use('/campgrounds', campgrounds);

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/campgrounds/:id/reviews', reviews);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
