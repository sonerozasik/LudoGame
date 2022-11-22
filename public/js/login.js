
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    const express = require('express');
    const router =express.Router();

  

    document.getElementById("login_button_login").addEventListener("click",()=>{
    const username_text = new String(document.getElementById("textbox_username").value);
    const password_text = new String(document.getElementById("textbox_password").value);
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("users").find({}, { projection: { _id: 0, password: 1 } }).toArray(function(err, result) {
          if (err) {
              setFormMessage(login,'error',"Username/Password is not correct!");
          };
          if(result[0]==password_text){
            setFormMessage(login,'success',"Succesful Login!");
          }
          db.close();
        });
      });
    
})

function setFormMessage(formElement, type, message){
    const messageElement = formElement.querySelector("#form_message");
    messageElement.textContent=message;
}

router.get('');