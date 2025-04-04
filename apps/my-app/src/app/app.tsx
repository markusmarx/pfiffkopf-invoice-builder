import { Editor } from './editor/editor';
import { HeaderSection, LetterpaperSection, TestTemplate } from './testTemplate';

export function App() {
  const template = new TestTemplate();
  template.letterpaper = new LetterpaperSection();
  template.header = new HeaderSection();
  return (
    <Editor template={template}/>
  );
}

export default App;