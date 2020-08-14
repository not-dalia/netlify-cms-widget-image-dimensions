import withFileControl from './Control'
import Preview from './Preview'
import Schema from './Schema'

const controlComponent = withFileControl({ forImage: true });
if (typeof window !== 'undefined') {
  window.ImageDimensionsControl = controlComponent
  window.ImageDimensionsPreview = Preview
  window.ImageDimensionsSchema = Schema
}

export { ImageDimensionsControl, ImageDimensionsPreview, ImageDimensionsSchema }
