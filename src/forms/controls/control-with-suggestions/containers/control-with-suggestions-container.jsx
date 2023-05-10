import withCurrentFormVariables from 'hoc/with-current-form-variables';

import InputWithSuggestions from '../components/input-with-suggestions';
import RichEditor from '../components/rich-editor';
import SimpleEditor from '../components/simple-editor';

export const InputWithSuggestionsContainer =
  withCurrentFormVariables(InputWithSuggestions);

export const RichEditorContainer = withCurrentFormVariables(RichEditor);

export const SimpleEditorContainer = withCurrentFormVariables(SimpleEditor);
