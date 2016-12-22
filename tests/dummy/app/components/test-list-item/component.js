/* global $ */
import Ember from 'ember';
import VirtualListItem from "nullbase-virtual-list/mixins/nb-virtual-list-item";
export default Ember.Component.extend(VirtualListItem, {
  classNames:['test-item','elevation-1dp'],
  num:0,
  attributeBindings:["touchAction:touch-action"],
  touchAction:"none"

});
