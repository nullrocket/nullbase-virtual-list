import Ember from 'ember';
import layout from './template';
import VirtualList from 'nullbase-virtual-list/mixins/nb-virtual-list';
export default Ember.Component.extend(VirtualList, {
  layout,
  init(){
    this._super(...arguments);
    if ( !this.get('args') ) {
      this.set('args', {});
    }
  }
});
