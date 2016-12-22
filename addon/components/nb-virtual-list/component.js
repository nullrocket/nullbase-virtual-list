import Ember from 'ember';
import layout from './template';
import VirtualList from 'nullbase-virtual-list/mixins/nb-virtual-list';
export default Ember.Component.extend(VirtualList,{
  layout
});
