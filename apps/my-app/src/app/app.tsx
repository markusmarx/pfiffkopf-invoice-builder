import { Editor } from './editor/editor';
import { AdressSection, LetterpaperSection, TestTemplate } from './testTemplate';

export function App() {
  const template = new TestTemplate();
  template.letterpaper = new LetterpaperSection();
  template.adress = new AdressSection();
  return (
    <Editor template={template}/>
  );
}

export default App;