

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = process.env.PORT || 8080;


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
// mongoose.connect("mongodb://localhost:27017/todolistDB"); 
mongoose.connect("mongodb+srv://admin-Yuan:<password>@cluster0.aluy6yo.mongodb.net/todolistDB?retryWrites=true&w=majority"); 
const itemsSchema = {
  name:String
};

const Item =mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"welcom to your to do list"
});
const item2 =new Item({
  name:"click the + button to add new item"
});
const item3 = new Item({
  name:"<-- hit this to delete"
});
const defaultitems =[item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}).then((result)=>{
    if(result.length === 0){
      Item.insertMany(defaultitems).then(()=>{
        console.log("Data successfully added"); // Success
        res.redirect("/");
      }).catch((error)=>{
        console.log(error); // Failure
      });
    }else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  }).catch(function(error){
    console.log(error); // Failure
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName}).then((result)=>{
    if(!result){
      //create list
      const list = new List({
        name:customListName,
        items:defaultitems
      });
      list.save();
      res.redirect("/" + customListName);
    }else{
      //show lists
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
  }).catch((err)=>{
    console.log(err);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const addItem = new Item({
    name:itemName
  });

  if(listName === "Today"){
    addItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then((result)=>{
      result.items.push(addItem);
      result.save();
      res.redirect("/" + listName);
    }).catch((err)=>{
      console.log(err);
    });
  }
  
});

app.post("/delete",function(req,res){
  const ckeckedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(ckeckedId).then(()=>{
      console.log("item is deleted");
      res.redirect("/");
    }).catch((err)=>{
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:ckeckedId}}}).then((result)=>{
      res.redirect("/" + listName);
    }).catch((err)=>{
      console.log(err);
    })
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
