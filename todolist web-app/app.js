
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("staticFiles"));

app.set("view engine", "ejs");

mongoose.connect('mongodb admin servr connection details', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Click '\+' to add an event in your list."
});
const item2 = new Item({
  name: "⬅ Click on Checkbox to delete the event."
});

const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

// To get/add items in Home Route i.e Today's List
app.get("/", function(req, res) {
  // let day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfuly saved items");
        }
      });
        res.redirect("/");
    }

    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems});
    }
  });
});


// To get/add items in Custom List i.e Work's, School's List etc
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
      else{
        // Show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


// To post/show items in Home List(Today's list) else in Custom List
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  // If list is Today then simply save item in it
  if(listName === "Today"){
      item.save();
      res.redirect("/");
  }

  // Else it is a Custom list then find its items by name and push new item in items array
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});


// To delete an Item from a List when checkbox is clicked
app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  // To delete, directly from Item by checkedItemID
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item from Today List.");
        res.redirect("/");
      }
    });
  }
  // To find the items(an array) from List with checkedID
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedItemID}}}, function(err, foundList){
      if(!err){
        console.log("Successfully deleted checked item from" + listName + "List.");
        res.redirect("/" + listName);
      }
    });
  }
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started Successfully.");
});
