// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { Editor } from './editor/editor';
import {MantineProvider} from "@mantine/core";
import { TestTemplate } from './testTemplate';

export function App() {
  const template : TestTemplate = {
    letterpaper : {
      bold: true,
      watermark: "",
      test: 0
    }
  };
  return (
      <MantineProvider>
          <Editor template={template}/>
       </MantineProvider>
  );
}

export default App;
