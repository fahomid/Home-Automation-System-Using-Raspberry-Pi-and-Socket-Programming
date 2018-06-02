// Declaration
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser')

var login = require('./controllers/login');
var logout = require('./controllers/logout');
var home = require('./controllers/home');
var register = require('./controllers/register');
var api = require('./controllers/api');
var forget = require('./controllers/forget');

var port = 1337;

//Configure
app.set('view engine', 'ejs');

//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressSession({secret: 'My top secret key', saveUninitialized: true, resave: false}));
app.use(cookieParser());

//Static
app.use('/css', express.static(path.join(__dirname, 'assets/css')));
app.use('/js', express.static(path.join(__dirname, 'assets/js')));
app.use('/img', express.static(path.join(__dirname, 'assets/img')));


//Route
app.get('/', function(req, res){
	res.redirect('/login');
});

app.use('/login', login);
app.use('/logout', logout);
app.use('/home', home);
app.use('/register', register);
app.use('/forget', forget);
app.use('/api', api);


//Server startup
app.listen(port, function(){
	console.log('Server started at port ' + port);
});