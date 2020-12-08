const { create } = require("domain");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const http = require("http");
const users = require('./Users');

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content)
        })
    }
    if (req.url === "/system") {
        fs.readFile(path.join(__dirname, 'public', 'system.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content)
        })
    }
    // let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    // fs.readFile(filePath, (err, content) => {
    //     if (err) throw err
    //     res.writeHead(200, { 'Content-Type': 'text/html' })
    //     res.end(content)
    // })
    if (req.url === "/api/users") {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(users))
    }
    if (req.method === 'POST' && req.url === "/api/user") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            let pbody = parse(body)
            console.log(pbody)
            foundUser = users.filter(user => user.name === pbody.name && user.card === pbody.card && user.cardPin === pbody.cardPin)
            if (foundUser.length !== 0) {
                fs.readFile(path.join(__dirname, 'public', 'user.html'), (err, content) => {
                    if (err) throw err
                    res.writeHead(200, { 'Set-Cookie': `name=${foundUser[0].name}`, 'Content-Type': 'text/html' })
                    res.end(content)
                })
            } else {
                res.end('<h1>Invalid Details</h1>')
            }
        })
    }
    if (req.method === 'POST' && req.url === "/api/user/action") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            let pbody = parse(body)
            amount = parseInt(pbody.amount)
            let foundUser = []
            const cookieList = []
            const cookie = req.headers.cookie.toString().split(';')
            cookie.forEach(cook => {
                var item = (cook.split('='))
                console.log(item);
                if (item[0].match(/^name$/)) {
                    console.log("reached")
                    foundUser = users.filter(user => user.name === item[1])
                    console.log(foundUser)
                }
            })
            if (pbody.action == "Withdraw" && (pbody.amount != 0 || pbody.amount != null)) {
                foundUser[0].amount -= amount
                res.writeHead(200, { 'Set-Cookie': `name=${foundUser[0].name}`, 'Content-Type': 'text/html' })
                res.end(`<h1>The Transaction is complete!</h1><br><h3>Your Amount is: ${foundUser[0].amount}</h3>`)
            }
            if (pbody.action == "Add" && (pbody.amount != 0 || pbody.amount != null)) {
                foundUser[0].amount += amount
                res.writeHead(200, { 'Set-Cookie': `name=${foundUser[0].name}`, 'Content-Type': 'text/html' })
                res.end(`<h1>The Transaction is complete!</h1><br><h3>Your Amount is: ${foundUser[0].amount}</h3>`)
            }
        })
    }
})

const PORT = 5000;
server.listen(PORT, () => console.log("server is running on port 5000"))