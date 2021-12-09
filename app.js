//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv");



dotenv.config();
 

const app = express();
const url = "mongodb://yogi:golu1234@cluster0-shard-00-00.7xsyb.mongodb.net:27017,cluster0-shard-00-01.7xsyb.mongodb.net:27017,cluster0-shard-00-02.7xsyb.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-begpc2-shard-0&authSource=admin&retryWrites=true&w=majority";
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology: true} );

const todolistSchema = new mongoose.Schema({

  listItem:String
});

const Item = mongoose.model("Item",todolistSchema);

const item1 = new Item({
  listItem:"Welcome to the todolist"
});

const item2 = new Item({
  listItem:"hit the + button to add a new item"
});

const item3 = new Item({
  listItem:"<-- click here to delete an item"
});

const defaultItems = [item1 , item2 , item3];

const routeSchema =  {
  name:String,
  list: [todolistSchema]
}; 
const List = mongoose.model("List", routeSchema);


app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("default items added succesfully");
        }
     });
    res.redirect("/");  
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems  });
 
    }
  });
});

app.post("/", function(req, res){

  

  const itemName = req.body.newItem;
  const newItem = req.body.list;
    

  const item = new Item({
    listItem: itemName
  });

  if(newItem === "Today"){
    
    item.save();
    res.redirect("/");
    
  }
  else{
    List.findOne({name:newItem},function(err,foundlist){
      foundlist.list.push(item);
      foundlist.save();
      res.redirect("/"+ newItem);
    });
   
  }
   


  
});



 app.post("/delete", function(req, res){
  const Citem = req.body.checkedItem;
  const listname = req.body.listname;
    
  

  if(listname === "Today"){
    Item.deleteOne({ _id:Citem },function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("item deleted succesfully");
      }
    });
    res.redirect("/");
  }
  
  else{
    // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
  mongoose.set('useFindAndModify', false);
  List.findOneAndUpdate({name:listname },{$pull: { list: { _id:Citem} }}, function(err, foundI){
    if(!err){
       res.redirect("/" + listname);
    }
  })
  }



  

  
 }); 
 








app.get("/:routes",function(req,res){
  const routes = _.capitalize(req.params.routes);
  List.findOne({name:routes},function(err,foundI){
    if(!err){
      if(!foundI){
        const item = new List({
          name: routes,
          list: defaultItems
        });

        item.save();
        res.redirect("/"+ routes);
        
        
      }
    else{
      res.render("list",{listTitle:foundI.name , newListItems: foundI.list});
      // console.log(foundI.listItem);
    }
       }

    
  });
     
  
   
  // res.render("list",{ listTitle : routes   });
});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port , function() {
  console.log("Server started on port 3000");
});
