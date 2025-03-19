// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import NxWelcome from './nx-welcome';
import ResizableTable from "./resizeabletable";
import {MantineProvider} from "@mantine/core";

export function App() {
  return (
      <MantineProvider>
          <div>
              <ResizableTable columns={[{label: "A", accessor: "a"}, {label: "AAAAAA", accessor: "b"}]} data={[{a: "A", b: "asdf"}, {a: "B"}]}/>
          </div>
       </MantineProvider>
  );
}

export default App;
