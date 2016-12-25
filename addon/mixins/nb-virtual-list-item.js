import Ember from 'ember';
import SpreadMixin from 'ember-spread'
export default Ember.Mixin.create(SpreadMixin,{
  parentER : null,

  didInsertElement: function () {
    this.set('parentER', this.get('parentView.childComponents'));

    this.get('parentView.childComponents').pushObject(this);

    this._super(...arguments);
  },
  willDestroyElement: function () {
    if (this.get('parentER')) {

      this.get('parentER').removeObject(this);
    }
    this._super(...arguments);
  }

});
