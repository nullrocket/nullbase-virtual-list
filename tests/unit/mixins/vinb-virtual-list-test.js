import Ember from 'ember';
import VinbVirtualListMixin from 'nullbase-virtual-list/mixins/vinb-virtual-list';
import { module, test } from 'qunit';

module('Unit | Mixin | vinb virtual list');

// Replace this with your real tests.
test('it works', function(assert) {
  let VinbVirtualListObject = Ember.Object.extend(VinbVirtualListMixin);
  let subject = VinbVirtualListObject.create();
  assert.ok(subject);
});
