const express = require('express');
// Add ApolloServer
const { ApolloServer } = require('apollo-server-express');

const path = require('path');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');


const db = require('./config/connection');
const PORT = process.env.PORT || 3001;

const app = express();

// Adding ApolloServer
const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: authMiddleware
});

// parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

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

startApolloServer(typeDefs, resolvers);

// db.once('open', () => {
//   app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
// });
