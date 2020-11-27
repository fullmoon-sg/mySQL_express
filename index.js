const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const fs = require("fs"); // import in the file system
const mysql = require("mysql2/promise");

let app = express();
// set which view engine to use
app.set("view engine", "hbs");

// set where to find the static files
app.use(express.static("public"));

// setup wax on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// setup forms
app.use(
  express.urlencoded({
    extended: false,
  })
);

const helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});

async function main() {
  //create the connection is an asynchronous procedure,
  //so we must use await
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "sakila",
  });

  app.get("/actors", async (req, res) => {
    let [actors, fields] = await connection.execute("select * from actor");
    res.render("actors.hbs", {
      actors: actors,
    });
  });

  app.get('/actor/create', async (req,res)=>{
      res.render('create_actor.hbs');
  })

  app.post('/actor/create', async(req,res) => {
      let firstName = req.body.first_name;
      let lastName = req.body.last_name;

      await connection.execute(`insert into actor (first_name,last_name)
      values (?,?)`,[firstName,lastName]);
      res.redirect('/');
  });

  //the :actor_id placeholder is for the url to specify which actor we are editing
  app.get('/actor/:action_id/update',async(req,res) => {
      let [actors] = await connection.execute("select * from actor where actor_id = ?",
      [req.params.actor_id]);
      let theActor = actors[0];
    res.render('edit_actor.hbs', {
        'actor' : theActor,
    });
  })

app.post('/actor/:action_id/update', async(req,res) => {
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let actorId = req.params.action_id;

    await connection.execute(`update actor set first_name = ?, lastname=> 
    WHERE actor_id= ?`,firstName,lastName,actorId);
    res.redirect('/');
})

app.get('/actor/:actor_id/delete', async(req,res) => {
    let theActorToDelete = req.params.actor_id;
    //But we will always get an array back from connection execute even if there is only one result
    let [actors] = await connection.execute(`select * from actor where actor_id =?`,[theActorToDelete]);
    let theActor = actors[0];
    res.render('delete_actor.hbs', {
        'actor' : theActor
    })
})

app.post('/actor/:actor_id/delete', async (req,res) => {
    let actor_id = req.params.actor_id;
    await connection.execute('delte from actor where actor_id = ?',[actor_id]);
    res.redirect('/')
     })


  app.get("/countries", async (req, res) => {
    let [countries] = await connection.execute("select * from country");
    res.render("countries.hbs", {
      xyz: countries,
    });
  });

  app.get('/countries/create',async (req,res) => {
        res.render('create_country.hbs');
  })

  app.post('/countries/create', async (req,res) => {
      let country = req.body.country;
      await connection.execute('insert into country (country) values (?)',[country]);
      res.redirect('/countries');
  })

  app.get('/countries/:country_id/update', async (req,res) => {
      let [country] = await connection.execute(`select * from country where 
      country_id = ?`,[req.params.country_id]);
      let theCountry = country[0];
      res.render('edit_country.hbs', {
          'country' : theCountry,
      })
    })

app.post('/countries/:country_id/update', async (req,res) => {
    let count = req.body.country;
    let countryId = req.params.country_id;
    await connection.execute(`update country set country = ? 
    where country_id = ?`,[count,countryId]); 
    res.redirect('/countries');
})

app.get('/countries/:country_id/delete', async (req,res) => {
    let countryToDelete = req.params.country_id;
    let [country] = await connection.execute('select * from country where country_id = ?', [countryToDelete]);
    let theCountry = country[0];
    res.render('delete_country.hbs',{
    'country' : theCountry
    })
})

app.post('/countries/:country_id/delete', async (req,res) => {
    let country_id = req.params.country_id;
    await connection.execute('delete from country where country_id = ?', [country_id]);
    res.redirect('/countries');
})

  app.get("/languages", async (req,res) => {
      let [languages] = await connection.execute("select * from language");
      res.render("languages.hbs", {
          'languages' : languages,
      })
  })

  app.get("/store", async(req,res) => {
      let [stores_add_staff] = await connection.execute(`select staff.first_name, 
      staff.last_name, store.address_id, address.address, address.phone from store 
      join address ON store.address_id = address.address_id JOIN staff ON 
      store.manager_staff_id = staff.staff_id`);
      res.render("store_add_staff.hbs", {
          "stores_add_staff" : stores_add_staff,
      })
  })
} // end main

main();

app.listen(3000, () => {
  console.log("Server started");
});
