import Ember from 'ember';

export default Ember.Route.extend({

  appState: Ember.inject.service('app-state'),
  actions: {
    alert(){
      console.log('alert',...arguments);
    },
    toggleLeftSidebar(){
      this.set('appState.isLeftSidebarOpen', !this.get('appState.isLeftSidebarOpen'));
    },
    toggleRightSidebar(){
      this.set('appState.isRightSidebarOpen', !this.get('appState.isRightSidebarOpen'));
    },
    toggleNestedLeftSidebar(){

      this.set('appState.isNestedLeftSidebarOpen', !this.get('appState.isNestedLeftSidebarOpen'));
    },
    toggleNestedRightSidebar(){
      this.set('appState.isNestedRightSidebarOpen', !this.get('appState.isNestedRightSidebarOpen'));
    }
  },
  renderTemplate(){

    this._super(...arguments);
  /*  this.render('dummy-sidebar', {
      outlet: 'left-sidebar',
      into: 'application'
    });*/
    this.render('content', {
      outlet: 'content',
      into: 'application'
    });
    this.render('header-content', {
      outlet: "header-content",
      into: 'application'
    });
    /*this.render('dummy-right-sidebar', {
      outlet: 'right-sidebar',
      into: 'application'
    });

    var self = this;

    this.render('nested-header-content', {
      outlet: "another-header-content",
      into: 'dummy-content'
    });
    this.render('nested-right-sidebar-content', {
      outlet: "right-sidebar",
      into: 'dummy-content'
    });

    this.render('nested-left-sidebar-content', {
      outlet: "left-sidebar",
      into: 'dummy-content'
    });
    this.render('nested-content', {
      outlet: "content",
      into: 'dummy-content'
    });*/
  }
});
