import { PDFDocument } from 'pdf-lib';

export interface FormField {
  name: string;
  value: string | boolean;
}

export interface FormFillerOptions {
  fields: FormField[];
  flatten?: boolean; // Make fields non-editable after filling
}

export async function fillPDFForm(
  pdfBytes: Uint8Array,
  options: FormFillerOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  // Get all fields
  const fields = form.getFields();
  
  console.log('Available form fields:');
  fields.forEach(field => {
    const type = field.constructor.name;
    const name = field.getName();
    console.log(`  - ${name} (${type})`);
  });
  
  // Fill each field
  options.fields.forEach(fieldData => {
    try {
      const field = form.getField(fieldData.name);
      const fieldType = field.constructor.name;
      
      switch (fieldType) {
        case 'PDFTextField':
          const textField = form.getTextField(fieldData.name);
          textField.setText(fieldData.value as string);
          break;
          
        case 'PDFCheckBox':
          const checkbox = form.getCheckBox(fieldData.name);
          if (fieldData.value === true) {
            checkbox.check();
          } else {
            checkbox.uncheck();
          }
          break;
          
        case 'PDFRadioGroup':
          const radioGroup = form.getRadioGroup(fieldData.name);
          radioGroup.select(fieldData.value as string);
          break;
          
        case 'PDFDropdown':
          const dropdown = form.getDropdown(fieldData.name);
          dropdown.select(fieldData.value as string);
          break;
          
        default:
          console.warn(`Unsupported field type: ${fieldType} for field: ${fieldData.name}`);
      }
    } catch (error) {
      console.error(`Error filling field ${fieldData.name}:`, error);
    }
  });
  
  // Flatten form if requested (makes fields non-editable)
  if (options.flatten) {
    form.flatten();
  }
  
  return await pdfDoc.save();
}

// Helper to get all form fields from a PDF
export async function getFormFields(pdfBytes: Uint8Array): Promise<Array<{
  name: string;
  type: string;
  value?: string | boolean;
}>> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  return fields.map(field => {
    const name = field.getName();
    const type = field.constructor.name;
    
    let value: string | boolean | undefined;
    
    try {
      switch (type) {
        case 'PDFTextField':
          value = form.getTextField(name).getText() || '';
          break;
        case 'PDFCheckBox':
          value = form.getCheckBox(name).isChecked();
          break;
        case 'PDFRadioGroup':
          value = form.getRadioGroup(name).getSelected() || '';
          break;
        case 'PDFDropdown':
          value = form.getDropdown(name).getSelected()?.[0] || '';
          break;
      }
    } catch (error) {
      console.error(`Error reading field ${name}:`, error);
    }
    
    return { name, type, value };
  });
}

// Batch fill multiple PDFs with same data
export async function fillMultipleForms(
  pdfFiles: Uint8Array[],
  fields: FormField[],
  flatten: boolean = false
): Promise<Uint8Array[]> {
  const promises = pdfFiles.map(pdfBytes =>
    fillPDFForm(pdfBytes, { fields, flatten })
  );
  
  return await Promise.all(promises);
}
