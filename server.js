// ______________________  express setting __________________
var path = require('path')
var express = require('express')
var app = express()
app.use(express.static(path.join(__dirname, 'public')))

// ______________________  ejs setting ______________________
app.set('view engine', 'ejs')
app.set('views,views')

// ______________________  post setting _____________________
var bodyparser = require('body-parser')
var bdp = bodyparser.urlencoded({ extended: true })

// ______________________  session setting __________________
const sessions = require('express-session')
const store = sessions.MemoryStore();
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions(
    {
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: true,// 
        store // save the session in server memory 
    }));
// ______________________  database setting __________________

var db = require('./moduls/db')
// //__________________________ upload library of images ____________________
// var uploadImages = require('./moduls/images')
//____________________________________________________________

app.get('/home', (req, res) => {
    res.redirect('/')
})

app.get('/', (req, res) => {
    var ss = req.session
    if (ss.username) {
        res.render('home', { username: ss.username })
    }
    else {
        res.render('home', { username: '' })
    }
})

app.get('/login', (req, res) => {
    res.render('login', { username: '' })
})

app.post('/login', bdp, (req, res) => {
    var s = req.session
    var username = req.body.username
    var password = req.body.password
    if (username == 'admin' && password == '147') {
        s.username = 'admin'
        res.render('home', { username: 'admin' })
    }
    else {
        q = 'select * from user where username=(?)and password=(?)'
        db.query(q, [username, password], (error, resultes) => {
            if (error) {
                console.log('error selecting in login ');
                res.send(error.message);
            }
            else {
                if (resultes.length == 0) {
                    res.redirect('/signup')
                }
                else {
                    s.username = resultes[0].username
                    res.redirect('/')
                }
            }
        })
    }

})

app.get('/signup', (req, res) => {
    res.render('signup', {
        username: '',
        name:'',

    })
})

app.post('/signup', bdp, (req, res) => {
    var s = req.session
    var username = req.body.username
    var password = req.body.password
    //q = 'select * from user where username=(?)and password=(?)'
    q = 'INSERT INTO user (username,password) VALUES (?,?);'
    db.query(q, [username, password], (err, resultes) => {
        if (err) {
            console.log('error inserting in signup ');
            res.send(err.message);
        }
        else {
            s.username = username
            res.redirect('/')
        }
    })

})


app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
})

app.get("/search", function (req, res) {
    q = 'select * from service'
    db.query(q, (err, results) => {
        if (err) {
            console.log('error selecting in search')
            res.send(err.message)
        }
        else {
            res.render('search', {
                username: req.session.username,
                services: results,
            })
        }
    })
})

app.get("/sear", function (req, res) {
    var ServiceName = req.query.Service;
    console.log(ServiceName)
    q = 'select * from service where name =(?)'
    db.query(q, [ServiceName], (err, results) => {
        if (err) {
            console.log('error selecting in search')
            res.send(err.message)
        }
        else {
            res.render('search', {
                username: '',
                services: results,
            })
        }
    })
})

app.get('/addService', (req, res) => {
    res.render('addService', { username: req.session.username })
})

app.post('/add', bdp, (req, res) => {
    var name = req.body.name;
    var price = req.body.price;
    var doctor = req.body.doctor;
    var Descrptioon = req.body.Descrptioon;
    q = 'INSERT INTO service(name,price,doctor_name,description) VALUES (?,?,?,?)'
    db.query(q, [name, price, doctor, Descrptioon], (err, resultes) => {
        if (err) {
            console.log('error add services ');
            res.send(err.message);
        }
        else {
            res.redirect('/search')
        }
    })

})
app.get('/edit', (req, res) => {
    var id = req.query.id
    q = 'select * from service where id =(?)'
    db.query(q, [id], (err, results) => {
        if (err) {
            console.log('there are error in edit function')
            res.send(err.message)
        }
        else {
            res.render('editInfo', {
                username: req.session.username,
                id: id,
                name: results[0].name,
                price: results[0].price,
                doctor: results[0].doctor_name,
                Descrptioon: results[0].description
            })
        }
    })
})

app.post('/editinfo', bdp, (req, res) => {
    var id = req.body.myid;
    var name = req.body.name;
    var price = req.body.price;
    var doctor = req.body.doctor;
    var Descrptioon = req.body.Descrptioon;
    q = 'UPDATE service SET name=(?),price=(?),doctor_name=(?),description=(?) WHERE (id=?)';
    db.query(q, [name, price, doctor, Descrptioon, id], (err, resultes) => {
        if (err) {
            console.log('error updating services ');
            res.send(err.message);
        }
        else {
            res.redirect('/search')
        }
    })

})

app.get('/delete', (req, res) => {
    var id = req.query.myid
    q = 'DELETE FROM service WHERE (id= ?)'
    db.query(q, [id], (err, resultes) => {
        if (err) {
            console.log('error in delete function')
            res.send(err.message)
        }
        else {
            console.log()
            res.redirect('/search')
        }
    })
})

// var multer = require('multer')

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, "public", "images"))
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-'
//         cb(null, uniqueSuffix + file.originalname)
//     }
// })

// const upload = multer({ storage: storage })


// app.post('/upload', upload.single('myfile'), (req, res) => {
//     console.log(req.file)
//     console.log(req.body)
//     res.render('signup.ejs', [name = req.file.filename])

// })



app.listen(5000, function () {
    console.log('\nthe server runing now')
})









