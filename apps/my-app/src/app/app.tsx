// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { Editor } from './editor/editor';
import { TestTemplate } from './testTemplate';

export function App() {
  const template : TestTemplate = new TestTemplate();
  template.letterpaper = {
    bold: true,
    watermark: "",
    test: 0
  };
  template.header = {
    boldX: true,
    watermarkX: "",
    testX: 1
  };
  return (
    <Editor template={template}/>
  );
}

export default App;