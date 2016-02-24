import TextInput from './components/TextInput';
import TextInputView from './components/TextInputView';
import DomTextInput from './components/DomTextInput';
import DomTextInputView from './components/DomTextInputView';

import TextareaInput from './components/TextareaInput';
import TextareaInputView from './components/TextareaInputView';
import DomTextareaInput from './components/DomTextareaInput';
import DomTextareaInputView from './components/DomTextareaInputView';

import SelectInput from './components/SelectInput';
import SelectInputView from './components/SelectInputView';
import DomSelectInput from './components/DomSelectInput';
import DomSelectInputView from './components/DomSelectInputView';

import SelectMultipleInput from './components/SelectMultipleInput';
import SelectMultipleInputView from './components/SelectMultipleInputView';
import DomSelectMultipleInput from './components/DomSelectMultipleInput';
import DomSelectMultipleInputView from './components/DomSelectMultipleInputView';

import JsonInput from './components/JsonInput';
import JsonInputView from './components/JsonInputView';

const defaultPlugin = () => {
  return {
    TextInput,
    TextInputView,
    DomTextInput,
    DomTextInputView,

    TextareaInput,
    TextareaInputView,
    DomTextareaInput,
    DomTextareaInputView,

    SelectInput,
    SelectInputView,
    DomSelectInput,
    DomSelectInputView,

    SelectMultipleInput,
    SelectMultipleInputView,
    DomSelectMultipleInput,
    DomSelectMultipleInputView,

    JsonInput,
    JsonInputView
  };
};

export default defaultPlugin;
