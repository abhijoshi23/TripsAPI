const express = require ("express");
const res = require("express/lib/response");
const app = express();
const HTTP_PORT = process.env.PORT ||3000;
const TripDB = require("./modules/tripsDB.js");
const db = new TripDB();
var cors = require("cors");

app.use(cors());
app.use(express.json());

db.initialize("mongodb+srv://avjoshi1:Abhij@23@cluster0.v5jsj.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    app.listen(HTTP_PORT, ()=>{
    console.log(`server listening on: ${HTTP_PORT}`);
    });
   }).catch((err)=>{
    console.log(err);
   });

app.get('/',(req,res) =>{ 
    res.json({msg:'Your API is up'});

});

app.post("/api/trips", (req, res)=>{
    db.addNewTrip(req.body)
    .then(()=>{
        res.status(201).json({ message: "Success adding trip."});
    }).catch((err)=>{
        res.status(500).json({ message: "Error adding trip. " + err.message});
    });
});

app.get("/api/trips", (req, res) => {
    if((!req.query.page || !req.query.perPage)) res.status(500).json({message: "Missing query parameters"})
    else {
        db.getAllTrips(req.query.page, req.query.perPage)
        .then((data) => {
            if(data.length === 0) res.status(204).json({message: "No data returned"});
            else res.status(201).json(data);
        })
        .catch((err) => { res.status(500).json({error: err}) })
    }
});

app.get("/api/trips/:id", (req, res)=>{
    db.getTripById(req.params.id)
    .then((rest)=>{
        res.status(200).json(rest);
    }).catch((err)=>{
        res.status(204).json({message: "No Trips found."});
        res.status(500).json({message:"Internal server error."})    
    })
});

app.put("/api/trips/:id", (req, res)=>{
    console.log(req.body._id)
    if (req.params.id != req.body._id) {
        res.status(404).json({ message: "Resource not found" });
      }
    else {
       let result = db.updateTripById(req.body, req.params.id);
       if(result)
          res.status(201).json(result)
       else
          res.status(404).json({ message: "Resource not found" });
    }
});

app.delete("/api/trips/:id", (req, res)=>{
    if(req.params.id == req.body._id){
        db.deleteTripById(req.params.id)
        .then(()=>{
            res.status(201).json({message:"Trip deleted."});
        }).catch((err)=>{
            res.status(500).json({message:"Server error. " + err.message});
        });
    }
    res.status(204).json({message:"Restaurant not found."});
})

app.listen(HTTP_PORT, () => {
    console.log("Express http server listening on:" + HTTP_PORT);
});