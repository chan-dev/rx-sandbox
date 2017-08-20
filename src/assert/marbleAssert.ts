import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { TestMessage } from '../message/TestMessage';
import { constructSubscriptionMarble } from './constructSubscriptionMarble';

const observableMarbleAssert = (_source: Array<TestMessage>) => (_expected: Array<TestMessage>) => {
  throw new Error('not impl');
};

const subscriptionMarbleAssert = (source: SubscriptionLog) => (expected: SubscriptionLog) => {
  if (!(expected instanceof SubscriptionLog)) {
    throw new Error('Expected value is not SubscriptionLog');
  }

  const sourceMarble = constructSubscriptionMarble(source);
  const expectedMarble = constructSubscriptionMarble(expected);

  if (sourceMarble !== expectedMarble) {
    throw new Error('unmatch!');
  }
};

function marbleAssert(source: SubscriptionLog): { to: { equal(expected: SubscriptionLog): void } };
function marbleAssert(source: Array<TestMessage>): { to: { equal(expected: Array<TestMessage>): void } };
function marbleAssert(source: SubscriptionLog | Array<TestMessage>): { to: { equal(expected: object): void } } {
  const isSourceArray = Array.isArray(source);
  const isSourceSubscription = source instanceof SubscriptionLog;

  if (!isSourceArray && !isSourceSubscription) {
    throw new Error('Source is neither array nor SubscriptionLog, cannot assert');
  }

  return {
    to: {
      equal: isSourceSubscription
        ? subscriptionMarbleAssert(source as SubscriptionLog)
        : observableMarbleAssert(source as Array<TestMessage>)
    }
  };
}

export { marbleAssert, constructSubscriptionMarble };
