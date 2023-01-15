import schemaFile from '../../../../data/schema.json'
import type { Imgix } from '../types/imgix';

function getSchema(): Imgix {
  return <Imgix>schemaFile;
}

export const schema = getSchema();
