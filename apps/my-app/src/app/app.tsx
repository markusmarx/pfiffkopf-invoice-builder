// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import NxWelcome from './nx-welcome';
import ResizableTable from "./resizeabletable";

export function App() {
  return (
    <div>
      <ResizableTable columns={[{label: "A", accessor: "a"}, {label: "AAAAAA", accessor: "b"}]} data={[{a: "A", b: "asdf"}, {a: "B"}]}/>
    </div>
  );
}

export default App;
