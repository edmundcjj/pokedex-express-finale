
/**
 * Entry point to Express web server.
 *
 * Import external library modules as needed (eg. body-parser, etc).
 */
 const express = require('express');
 const handlebars = require('express-handlebars');
 const bodyParser = require('body-parser');
 const methodOverride = require('method-override');
 const cookieParser = require('cookie-parser');
 const db = require('./db');

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */
 // Init express app
 const app = express();

 // Set up middleware
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(methodOverride('_method'));
 app.use(cookieParser());

 // Set handlebars to be the default view engine
 app.engine('handlebars', handlebars.create().engine);
 app.set('view engine', 'handlebars');

/**
 * ===================================
 * Routes
 * ===================================
 */
 // Import routes to match incoming requests
 require('./routes')(app, db);

 // Root GET request (it doesn't belong in any controller file)
 // To display the list of pokemon names for the default page
 app.get('/', (request, response) => {
   let loggedIn = request.cookies['loggedIn'];
   let username = request.cookies['username'];

   db.pool.query('SELECT * FROM pokemons ORDER BY id', (error, queryResult) => {
     if (error) console.error('error!', error);

     let context = {
       loggedIn: loggedIn,
       username: username,
       pokemon: queryResult.rows
     };

     response.render('home', context);
   });
 });

 // Catch all unmatched requests and return 404 not found page
 app.get('*', (request, response) => {
   response.render('404');
 });

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

// Run clean up actions when server shuts down
server.on('close', () => {
  console.log('Closed express server');

  // close database connection pool
  db.pool.end(() => {
    console.log('Shut down db connection pool');
  });
});
