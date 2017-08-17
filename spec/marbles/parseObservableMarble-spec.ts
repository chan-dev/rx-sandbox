import { expect } from 'chai';
import { Notification } from 'rxjs/Notification';
import { parseObservableMarble } from '../../src/marbles/parseObservableMarble';
import { TestMessageValue } from '../../src/message/TestMessageValue';

describe('parseObservableMarble', () => {
  it('should not allow unsubscription token', () => {
    const marble = '----!';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse timeframe without value', () => {
    const marble = '------';

    const messages = parseObservableMarble(marble);
    expect(messages).to.be.empty;
  });

  it('should parse timeframe with value', () => {
    const marble = '-------a';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(7, Notification.createNext('a'))];

    expect(messages).to.deep.equal(expected);
  });

  it('should support custom timeframe value', () => {
    const marble = '-------a----';

    const messages = parseObservableMarble(marble, null, null, false, 10);
    const expected = [new TestMessageValue<string>(70, Notification.createNext('a'))];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse value literal', () => {
    const marble = 'x';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(0, Notification.createNext(marble))];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse value literal with custom value', () => {
    const marble = '----a----';
    const customValue = {
      a: 'qwerty'
    };

    const messages = parseObservableMarble(marble, customValue);
    const expected = [new TestMessageValue<string>(4, Notification.createNext(customValue.a))];

    expect(messages).to.deep.equal(expected);
  });

  it('should allow whitespace', () => {
    const marble = '----    ----a';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(8, Notification.createNext('a'))];

    expect(messages).to.deep.equal(expected);
  });

  it('should allow expanding timeframe', () => {
    const marble = '----...14...----a----';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(22, Notification.createNext('a'))];

    expect(messages).to.deep.equal(expected);
  });

  it('should throw if expanding timeframe does not contain values', () => {
    const marble = '----......----a----';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in expanding timeframe', () => {
    const marble = '-------...-14...-';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse simultaneous value', () => {
    //             '-------v   ----v'
    const marble = '-------(ab)----(c|)';

    const messages = parseObservableMarble(marble);
    const expected = [
      new TestMessageValue<string>(7, Notification.createNext('a')),
      new TestMessageValue<string>(7, Notification.createNext('b')),
      new TestMessageValue<string>(12, Notification.createNext('c')),
      new TestMessageValue<string>(12, Notification.createComplete())
    ];

    expect(messages).to.deep.equal(expected);
  });

  it('should throw when try to nest simultaneous value', () => {
    const marble = '-----(a(b|))';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in simultaneous value', () => {
    const marble = '-------(a-b)';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse complete', () => {
    const marble = '---a---|';

    const messages = parseObservableMarble(marble);
    const expected = [
      new TestMessageValue<string>(3, Notification.createNext('a')),
      new TestMessageValue<void>(7, Notification.createComplete())
    ];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse error', () => {
    const marble = '----#';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(4, Notification.createError('#'))];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse error with custom value', () => {
    const marble = '----#---';
    const error = 'meh';

    const messages = parseObservableMarble(marble, null, error);
    const expected = [new TestMessageValue<string>(4, Notification.createError(error))];

    expect(messages).to.deep.equal(expected);
  });

  it('should support subscription offset', () => {
    const marble = '----^----a----';

    const messages = parseObservableMarble(marble);
    const expected = [new TestMessageValue<string>(8, Notification.createNext('a'))];

    expect(messages).to.deep.equal(expected);
  });
});
