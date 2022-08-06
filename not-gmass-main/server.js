const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const bp = require('body-parser');
const http = require('http').createServer(app);
const uuid = require('uuid');
const { Pool, Client } = require('pg');
const connectionString = 'postgres://admin:admin@192.241.155.20:5665/gmass'

let emails = ['Sample Email 1', 'Sample Email 2', 'Sample Email 3', 'Sample Email 4', 'Sample Email 5']; 

let campaign_uuid = 0;

const pool = new Pool ({
  connectionString,
  ssl: false
})

http.listen(80, () => {
  console.log("Listening on 80");
})

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());   


app.get('/', (req, res) => {

  res.render('index.ejs', {emails: emails});

})

app.post("/settings", function(req,res) {
  res.render('settings.ejs');
});

app.post("/create", function(req,res) {
  campaign_uuid = uuid.v4();
  
  res.render('create-csv.ejs');
})

app.post("/", function(req,res) {

  return res.render('index.ejs', {emails: emails});
})

app.post("/create-template", function (req,res) {
  console.log(1)
  let csvText = req.body
  console.log(csvText)
  
  let info = csvText.csvtext.split('\r\n')
  info.shift()
  
  info.forEach(async (line) => {
    console.log(line)

    let splitLine = line.split(", ")

    let firstName = splitLine[0]
    let lastName = splitLine[1]
    let email = splitLine[2];

    const data = await pool.query("INSERT INTO csv_info (campaign_id, first_name, last_name, email) VALUES ($1, $2, $3, $4) RETURNING id", [campaign_uuid, firstName, lastName, email])

    console.log(data.rows)
  })

  res.render('create-template.ejs');
})

app.post("/confirmation", async (req,res) => {
  let campaignInfo = req.body
  console.log(campaignInfo)

  let subject = campaignInfo.subject
  let sender = campaignInfo.sender
  let template = campaignInfo.template

  console.log(subject)
  console.log(sender)
  console.log(template)
  
  const data = await pool.query("INSERT INTO campaign (campaign_id, subject, sender, email_body) VALUES ($1, $2, $3, $4) RETURNING campaign_id", [campaign_uuid, subject, sender, template])

  console.log(data.rows)
})

app.post("/submit", function(req,res) {
  res.render('index.ejs', {emails: emails});
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})