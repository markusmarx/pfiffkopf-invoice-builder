import { Editor } from './editor/editor';
import { AdressSection, LetterpaperSection, PositionsSection, TestTemplate } from './testTemplate';

export function App() {
  const template = new TestTemplate();
  template.letterpaper = new LetterpaperSection();
  template.adress = new AdressSection();
  template.positions = new PositionsSection();
  //template.adress.recipentPositionXInitial = 100;
  return (
    <Editor template={template}/>
  );
}

export default App;