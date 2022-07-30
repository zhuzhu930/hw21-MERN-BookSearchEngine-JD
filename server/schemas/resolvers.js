const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  // Queries: 
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
        .slect('-__v -password')
        return userData;
      }
      throw new AuthenticationError('You are not logged in');
    },
    users: async () => {
      return User.find().populate('books');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('books');
    },
    books: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Book.find(params).sort({ createdAt: -1 });
    },
    book: async (parent, { bookId }) => {
      return Book.findOne({ _id: bookId });
    },
  },
  //Mutations: 
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      // First we create the user
      const user = await User.create({ username, email, password });
      // To reduce friction for the user, we immediately sign a JSON Web Token and log the user in after they are created
      const token = signToken(user);
      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      // Look up the user by the provided email address. Since the `email` field is unique, we know that only one person will exist with that email
      const user = await User.findOne({ email });

      // If there is no user with that email address, return an Authentication error stating so
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      // If there is a user found, execute the `isCorrectPassword` instance method and check if the correct password was provided
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, return an Authentication error stating so
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // If email and password are correct, sign user into the application with a JWT
      const token = signToken(user);

      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    // saveBook: async (parent, { authors, description, title, bookId, image, link }) => {
    //   const book = await Book.create({ authors, description, title, bookId, image, link });

    //   await User.findOneAndUpdate(
    //     { email },
    //     { $addToSet: { savedBooks: book._id } },
    //     { new: true }
    //   );

    //   return book;
    // },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book }},
          { new: true }
        )
        return updatedUser;
      }
      throw new AuthenticationError('Please log in!')
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId }}},
          { new: true }
          )
          return updatedUser;
      }
      // return Book.findOneAndDelete({ _id: bookId });
    },
  },
};

module.exports = resolvers;
