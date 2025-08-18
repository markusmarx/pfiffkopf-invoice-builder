import { Editor } from './editor/editor';
import {
  AddressSection,
  LetterpaperSection,
  PositionsSection,
  PfkInvoiceTemplate,
  InvoiceParamSection
} from './pfkInvoiceTemplate';

export function App() {

  const template = new PfkInvoiceTemplate();

  template.letterpaper = new LetterpaperSection(template);
  template.address = new AddressSection();
  template.address.pos.x = 0;
  template.invoiceParam = new InvoiceParamSection();
  template.invoiceParam.pos.x = 418;
  template.positions = new PositionsSection();
  template.positions.pos.x = 0;
  template.positions.pos.y = 400;
  template.positions.size.x = 718;
  template.positions.size.y = 100;

  return (
    <Editor template={template} />
  );
}

export default App;
