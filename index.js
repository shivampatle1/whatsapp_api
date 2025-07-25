const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();
const Pusher = require("pusher");



const app=express().use(body_parser.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));


const token=process.env.TOKEN;
const mytoken=process.env.MYTOKEN;

app.listen(8000,()=>{
    console.log("webhook is listening");
});



const pusher = new Pusher({
  appId: "2027655",
  key: "064368eff0bef3b6a176",
  secret: "94d63603a27c5671213f",
  cluster: "ap2",
  useTLS: true
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world"
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            console.log("WEBHOOK VERIFIED ✅");
            res.status(200).send(challenge);
        } else {
            console.log("WEBHOOK VERIFICATION FAILED ❌");
            res.sendStatus(403); // This line was missing in your code
        }
    } else {
        res.sendStatus(400); // optional: bad request if something's missing
    }
});

app.post("/webhook",(req,res)=>{ //i want some 

    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("boady param "+msg_body);

               axios({
                   method:"POST",
                   url:"https://graph.facebook.com/v13.0/"+phon_no_id+"/messages?access_token="+token,
                   data:{
                       messaging_product:"whatsapp",
                       to:from,
                       text:{
                           body:"Hi.. I'm Prasath, your message is "+msg_body
                       }
                   },
                   headers:{
                       "Content-Type":"application/json"
                   }

               });

               res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }

    }

});

app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});