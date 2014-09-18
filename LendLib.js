lists = new Meteor.Collection('lists'); //new list

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  //Template.hello.helpers({
  //  counter: function () {
  //    return Session.get("counter");
  //  }
  //});
  //
  //Template.hello.events({
  //  'click button': function () {
  //    // increment the counter when button is clicked
  //    Session.set("counter", Session.get("counter") + 1);
  //  }
  //});
    Template.categories.lists = function () {
      return lists.find({}, {sort: {Category: 1}});
    };

    //declaration of the add category flag
    Session.set('adding_category', false);

    Template.categories.new_cat = function () {
        return Session.equals('adding_category', true);
    };

    Template.categories.events({
        'click #btnNewCat': function (e, t) {
            Session.set('adding_category', true);
            Meteor.flush();//cleans up anything "strange" by "flushing" the DOM
            focusText(t.find("#add-category")); //sets the focus on the input box
        },

        'keyup #add-category': function (e, t) {
            if(e === 13) {
                var catVal = String(e.target.value || ''); //checks to see if the input field has anything in it
                if(catVal) {
                    lists.insert({Category: catVal}); //inserts the value from the input field into the list
                    Session.set('adding_category', false);//this is how to hide the input field
                }
            }
        },

        'focusout #add-category': function (e, t) {
            Session.set('adding_category', false);//hides the input box if you click away from it
        },

        'click .category': selectCategory   //adds a click event for all css selects with a "category" class
                                            //and calls the function 'selectCategory
    });

    /////Generic Helper Functions\\\\\
    //this function positions the cursor where it should be
    function focusText(i, val) {
        i.focus();
        i.value = val ? val : '';
        i.select();
    }

    function selectCategory(e, t) {
        Session.set('current_list', this._id);
    }

    function addItems(list_id, item_name) {
        if (!item_name && !List_id)
            return;
        lists.update({_id: list_id}, {$addToSet: {items: {Name: item_name}}});
    }

    function removeItem(list_id, item_name) {
        if (!item_name && !List_id)
            return;
        lists.update({_id: list_id}, {$pull: {items: {Name: item_name}}});
    }

    function updateLendee(list_id, item_name, lendee_name) {
        var l = lists.findOne({"_id": list_id, "items.Name": item_name});
        if(l && l.items) {
            for(var i=0; i< l.items.length; i++) {
                if(l.items[i].Name === item_name) {
                    l.items[i].LentTo = lendee_name;
                }
            }
            lists.update({"_id": list_id}, {$set:{"items":l.items}});
        }
    }

    Template.list.items = function () {
        if(Session.equals('current_list', null)) return null; //is a list selected
        else {
            var cats = lists.findOne({_id: Session.get('current_list')}); //cats is short for the 'category'
            if(cats && cats.items) { //make sure something exists before doing work
                for (var i=0; i<cats.items.length; i++) {
                    var d = cats.items[i];
                    d.Lendee = d.LentTo ? d.lentTo : "free";
                    d.LendClass = d.LentTo ? "label-important" : "label-success";
                }
                return cats.items;
            }
        }
    };

    Template.list.list_selected = function () {
        return ((Session.get('current_list')!=null) && (!Session.equals('current_list', null)));
    };

    Template.categories.list_status = function () {
        if(Session.equals('current_list', this._id))
            return '';
        else
            return " btn-inverse";
    };

    Template.list.list_adding = function () {
        return (Session.equals('list_adding', true));
    };

    Template.list.lendee_editing = function () {
        return (Session.equals('lendee_input', this.Name));
    };

    Template.list.events({
        'click #btnAddItem': function (e, t) {
            Session.set('list_adding, true');
            Meteor.flush();
            focusText(t.find('#item_to_add'));
        },

        'keyup #item_to_add': function (e,t){
            if (e.which === 13) {
                addItem(Session.get('current_list'),e.target.value);           
                Session.set('list_adding',false);
            }   
        },   

        'focusout #item_to_add': function(e,t) {
            Session.set('list_adding',false);   
        },   

        'click .delete_item': function(e,t) {     
            removeItem(Session.get('current_list'),e.target.id);   
        },
                   
        'click .lendee' : function(e,t) {     
            Session.set('lendee_input',this.Name);         
            Meteor.flush();     
            focusText(t.find("#edit_lendee"),this.LentTo);   
        },
                   
        'keyup #edit_lendee': function (e,t){     
            if (e.which === 13) {
                updateLendee(Session.get('current_list'),this.Name,       
                e.target.value);       
                Session.set('lendee_input',null);     
            }     
            if (e.which === 27) {       
                Session.set('lendee_input',null);           
            }   
        }
    });


};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
