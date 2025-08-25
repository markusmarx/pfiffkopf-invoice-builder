import { Editor } from './editor/editor';
import {
  RecipentSection,
  DocumentSection,
  PositionsSection,
  PfkInvoiceTemplate,
  InvoiceParamSection,
} from './pfkInvoiceTemplate';

export function App() {
  const template = new PfkInvoiceTemplate();

  template.letterpaper = new DocumentSection(template);
  template.address = new RecipentSection();
  template.address.pos.x = 0;
  template.invoice = new InvoiceParamSection();
  template.invoice.pos.x = 418;
  template.table = new PositionsSection();
  template.table.pos.x = 0;
  template.table.pos.y = 400;
  template.table.size.x = 718;
  template.table.size.y = 100;

  return <Editor template={template} />;
}

export default App;
