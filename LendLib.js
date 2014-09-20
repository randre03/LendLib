lists = new Meteor.Collection('lists');

//check to see if current user is Admin
function adminUser(userId) {
  var adminUser = Meteor.users.findOne({ username: "admin" });
  return (userId && adminUser && userId === adminUser._id);
}

//user permissions
lists.allow({
  insert: function (userId, doc) {
    return ( adminUser(userId) || (userId && doc.owner === userId) );
  },

  update: function (userId, docs, fields, modifier) {
    return adminUser(userId) ||
    _.all(docs, function (doc) {
      return doc.owner === userId;
    });
  },

  remove: function (userId, docs) {
    return adminUser(userId) ||
    _.all(docs, function (doc) {
      return doc.owner === userId;
    });
  }
});