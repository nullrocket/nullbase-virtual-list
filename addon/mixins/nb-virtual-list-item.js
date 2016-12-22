import Ember from 'ember';
export default Ember.Mixin.create({
  parentER : null,

  didInsertElement: function () {
    this.set('parentER', this.get('parentView.childComponents'));

    this.get('parentView.childComponents').pushObject(this);

    this._super();
  },
  willDestroyElement: function () {
    if (this.get('parentER')) {

      this.get('parentER').removeObject(this);
    }
    this._super();
  }

});
