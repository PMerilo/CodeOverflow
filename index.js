const express = require("express")
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const app = express()
const path = require('path');
const session = require('express-session');
const moment = require("moment")
const bodyparser = require('body-parser')
const { createServer } = require("http");
const { Server } = require("socket.io");
const DBConnection = require('./config/DBConnection');

//Routes
const main = require('./routes/main')
const transactions = require('./routes/transactions')
const listing = require('./routes/listing')
const api = require('./routes/api')
const inbox = require('./routes/inbox')
const user = require('./routes/user')


app.use('/webhook', express.raw({type: "*/*"}));
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }))
// To send forms and shit

// socket implementation
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const messagingHandler = require("./sockets/messaging")

const onConnection = (socket) => {
	socket.onAny((eventName, ...args) => {
		console.log(eventName, "was just fired", args)
	});
    socket.userid = socket.handshake.auth.id
	socket.join(`User ${socket.userid}`)
    // console.log(socket.rooms) 

    messagingHandler(io, socket)
    console.log(`${socket.id} has connected`);
}

io.on("connection", onConnection);
app.set('io', io)


// Library to use MySQL to store session objects 
const MySQLStore = require('express-mysql-session');

var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true, // The maximum age of a valid session; milliseconds: 
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds: 
	checkExpirationInterval: 1800000 // 30 min 
}

// To sstore: new MySQLStore(options),tore session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: 'tojdiv',
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

//database
DBConnection.setUpDB(false)

// passport
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Initilize Passport middleware 


//Message Library
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
const ensureAuthenticated = require("./helpers/auth");
app.use(flashMessenger.middleware);

// Place to define global variables
app.use(async function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user;
	res.locals.authenticated = req.isAuthenticated();
	next();
});

app.engine(
	"handlebars",
	engine({
		handlebars: allowInsecurePrototypeAccess(Handlebars),
		defaultLayout: "main",
		helpers: {
			equals(arg1, arg2, options) {
				return arg1 == arg2 ? options.fn(this) : options.inverse(this);
			},

			setVar(name, value, options) {
				options.data.root[name] = value;
			},

			gt(a, b) {
				var next = arguments[arguments.length - 1];
				return (a > b) ? next.fn(this) : next.inverse(this);
			},

			ge(a, b) {
				var next = arguments[arguments.length - 1];
				return (a >= b) ? next.fn(this) : next.inverse(this);
			},
			identifygender(v1, v2) {
				if (v1 == null) {
					return true;
				}
				else if (String(v1) == v2) {
					return true;

				}
				return false;
			},
			formatDate(date, targetFormat) {
				return moment(date).format(targetFormat);
			},
			checkOwner(userId, OwnerId){
				if(userId == OwnerId){
					return true;
				}return false;
			},
			add(v1, v2) {
				return parseInt(v1) + parseInt(v2);
			},

		},
	})
);

app.set('view engine', 'handlebars');

//Sets up engine and the default layout for handlebars

app.use(express.static(path.join(__dirname, 'public')));

// Creates static folder for publicly accessible HTML, CSS and Javascript files

app.all("/*", (req, res, next) => {
	req.app.locals.layout = 'main';
	next()
});
//Set layout for all routes

app.use("/", main)
app.use("/", transactions)
app.use("/", listing)
app.use("/inbox", ensureAuthenticated, inbox)
app.use("/api", api)
app.use("/user", user)

app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));


const port = 5000;



// Starts the server and listen to port
httpServer.listen(port, () => {
	console.log(`Server started on port ${port}`);
});