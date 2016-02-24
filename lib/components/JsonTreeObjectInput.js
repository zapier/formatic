import React from 'react';
import _ from 'lodash';

import JsonTreeObjectInputView from './JsonTreeObjectInputView';

const buildKeyToPairs = pairs => {
  const keyToPairs = {};
  pairs.forEach(pair => {
    if (!keyToPairs[pair.key]) {
      keyToPairs[pair.key] = [];
    }
    keyToPairs[pair.key].push(pair);
  });
  return keyToPairs;
};

const removePair = (pairs, pair) => {
  const index = _.findIndex(pairs, eachPair => eachPair.id === pair.id);
  const newPairs = [...pairs];
  newPairs.splice(index, 1);
  return newPairs;
};

const JsonTreeObjectInput = React.createClass({

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      view: JsonTreeObjectInputView
    };
  },

  getInitialState() {
    return {
      invalidKeys: {}
    };
  },

  isValid(invalidKeys = this.state.invalidKeys) {
    return Object.keys(invalidKeys).length > 0;
  },

  nextPairId() {
    if (!this._nextPairId) {
      this._nextPairId = 1;
    }
    const { _nextPairId } = this;
    this._nextPairId++;
    return _nextPairId;
  },

  buildPairs(obj) {
    if (!_.isObject(obj)) {
      obj = {};
    }
    const { keyToPairs } = this;
    return _.pairs(obj)
      .map(([key, value]) => ({
        id: keyToPairs[key] && keyToPairs[key][0].id || this.nextPairId(),
        key,
        value
      }));
  },

  componentWillMount() {
    const { value } = this.props;
    const pairs = this.buildPairs(value);
    this.setState({
      pairs
    });
    this.keyToPairs = buildKeyToPairs(pairs);
  },

  componentWillReceiveProps(nextProps) {
    let { value: nextValue } = nextProps;
    const { value: prevValue } = this.props;
    if (nextValue !== prevValue) {
      if (this.isValid()) {
        const pairs = this.buildPairs(nextValue);
        this.setState({
          pairs
        });
        this.keyToPairs = buildKeyToPairs(pairs);
      } else {
        const updatedPairs = [...this.state.pairs];
        updatedPairs.forEach((pair, i) => {
          // Only update the value if we don't have multiples of this key.
          if (this.keyToPairs[pair.key].length === 1) {
            if (pair.value !== nextValue[pair.key]) {
              updatedPairs[i] = {
                ...updatedPairs[i],
                value: nextValue[pair.key]
              };
            }
          }
        });
        // Get new pairs.
        const newObj = _.object(
          _.pairs(nextValue)
            .filter(([key]) => !this.keyToPairs[key])
        );
        const newPairs = this.buildPairs(newObj);
        // Combine pairs.
        const pairs = updatedPairs.concat(newPairs);
        this.setState({
          pairs
        });
        this.keyToPairs = buildKeyToPairs(pairs);
      }
    }
  },

  value(pairs) {
    return _.object(
      pairs.map(({key, value}) => [
        key,
        value
      ])
    );
  },

  onAddProperty() {
    const newPair = {
      id: this.nextPairId(),
      key: '',
      value: ''
    };
    const pairs = [...this.state.pairs];
    const newPairs = pairs.concat(newPair);
    const { invalidKeys } = this.state;
    if (this.keyToPairs['']) {
      this.keyToPairs[''].push(newPair);
      this.setState({
        invalidKeys: {...invalidKeys, '': true},
        pairs: newPairs
      });
    } else {
      this.keyToPairs[''] = [newPair];
      const { onChange } = this.props;
      onChange(this.value(newPairs));
    }
  },

  onRemoveProperty(pairKey) {

  },

  onChangePropertyKey(key, {inputKey: index}) {
    const newPairs = [...this.state.pairs];
    const pair = newPairs[index];
    if (pair.key !== key) {
      const newPair = {...pair};

    }
  },

  onChangePropertyValue(value, {inputKey}) {

  },

  render() {
    const { pairs } = this.state;
    const { view: View } = this.props;
    return (
      <View pairs={pairs}
        onAddProperty={this.onAddProperty}
        onRemoveProperty={this.onRemoveProperty}
        onChangePropertyKey={this.onChangePropertyKey}
        onChangePropertyValue={this.onChangePropertyValue}
      />
    );
  }
});

export default JsonTreeObjectInput;
