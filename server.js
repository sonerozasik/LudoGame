require('./public/js/db');

const socketio=require('socket.io');
const express = require('express');
const app = express();
var router = express.Router();
const port = 3000;
const http=require('http');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const userRouter = require('./public/js/user');

app.use(express.static('public'))
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/img',express.static(__dirname+'public/img'));
app.set('views','./views')
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))


app.get('/',(req,res)=>{
    res.render('login')
})

/*app.get('/:room',(res,req)=>{
  res.render('room',{roomName:req.params.room})
})*/

/*app.get('/signup',(req,res)=>{
    res.render('signup')
})*/

app.get('/game',(req,res)=>{
    res.render('game')
})

app.get('/game1',(req,res)=>{
  res.render('game')
})



const server= http.createServer(app);
const io =socketio(server);

var clientNo=0;
var roomNo=0;
var rooms =[];
var rooms2=[[],[]];
var submitpoints=0;

io.on('connection',(sock)=>{
    clientNo++;
    console.log('Someone connected!(connected: ' + clientNo + ' )');
    
    sock.emit('message','Hi, you are connected!');
    sock.on('message',(data)=>{
      io.sockets.in(data.room).emit('message',data.text)
  });
    
    sock.on('Login',function(data){
        
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("users").find({username: data.username}, { projection: { _id: 0, password: 1 } }).toArray(function(err, result) {
              if (err) {
                sock.emit('LoginResponse',{success:false});          
              } 
              if (result[0].password!=data.password) {

                sock.emit('LoginResponse',{success:false});
              }
              else{
                  
                sock.emit('LoginResponse',{success:true});
              }
              db.close();
            });
          });

    })

    sock.on('signUp',function(data){

        MongoClient.connect(url, function(err, db) {
            
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("users").find({username: data.username}, { projection: { _id: 0, username: 1 } }).toArray(function(err, result) {
                if (err) {
                  sock.emit('signUpResponse',{success:false});          
                } 
                if (result.length>0) {
                  sock.emit('signUpResponse',{success:false});
                }
                else{
                    if(data.password==data.confpassword){
                        addUser(data.username,data.password);
                        sock.emit('signUpResponse',{success:true});
                }else
                {
                    sock.emit('signUpResponse',{success:false});
                }
                }
                db.close();


            });
        });

    });

    sock.on('createRoom',function(data){
      sock.join(data+' room');
      io.sockets.in(data+' room').emit('message', "You are in "+data+ " room.");
      console.log(data+" created room");
      //rooms.push(data+' room');
      rooms2[roomNo]=[];
      rooms2[roomNo][(rooms2[roomNo].length)]=data+' room';
      rooms2[roomNo][(rooms2[roomNo].length)]=data;
      roomNo++;
    })

    sock.on('joinRoom',function(data){
      sock.join(data.room);
      io.sockets.in(data.room).emit('message', data.username+" joined the "+data.room+" .");
      console.log(data.username+" entered "+data.room);
      var i=0;
      for(;i<rooms2.length;i++){
        if(rooms2[i][0]==data.room){
          break;
        }
      }
      console.log(i);
      rooms2[i][(rooms2[i].length)]=data.username;
      console.log(rooms2);
    })
    
    sock.on('refreshRoomsAndPlayers',()=>{
      MongoClient.connect(url, function(err, db) {
            
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("users").find({}, { projection: { _id: 0, username: 1,First:1,Second:1,Third:1,Last:1,TotalPlayed:1 } }).toArray(function(err, result) {
          sock.emit('getRoomsAndPlayers',{rooms:rooms2,users:result});
          db.close();
        })
      })
    })
    
    sock.on('refreshUsers',()=>{
      sock.emit('getUsers',rooms2);
    })

    sock.on('play',function(data){
    io.sockets.in(data.room).emit('played', data.dice);
    })
    
    sock.on('move',function(data){
    io.sockets.in(data.room).emit('moved',data);
    })

    sock.on('restart',function(data){
      io.sockets.in(data.room).emit('restarted');
    })

    sock.on('quit',function(data){
      io.sockets.in(data.room).emit('quits');
    })

    sock.on('closetheroom',function(data){
      sock.leave(data.room);
      var flag1=0;
      for(var i=0;i<rooms2.length;i++){
       if(rooms2[i]){
        if(rooms2[i][0]==data.room){
          delete rooms2[i];
          flag1=1
        }
        if(flag1==1 && rooms2[i+1]){
          rooms2[i]=rooms2[i+1];
        }
        if(i==rooms2.length-1 && flag1==1){
          delete rooms2[i];
        }
      }
      }
    })

    sock.on('submitpoints',function(data){
      submitpoints++;
      console.log("submitpoints :"+  submitpoints);
     if(submitpoints==4){
      MongoClient.connect(url, function(err, db) {
          console.log("data:"+data);
            
        if (err) throw err;
        var dbo = db.db("mydb");
        var i=0;
          var First_;
          var Second_;
          var Third_;
          var Last_;
          var Total_;

        dbo.collection("users").find({username:data[0]}, { projection: { _id: 0, First: 1,TotalPlayed:1 } }).toArray(function(err1, result) { 
          console.log(result);
          if(err1) throw err1;
          First_=(result[0].First)+1;
          Total_=(result[0].TotalPlayed)+1;

          dbo.collection("users").updateOne({username: data[0]}, { $set: {First: First_ , TotalPlayed: Total_}},function(err,res){
            if (err) throw err;
            console.log("1 document updated");
          });     
          });
          dbo.collection("users").find({username:data[1]}, { projection: { _id: 0,Second:1,TotalPlayed:1 } }).toArray(function(err1, result) { 
            console.log(result);
            if(err1) throw err1;
            Second_=result[0].Second+1;
            Total_=(result[0].TotalPlayed)+1;
            
            dbo.collection("users").updateOne({username: data[1]}, { $set: {Second: Second_ , TotalPlayed: Total_}},function(err,res){
              if (err) throw err;
              console.log("1 document updated");
            });
          });

          dbo.collection("users").find({username:data[2]}, { projection: { _id: 0,Third:1,TotalPlayed:1 } }).toArray(function(err1, result) { 
            console.log(result);
            if(err1) throw err1;
            Third_=result[0].Third+1;
            Total_=(result[0].TotalPlayed)+1;
            
            dbo.collection("users").updateOne({username: data[2]}, { $set: {Third: Third_ , TotalPlayed: Total_}},function(err,res){
              if (err) throw err;
              console.log("1 document updated");
            });
          });

          dbo.collection("users").find({username:data[3]}, { projection: { _id: 0,Last:1,TotalPlayed:1 } }).toArray(function(err1, result) { 
            console.log(result);
            if(err1) throw err1;
            Last_=result[0].Last+1;
            Total_=(result[0].TotalPlayed)+1;
            
            dbo.collection("users").updateOne({username: data[3]}, { $set: {Last: Last_ , TotalPlayed: Total_}},function(err,res){
              if (err) throw err;
              console.log("1 document updated");
              db.close();
            });
          });
      });  
      submitpoints=0;
    }
    }); 

      /*sock.on('submitpoints',function(data){
        MongoClient.connect(url, function(err, db) {

          if (err) throw err;
          var dbo = db.db("mydb");
          dbo.collection("users").find({}, { projection: { _id: 0, First: 1,Second:1,Third:1,Last:1,TotalPlayed:1 } }).toArray(function(err1, result) {
            console.log(result);
            console.log("data:"+data);
            if(err1) throw err1;


          })

        })
      })*/
    
});


function addUser(username,password){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var myobj = { username: username, password: password ,First:0,Second:0,Third:0,Last:0,TotalPlayed:0};
        dbo.collection("users").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
          flag=0;
        });
    });
}

server.listen(port,()=> console.info(`Listening on port ${port}`))


class Users{
  constructor(){
    const users = new Map();
  }

  userConnected(username){
    clientNo++;
    users.set(username,clientNo);
  }

  userDisconnected(username){
    users.delete(username);
  }


}