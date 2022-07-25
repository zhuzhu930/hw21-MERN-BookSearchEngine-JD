const express = require('express');
// Add ApolloServer
const { ApolloServer } = require('apollo-server-express');

const path = require('path');
// Add typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

const db = require('./config/connection');
// Comment out the routes
// const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;
// Adding ApolloServer
const server = new ApolloServer({
  typeDefs, 
  resolvers,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Comment out the routes part
// app.use(routes);

// Adding the homeroute and send the index.html from the build folder: 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };

// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });
