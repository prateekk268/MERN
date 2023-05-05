const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
 
// import models  
const User = require('./models/User.js');
const Post = require('./models/Post.js');

// defining the constant 
const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';
const app = express();
const uploadMiddleware = multer({ dest: 'uploads/'})

// Global middleware 
app.use(cors({credentials:true, origin: `http://localhost:3000`}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(__dirname + '/uploads'));

// Connection to databases
const DBConnection = async () => {
    const MONGO_URI = "mongodb+srv://prateek:cvKx4jrPzfgmmbUT@mern.483njbl.mongodb.net/?retryWrites=true&w=majority";
    try {
        await mongoose.connect(MONGO_URI,{dbName: "blog", useNewUrlParser: true});
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error while connecting with the database ", error.message);
    }
}

DBConnection();

// Creating of API
app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);
    try {
        const data = {
            username,
            password: bcrypt.hashSync(password,salt),
        }
        const userDoc = await User.create(data);
       return res.status(201).send(userDoc);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        // logged in 
        jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
            if (err) throw err;
            return res.cookie("token", token).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        return res.status(401).send("Invalid username or password");
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        return res.json(info);
    })
});

app.post('/logout', (req , res) => {
    return res.cookie('token', "").json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            cover: newPath,
            author: info.id,
        });
        return res.json(postDoc);
    })
})

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const {originalname, path} = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const {id,title,summary,content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });

        return res.json(postDoc);
    })
})

app.get("/post", async (req, res) => {
    return res.json(
        await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    return res.json(postDoc);
})

app.listen(4000, () => console.log(`Server of Running of pORt`));   