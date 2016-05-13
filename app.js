var crypto  = require('crypto')
var express = require('express')
var app     = express()
var parser  = require('body-parser')
var mongo   = require('mongodb').MongoClient

app.use(express.static('public'))
app.use(parser.urlencoded({extended:false}))

app.set('view engine', 'ejs')
app.get ('/', home)
app.get ('/register', register)
app.post('/register', registerMember)
app.get ('/login', login)
app.get ('/list', list)
app.get ('/list-user', listUser)
app.get ('/show-user', showUser)
app.get ('/profile', profile)
app.listen(2000)

function home(req, res) {
	res.render("index")
}

function register(req, res) {
	res.render("register")
}

function registerMember(req, res) {
	var user = {}
	user.first_name = req.body['first-name']
	user.last_name  = req.body['last-name']
	user.email      = req.body.email
	user.password   = encrypt(req.body.password)
	
	mongo.connect("mongodb://127.0.0.1/ioffer",
		(e, db) => {
			db.collection("user").find({email: user.email})
			.toArray( (e, data) => {
				if (data.length > 0) {
					console.log("Duplicated Email")
				} else {
					db.collection("user").insert(user)
				}
			})
		})
	
	res.render("index")
}

function encrypt(s) {
	return crypto.createHash('sha512').update(s).digest('hex')
}

function listUser(req, res) {
	if (req.query.code == '7736518F427') {
		mongo.connect("mongodb://127.0.0.1/ioffer",
			(e, db) => {
				db.collection("user").find().toArray(
					(e, data) => {
						res.send(data)
					}
				)
			}
		)
	} else {
		res.send( [] )
	}
}

function list(req, res) {
	res.send(coffees)
}

var coffees = [
  {name:'Latte',      price:80},
  {name:'Americano',  price:70},
  {name:'Cappuccino', price:90},
  {name:'Espresso',   price:60}
]

function showUser(req, res) {
	if (req.query.code == '7736518F427') {
		mongo.connect('mongodb://127.0.0.1/ioffer',
			(e, db) => {
				db.collection("user").find().toArray(
					(e, data) => {
						res.render('show-user', {user: data})
					}
				)
			}	
		)
	} else {
		res.render('show-user', {user: [] })
	}
}

var tokens = [ ]
function profile(req, res) {
	var token = req.headers.Cookie.token
	if (tokens.indexOf(token) >= 0) {
		res.render('profile')
	} else {
		res.redirect('/login')
	}
}

function login(req, res) {
	res.render('login')
}