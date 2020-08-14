import './bootstrap.js'
import CMS, { init } from 'netlify-cms'
import 'netlify-cms/dist/cms.css'
import { Control, Preview, Schema } from '../src'

const config = {
  backend: {
    name: 'test-repo',
    login: false,
  },
  media_folder: 'assets',
  collections: [{
    name: 'test',
    label: 'Test',
    files: [{
      file: 'test.yml',
      name: 'test',
      label: 'Test',
      fields: [
        { name: 'test_widget', label: 'Test Widget', widget: 'image_dimensions', exact_width: 1135, validation: "Image must be at least 1135px in width"},
      ],
    }],
  }],
}

CMS.registerWidget('image_dimensions', Control, Preview, Schema)

init({ config })
