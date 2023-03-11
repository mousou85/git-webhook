import * as fs from 'fs';
import * as path from 'path';

import * as yaml from 'js-yaml';

export default () => {
  return yaml.load(fs.readFileSync(path.join(__dirname, 'app.config.yaml'), 'utf8')) as Record<
    string,
    any
  >;
};
