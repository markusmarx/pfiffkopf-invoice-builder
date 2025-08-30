import { Editor } from './editor/editor';
import {
  RecipentSection,
  DocumentSection,
  TableSection,
  PfkInvoiceTemplate,
  InvoiceSection,
  LogoSection,
} from './template/pfkInvoiceTemplate';

export function App() {
  const template = new PfkInvoiceTemplate();

  template.letterpaper = new DocumentSection(template);
  template.address = new RecipentSection();
  template.address.pos.x = 0;
  template.invoice = new InvoiceSection();
  template.invoice.pos.x = 418;
  template.table = new TableSection();
  template.table.pos.x = 0;
  template.table.pos.y = 400;
  template.table.size.x = 718;
  template.table.size.y = 100;
  template.logo = new LogoSection();

  return <Editor template={template} />;
}

export default App;
